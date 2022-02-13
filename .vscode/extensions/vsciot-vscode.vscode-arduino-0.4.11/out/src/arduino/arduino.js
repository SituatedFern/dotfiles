"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArduinoApp = exports.BuildMode = void 0;
const fs = require("fs");
const glob = require("glob");
const os = require("os");
const path = require("path");
const vscode = require("vscode");
const constants = require("../common/constants");
const util = require("../common/util");
const logger = require("../logger/logger");
const deviceContext_1 = require("../deviceContext");
const intellisense_1 = require("./intellisense");
const vscodeSettings_1 = require("./vscodeSettings");
const outputChannel_1 = require("../common/outputChannel");
const workspace_1 = require("../common/workspace");
const serialMonitor_1 = require("../serialmonitor/serialMonitor");
const usbDetector_1 = require("../serialmonitor/usbDetector");
/**
 * Supported build modes. For further explanation see the documentation
 * of ArduinoApp.build().
 * The strings are used for status reporting within the above function.
 */
var BuildMode;
(function (BuildMode) {
    BuildMode["Verify"] = "Verifying";
    BuildMode["Analyze"] = "Analyzing";
    BuildMode["Upload"] = "Uploading";
    BuildMode["CliUpload"] = "Uploading using Arduino CLI";
    BuildMode["UploadProgrammer"] = "Uploading (programmer)";
    BuildMode["CliUploadProgrammer"] = "Uploading (programmer) using Arduino CLI";
})(BuildMode = exports.BuildMode || (exports.BuildMode = {}));
/**
 * Represent an Arduino application based on the official Arduino IDE.
 */
class ArduinoApp {
    /**
     * @param {IArduinoSettings} _settings ArduinoSetting object.
     */
    constructor(_settings) {
        this._settings = _settings;
        /**
         * Indicates if a build is currently in progress.
         * If so any call to this.build() will return false immediately.
         */
        this._building = false;
        const analysisDelayMs = 1000 * 3;
        this._analysisManager = new intellisense_1.AnalysisManager(() => this._building, () => __awaiter(this, void 0, void 0, function* () { yield this.build(BuildMode.Analyze); }), analysisDelayMs);
    }
    /**
     * Need refresh Arduino IDE's setting when starting up.
     * @param {boolean} force - Whether force initialize the arduino
     */
    initialize(force = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!util.fileExistsSync(this._settings.preferencePath)) {
                try {
                    // Use empty pref value to initialize preference.txt file
                    yield this.setPref("boardsmanager.additional.urls", "");
                    this._settings.reloadPreferences(); // reload preferences.
                }
                catch (ex) {
                }
            }
            if (force || !util.fileExistsSync(path.join(this._settings.packagePath, "package_index.json"))) {
                try {
                    // Use the dummy package to initialize the Arduino IDE
                    yield this.installBoard("dummy", "", "", true);
                }
                catch (ex) {
                }
            }
            // set up event handling for IntelliSense analysis
            const requestAnalysis = () => __awaiter(this, void 0, void 0, function* () {
                if (intellisense_1.isCompilerParserEnabled()) {
                    yield this._analysisManager.requestAnalysis();
                }
            });
            const dc = deviceContext_1.DeviceContext.getInstance();
            dc.onChangeBoard(requestAnalysis);
            dc.onChangeConfiguration(requestAnalysis);
            dc.onChangeSketch(requestAnalysis);
        });
    }
    /**
     * Initialize the arduino library.
     * @param {boolean} force - Whether force refresh library index file
     */
    initializeLibrary(force = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (force || !util.fileExistsSync(path.join(this._settings.packagePath, "library_index.json"))) {
                try {
                    // Use the dummy library to initialize the Arduino IDE
                    yield this.installLibrary("dummy", "", true);
                }
                catch (ex) {
                }
            }
        });
    }
    /**
     * Set the Arduino preferences value.
     * @param {string} key - The preference key
     * @param {string} value - The preference value
     */
    setPref(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.useArduinoCli()) {
                    yield util.spawn(this._settings.commandPath, ["--build-property", `${key}=${value}`]);
                }
                else {
                    yield util.spawn(this._settings.commandPath, ["--pref", `${key}=${value}`, "--save-prefs"]);
                }
            }
            catch (ex) {
            }
        });
    }
    /**
     * Returns true if a build is currently in progress.
     */
    get building() {
        return this._building;
    }
    /**
     * Runs the arduino builder to build/compile and - if necessary - upload
     * the current sketch.
     * @param buildMode Build mode.
     *  * BuildMode.Upload: Compile and upload
     *  * BuildMode.UploadProgrammer: Compile and upload using the user
     *     selectable programmer
     *  * BuildMode.Analyze: Compile, analyze the output and generate
     *     IntelliSense configuration from it.
     *  * BuildMode.Verify: Just compile.
     * All build modes except for BuildMode.Analyze run interactively, i.e. if
     * something is missing, it tries to query the user for the missing piece
     * of information (sketch, board, etc.). Analyze runs non interactively and
     * just returns false.
     * @param buildDir Override the build directory set by the project settings
     * with the given directory.
     * @returns true on success, false if
     *  * another build is currently in progress
     *  * board- or programmer-manager aren't initialized yet
     *  * or something went wrong during the build
     */
    build(buildMode, buildDir) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._boardManager || !this._programmerManager || this._building) {
                return false;
            }
            this._building = true;
            return yield this._build(buildMode, buildDir)
                .then((ret) => {
                this._building = false;
                return ret;
            })
                .catch((reason) => {
                this._building = false;
                logger.notifyUserError("ArduinoApp.build", reason, `Unhandled exception when cleaning up build "${buildMode}": ${JSON.stringify(reason)}`);
                return false;
            });
        });
    }
    // Include the *.h header files from selected library to the arduino sketch.
    includeLibrary(libraryPath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!workspace_1.ArduinoWorkspace.rootPath) {
                return;
            }
            const dc = deviceContext_1.DeviceContext.getInstance();
            const appPath = path.join(workspace_1.ArduinoWorkspace.rootPath, dc.sketch);
            if (util.fileExistsSync(appPath)) {
                const hFiles = glob.sync(`${libraryPath}/*.h`, {
                    nodir: true,
                    matchBase: true,
                });
                const hIncludes = hFiles.map((hFile) => {
                    return `#include <${path.basename(hFile)}>`;
                }).join(os.EOL);
                // Open the sketch and bring up it to current visible view.
                const textDocument = yield vscode.workspace.openTextDocument(appPath);
                yield vscode.window.showTextDocument(textDocument, vscode.ViewColumn.One, true);
                const activeEditor = vscode.window.visibleTextEditors.find((textEditor) => {
                    return path.resolve(textEditor.document.fileName) === path.resolve(appPath);
                });
                if (activeEditor) {
                    // Insert *.h at the beginning of the sketch code.
                    yield activeEditor.edit((editBuilder) => {
                        editBuilder.insert(new vscode.Position(0, 0), `${hIncludes}${os.EOL}${os.EOL}`);
                    });
                }
            }
        });
    }
    /**
     * Installs arduino board package.
     * (If using the aduino CLI this installs the corrosponding core.)
     * @param {string} packageName - board vendor
     * @param {string} arch - board architecture
     * @param {string} version - version of board package or core to download
     * @param {boolean} [showOutput=true] - show raw output from command
     */
    installBoard(packageName, arch = "", version = "", showOutput = true) {
        return __awaiter(this, void 0, void 0, function* () {
            outputChannel_1.arduinoChannel.show();
            const updatingIndex = packageName === "dummy" && !arch && !version;
            if (updatingIndex) {
                outputChannel_1.arduinoChannel.start(`Update package index files...`);
            }
            else {
                try {
                    const packagePath = path.join(this._settings.packagePath, "packages", packageName, arch);
                    if (util.directoryExistsSync(packagePath)) {
                        util.rmdirRecursivelySync(packagePath);
                    }
                    outputChannel_1.arduinoChannel.start(`Install package - ${packageName}...`);
                }
                catch (error) {
                    outputChannel_1.arduinoChannel.start(`Install package - ${packageName} failed under directory : ${error.path}${os.EOL}
                                      Please make sure the folder is not occupied by other procedures .`);
                    outputChannel_1.arduinoChannel.error(`Error message - ${error.message}${os.EOL}`);
                    outputChannel_1.arduinoChannel.error(`Exit with code=${error.code}${os.EOL}`);
                    return;
                }
            }
            outputChannel_1.arduinoChannel.info(`${packageName}${arch && ":" + arch}${version && ":" + version}`);
            try {
                if (this.useArduinoCli()) {
                    yield util.spawn(this._settings.commandPath, ["core", "install", `${packageName}${arch && ":" + arch}${version && "@" + version}`], undefined, { channel: showOutput ? outputChannel_1.arduinoChannel.channel : null });
                }
                else {
                    yield util.spawn(this._settings.commandPath, ["--install-boards", `${packageName}${arch && ":" + arch}${version && ":" + version}`], undefined, { channel: showOutput ? outputChannel_1.arduinoChannel.channel : null });
                }
                if (updatingIndex) {
                    outputChannel_1.arduinoChannel.end("Updated package index files.");
                }
                else {
                    outputChannel_1.arduinoChannel.end(`Installed board package - ${packageName}${os.EOL}`);
                }
            }
            catch (error) {
                // If a platform with the same version is already installed, nothing is installed and program exits with exit code 1
                if (error.code === 1) {
                    if (updatingIndex) {
                        outputChannel_1.arduinoChannel.end("Updated package index files.");
                    }
                    else {
                        outputChannel_1.arduinoChannel.end(`Installed board package - ${packageName}${os.EOL}`);
                    }
                }
                else {
                    outputChannel_1.arduinoChannel.error(`Exit with code=${error.code}${os.EOL}`);
                }
            }
        });
    }
    uninstallBoard(boardName, packagePath) {
        outputChannel_1.arduinoChannel.start(`Uninstall board package - ${boardName}...`);
        util.rmdirRecursivelySync(packagePath);
        outputChannel_1.arduinoChannel.end(`Uninstalled board package - ${boardName}${os.EOL}`);
    }
    /**
     * Downloads or updates a library
     * @param {string} libName - name of the library to download
     * @param {string} version - version of library to download
     * @param {boolean} [showOutput=true] - show raw output from command
     */
    installLibrary(libName, version = "", showOutput = true) {
        return __awaiter(this, void 0, void 0, function* () {
            outputChannel_1.arduinoChannel.show();
            const updatingIndex = (libName === "dummy" && !version);
            if (updatingIndex) {
                outputChannel_1.arduinoChannel.start("Update library index files...");
            }
            else {
                outputChannel_1.arduinoChannel.start(`Install library - ${libName}`);
            }
            try {
                if (this.useArduinoCli()) {
                    yield util.spawn(this._settings.commandPath, ["lib", "install", `${libName}${version && "@" + version}`], undefined, { channel: showOutput ? outputChannel_1.arduinoChannel.channel : undefined });
                }
                else {
                    yield util.spawn(this._settings.commandPath, ["--install-library", `${libName}${version && ":" + version}`], undefined, { channel: showOutput ? outputChannel_1.arduinoChannel.channel : undefined });
                }
                if (updatingIndex) {
                    outputChannel_1.arduinoChannel.end("Updated library index files.");
                }
                else {
                    outputChannel_1.arduinoChannel.end(`Installed library - ${libName}${os.EOL}`);
                }
            }
            catch (error) {
                // If a library with the same version is already installed, nothing is installed and program exits with exit code 1
                if (error.code === 1) {
                    if (updatingIndex) {
                        outputChannel_1.arduinoChannel.end("Updated library index files.");
                    }
                    else {
                        outputChannel_1.arduinoChannel.end(`Installed library - ${libName}${os.EOL}`);
                    }
                }
                else {
                    outputChannel_1.arduinoChannel.error(`Exit with code=${error.code}${os.EOL}`);
                }
            }
        });
    }
    uninstallLibrary(libName, libPath) {
        outputChannel_1.arduinoChannel.start(`Remove library - ${libName}`);
        util.rmdirRecursivelySync(libPath);
        outputChannel_1.arduinoChannel.end(`Removed library - ${libName}${os.EOL}`);
    }
    openExample(example) {
        function tmpName(name) {
            let counter = 0;
            let candidateName = name;
            // eslint-disable-next-line no-constant-condition
            while (true) {
                if (!util.fileExistsSync(candidateName) && !util.directoryExistsSync(candidateName)) {
                    return candidateName;
                }
                counter++;
                candidateName = `${name}_${counter}`;
            }
        }
        // Step 1: Copy the example project to a temporary directory.
        const sketchPath = path.join(this._settings.sketchbookPath, "generated_examples");
        if (!util.directoryExistsSync(sketchPath)) {
            util.mkdirRecursivelySync(sketchPath);
        }
        let destExample = "";
        if (util.directoryExistsSync(example)) {
            destExample = tmpName(path.join(sketchPath, path.basename(example)));
            util.cp(example, destExample);
        }
        else if (util.fileExistsSync(example)) {
            const exampleName = path.basename(example, path.extname(example));
            destExample = tmpName(path.join(sketchPath, exampleName));
            util.mkdirRecursivelySync(destExample);
            util.cp(example, path.join(destExample, path.basename(example)));
        }
        if (destExample) {
            // Step 2: Scaffold the example project to an arduino project.
            const items = fs.readdirSync(destExample);
            const sketchFile = items.find((item) => {
                return util.isArduinoFile(path.join(destExample, item));
            });
            if (sketchFile) {
                // Generate arduino.json
                const dc = deviceContext_1.DeviceContext.getInstance();
                const arduinoJson = {
                    sketch: sketchFile,
                    // TODO EW, 2020-02-18: COM1 is Windows specific - what about OSX and Linux users?
                    port: dc.port || "COM1",
                    board: dc.board,
                    configuration: dc.configuration,
                };
                const arduinoConfigFilePath = path.join(destExample, constants.ARDUINO_CONFIG_FILE);
                util.mkdirRecursivelySync(path.dirname(arduinoConfigFilePath));
                fs.writeFileSync(arduinoConfigFilePath, JSON.stringify(arduinoJson, null, 4));
            }
            // Step 3: Open the arduino project at a new vscode window.
            vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(destExample), true);
        }
        return destExample;
    }
    get settings() {
        return this._settings;
    }
    get boardManager() {
        return this._boardManager;
    }
    set boardManager(value) {
        this._boardManager = value;
    }
    get libraryManager() {
        return this._libraryManager;
    }
    set libraryManager(value) {
        this._libraryManager = value;
    }
    get exampleManager() {
        return this._exampleManager;
    }
    set exampleManager(value) {
        this._exampleManager = value;
    }
    get programmerManager() {
        return this._programmerManager;
    }
    set programmerManager(value) {
        this._programmerManager = value;
    }
    /**
     * Runs the pre or post build command.
     * Usually before one of
     *  * verify
     *  * upload
     *  * upload using programmer
     * @param dc Device context prepared during one of the above actions
     * @param what "pre" if the pre-build command should be run, "post" if the
     * post-build command should be run.
     * @returns True if successful, false on error.
     */
    runPrePostBuildCommand(dc, environment, what) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmdline = what === "pre"
                ? dc.prebuild
                : dc.postbuild;
            if (!cmdline) {
                return true; // Successfully done nothing.
            }
            outputChannel_1.arduinoChannel.info(`Running ${what}-build command: "${cmdline}"`);
            let cmd;
            let args;
            // pre-/post-build commands feature full bash support on UNIX systems.
            // On Windows you have full cmd support.
            if (os.platform() === "win32") {
                args = [];
                cmd = cmdline;
            }
            else {
                args = ["-c", cmdline];
                cmd = "bash";
            }
            try {
                yield util.spawn(cmd, args, {
                    shell: os.platform() === "win32",
                    cwd: workspace_1.ArduinoWorkspace.rootPath,
                    env: Object.assign({}, environment),
                }, { channel: outputChannel_1.arduinoChannel.channel });
            }
            catch (ex) {
                const msg = ex.error
                    ? `${ex.error}`
                    : ex.code
                        ? `Exit code = ${ex.code}`
                        : JSON.stringify(ex);
                outputChannel_1.arduinoChannel.error(`Running ${what}-build command failed: ${os.EOL}${msg}`);
                return false;
            }
            return true;
        });
    }
    /**
     * Checks if the arduino cli is being used
     * @returns {bool} - true if arduino cli is being use
     */
    useArduinoCli() {
        return this._settings.useArduinoCli;
        // return VscodeSettings.getInstance().useArduinoCli;
    }
    /**
     * Checks if the line contains memory usage information
     * @param line output line to check
     * @returns {bool} true if line contains memory usage information
     */
    isMemoryUsageInformation(line) {
        return line.startsWith("Sketch uses ") || line.startsWith("Global variables use ");
    }
    /**
     * Private implementation. Not to be called directly. The wrapper build()
     * manages the build state.
     * @param buildMode See build()
     * @param buildDir See build()
     * @see https://github.com/arduino/Arduino/blob/master/build/shared/manpage.adoc
     */
    _build(buildMode, buildDir) {
        return __awaiter(this, void 0, void 0, function* () {
            const dc = deviceContext_1.DeviceContext.getInstance();
            const args = [];
            let restoreSerialMonitor = false;
            const verbose = vscodeSettings_1.VscodeSettings.getInstance().logLevel === constants.LogLevel.Verbose;
            if (!this.boardManager.currentBoard) {
                if (buildMode !== BuildMode.Analyze) {
                    logger.notifyUserError("boardManager.currentBoard", new Error(constants.messages.NO_BOARD_SELECTED));
                }
                return false;
            }
            const boardDescriptor = this.boardManager.currentBoard.getBuildConfig();
            if (this.useArduinoCli()) {
                args.push("-b", boardDescriptor);
            }
            else {
                args.push("--board", boardDescriptor);
            }
            if (!workspace_1.ArduinoWorkspace.rootPath) {
                vscode.window.showWarningMessage("Workspace doesn't seem to have a folder added to it yet.");
                return false;
            }
            if (!dc.sketch || !util.fileExistsSync(path.join(workspace_1.ArduinoWorkspace.rootPath, dc.sketch))) {
                if (buildMode === BuildMode.Analyze) {
                    // Analyze runs non interactively
                    return false;
                }
                if (!(yield dc.resolveMainSketch())) {
                    vscode.window.showErrorMessage("No sketch file was found. Please specify the sketch in the arduino.json file");
                    return false;
                }
            }
            const selectSerial = () => __awaiter(this, void 0, void 0, function* () {
                const choice = yield vscode.window.showInformationMessage("Serial port is not specified. Do you want to select a serial port for uploading?", "Yes", "No");
                if (choice === "Yes") {
                    vscode.commands.executeCommand("arduino.selectSerialPort");
                }
            });
            if (buildMode === BuildMode.Upload) {
                if ((!dc.configuration || !/upload_method=[^=,]*st[^,]*link/i.test(dc.configuration)) && !dc.port) {
                    yield selectSerial();
                    return false;
                }
                if (this.useArduinoCli()) {
                    args.push("compile", "--upload");
                }
                else {
                    args.push("--upload");
                }
                if (dc.port) {
                    args.push("--port", dc.port);
                }
            }
            else if (buildMode === BuildMode.CliUpload) {
                if ((!dc.configuration || !/upload_method=[^=,]*st[^,]*link/i.test(dc.configuration)) && !dc.port) {
                    yield selectSerial();
                    return false;
                }
                if (!this.useArduinoCli()) {
                    outputChannel_1.arduinoChannel.error("This command is only available when using the Arduino CLI");
                    return false;
                }
                args.push("upload");
                if (dc.port) {
                    args.push("--port", dc.port);
                }
            }
            else if (buildMode === BuildMode.UploadProgrammer) {
                const programmer = this.programmerManager.currentProgrammer;
                if (!programmer) {
                    logger.notifyUserError("programmerManager.currentProgrammer", new Error(constants.messages.NO_PROGRAMMMER_SELECTED));
                    return false;
                }
                if (!dc.port) {
                    yield selectSerial();
                    return false;
                }
                if (this.useArduinoCli()) {
                    args.push("compile", "--upload", "--programmer", programmer);
                }
                else {
                    args.push("--upload", "--useprogrammer", "--pref", `programmer=${programmer}`);
                }
                args.push("--port", dc.port);
            }
            else if (buildMode === BuildMode.CliUploadProgrammer) {
                const programmer = this.programmerManager.currentProgrammer;
                if (!programmer) {
                    logger.notifyUserError("programmerManager.currentProgrammer", new Error(constants.messages.NO_PROGRAMMMER_SELECTED));
                    return false;
                }
                if (!dc.port) {
                    yield selectSerial();
                    return false;
                }
                if (!this.useArduinoCli()) {
                    outputChannel_1.arduinoChannel.error("This command is only available when using the Arduino CLI");
                    return false;
                }
                args.push("upload", "--programmer", programmer, "--port", dc.port);
            }
            else {
                if (this.useArduinoCli()) {
                    args.unshift("compile");
                }
                else {
                    args.push("--verify");
                }
            }
            if (dc.buildPreferences) {
                for (const pref of dc.buildPreferences) {
                    // Note: BuildPrefSetting makes sure that each preference
                    // value consists of exactly two items (key and value).
                    if (this.useArduinoCli()) {
                        args.push("--build-property", `${pref[0]}=${pref[1]}`);
                    }
                    else {
                        args.push("--pref", `${pref[0]}=${pref[1]}`);
                    }
                }
            }
            // We always build verbosely but filter the output based on the settings
            this._settings.useArduinoCli ? args.push("--verbose") : args.push("--verbose-build");
            if (verbose && !this._settings.useArduinoCli) {
                args.push("--verbose-upload");
            }
            yield vscode.workspace.saveAll(false);
            // we prepare the channel here since all following code will
            // or at leas can possibly output to it
            outputChannel_1.arduinoChannel.show();
            if (vscodeSettings_1.VscodeSettings.getInstance().clearOutputOnBuild) {
                outputChannel_1.arduinoChannel.clear();
            }
            outputChannel_1.arduinoChannel.start(`${buildMode} sketch '${dc.sketch}'`);
            if (buildDir || dc.output) {
                // 2020-02-29, EW: This whole code appears a bit wonky to me.
                //   What if the user specifies an output directory "../builds/my project"
                buildDir = path.resolve(workspace_1.ArduinoWorkspace.rootPath, buildDir || dc.output);
                const dirPath = path.dirname(buildDir);
                if (!util.directoryExistsSync(dirPath)) {
                    logger.notifyUserError("InvalidOutPutPath", new Error(constants.messages.INVALID_OUTPUT_PATH + buildDir));
                    return false;
                }
                if (this.useArduinoCli()) {
                    args.push("--build-path", buildDir);
                }
                else {
                    args.push("--pref", `build.path=${buildDir}`);
                }
                outputChannel_1.arduinoChannel.info(`Please see the build logs in output path: ${buildDir}`);
            }
            else {
                const msg = "Output path is not specified. Unable to reuse previously compiled files. Build will be slower. See README.";
                outputChannel_1.arduinoChannel.warning(msg);
            }
            // Environment variables passed to pre- and post-build commands
            const env = {
                VSCA_BUILD_MODE: buildMode,
                VSCA_SKETCH: dc.sketch,
                VSCA_BOARD: boardDescriptor,
                VSCA_WORKSPACE_DIR: workspace_1.ArduinoWorkspace.rootPath,
                VSCA_LOG_LEVEL: verbose ? constants.LogLevel.Verbose : constants.LogLevel.Info,
            };
            if (dc.port) {
                env["VSCA_SERIAL"] = dc.port;
            }
            if (buildDir) {
                env["VSCA_BUILD_DIR"] = buildDir;
            }
            // TODO EW: What should we do with pre-/post build commands when running
            //   analysis? Some could use it to generate/manipulate code which could
            //   be a prerequisite for a successful build
            if (!(yield this.runPrePostBuildCommand(dc, env, "pre"))) {
                return false;
            }
            // stop serial monitor when everything is prepared and good
            // what makes restoring of its previous state easier
            if (buildMode === BuildMode.Upload ||
                buildMode === BuildMode.UploadProgrammer ||
                buildMode === BuildMode.CliUpload ||
                buildMode === BuildMode.CliUploadProgrammer) {
                restoreSerialMonitor = yield serialMonitor_1.SerialMonitor.getInstance().closeSerialMonitor(dc.port);
                usbDetector_1.UsbDetector.getInstance().pauseListening();
            }
            // Push sketch as last argument
            args.push(path.join(workspace_1.ArduinoWorkspace.rootPath, dc.sketch));
            const cocopa = intellisense_1.makeCompilerParserContext(dc);
            const cleanup = (result) => __awaiter(this, void 0, void 0, function* () {
                let ret = true;
                if (result === "ok") {
                    ret = yield this.runPrePostBuildCommand(dc, env, "post");
                }
                yield cocopa.conclude();
                if (buildMode === BuildMode.Upload || buildMode === BuildMode.UploadProgrammer) {
                    usbDetector_1.UsbDetector.getInstance().resumeListening();
                    if (restoreSerialMonitor) {
                        yield serialMonitor_1.SerialMonitor.getInstance().openSerialMonitor();
                    }
                }
                return ret;
            });
            const stdoutcb = (line) => {
                if (cocopa.callback) {
                    cocopa.callback(line);
                }
                if (verbose) {
                    outputChannel_1.arduinoChannel.channel.append(line);
                }
                else {
                    // Output sketch memory usage in non-verbose mode
                    if (this.isMemoryUsageInformation(line)) {
                        outputChannel_1.arduinoChannel.channel.append(line);
                    }
                }
            };
            const stderrcb = (line) => {
                if (os.platform() === "win32") {
                    line = line.trim();
                    if (line.length <= 0) {
                        return;
                    }
                    line = line.replace(/(?:\r|\r\n|\n)+/g, os.EOL);
                    line = `${line}${os.EOL}`;
                }
                if (!verbose) {
                    // Don't spill log with spurious info from the backend. This
                    // list could be fetched from a config file to accommodate
                    // messages of unknown board packages, newer backend revisions
                    const filters = [
                        /^Picked\sup\sJAVA_TOOL_OPTIONS:\s+/,
                        /^\d+\d+-\d+-\d+T\d+:\d+:\d+.\d+Z\s(?:INFO|WARN)\s/,
                        /^(?:DEBUG|TRACE|INFO)\s+/,
                    ];
                    for (const f of filters) {
                        if (line.match(f)) {
                            return;
                        }
                    }
                }
                outputChannel_1.arduinoChannel.channel.append(line);
            };
            return yield util.spawn(this._settings.commandPath, args, { cwd: workspace_1.ArduinoWorkspace.rootPath }, { /*channel: arduinoChannel.channel,*/ stdout: stdoutcb, stderr: stderrcb }).then(() => __awaiter(this, void 0, void 0, function* () {
                const ret = yield cleanup("ok");
                if (ret) {
                    outputChannel_1.arduinoChannel.end(`${buildMode} sketch '${dc.sketch}'${os.EOL}`);
                }
                return ret;
            }), (reason) => __awaiter(this, void 0, void 0, function* () {
                yield cleanup("error");
                const msg = reason.code
                    ? `Exit with code=${reason.code}`
                    : JSON.stringify(reason);
                outputChannel_1.arduinoChannel.error(`${buildMode} sketch '${dc.sketch}': ${msg}${os.EOL}`);
                return false;
            }));
        });
    }
}
exports.ArduinoApp = ArduinoApp;

//# sourceMappingURL=arduino.js.map

// SIG // Begin signature block
// SIG // MIInuAYJKoZIhvcNAQcCoIInqTCCJ6UCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // n9Lj7Eqx32NH8myCcaQp5rj1/xY9EhAzPJQ1gPYkaMqg
// SIG // gg2BMIIF/zCCA+egAwIBAgITMwAAAlKLM6r4lfM52wAA
// SIG // AAACUjANBgkqhkiG9w0BAQsFADB+MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBT
// SIG // aWduaW5nIFBDQSAyMDExMB4XDTIxMDkwMjE4MzI1OVoX
// SIG // DTIyMDkwMTE4MzI1OVowdDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEeMBwGA1UEAxMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
// SIG // 0OTPj7P1+wTbr+Qf9COrqA8I9DSTqNSq1UKju4IEV3HJ
// SIG // Jck61i+MTEoYyKLtiLG2Jxeu8F81QKuTpuKHvi380gzs
// SIG // 43G+prNNIAaNDkGqsENQYo8iezbw3/NCNX1vTi++irdF
// SIG // qXNs6xoc3B3W+7qT678b0jTVL8St7IMO2E7d9eNdL6RK
// SIG // fMnwRJf4XfGcwL+OwwoCeY9c5tvebNUVWRzaejKIkBVT
// SIG // hApuAMCtpdvIvmBEdSTuCKZUx+OLr81/aEZyR2jL1s2R
// SIG // KaMz8uIzTtgw6m3DbOM4ewFjIRNT1hVQPghyPxJ+ZwEr
// SIG // wry5rkf7fKuG3PF0fECGSUEqftlOptpXTQIDAQABo4IB
// SIG // fjCCAXowHwYDVR0lBBgwFgYKKwYBBAGCN0wIAQYIKwYB
// SIG // BQUHAwMwHQYDVR0OBBYEFDWSWhFBi9hrsLe2TgLuHnxG
// SIG // F3nRMFAGA1UdEQRJMEekRTBDMSkwJwYDVQQLEyBNaWNy
// SIG // b3NvZnQgT3BlcmF0aW9ucyBQdWVydG8gUmljbzEWMBQG
// SIG // A1UEBRMNMjMwMDEyKzQ2NzU5NzAfBgNVHSMEGDAWgBRI
// SIG // bmTlUAXTgqoXNzcitW2oynUClTBUBgNVHR8ETTBLMEmg
// SIG // R6BFhkNodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtp
// SIG // b3BzL2NybC9NaWNDb2RTaWdQQ0EyMDExXzIwMTEtMDct
// SIG // MDguY3JsMGEGCCsGAQUFBwEBBFUwUzBRBggrBgEFBQcw
// SIG // AoZFaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9w
// SIG // cy9jZXJ0cy9NaWNDb2RTaWdQQ0EyMDExXzIwMTEtMDct
// SIG // MDguY3J0MAwGA1UdEwEB/wQCMAAwDQYJKoZIhvcNAQEL
// SIG // BQADggIBABZJN7ksZExAYdTbQJewYryBLAFnYF9amfhH
// SIG // WTGG0CmrGOiIUi10TMRdQdzinUfSv5HHKZLzXBpfA+2M
// SIG // mEuJoQlDAUflS64N3/D1I9/APVeWomNvyaJO1mRTgJoz
// SIG // 0TTRp8noO5dJU4k4RahPtmjrOvoXnoKgHXpRoDSSkRy1
// SIG // kboRiriyMOZZIMfSsvkL2a5/w3YvLkyIFiqfjBhvMWOj
// SIG // wb744LfY0EoZZz62d1GPAb8Muq8p4VwWldFdE0y9IBMe
// SIG // 3ofytaPDImq7urP+xcqji3lEuL0x4fU4AS+Q7cQmLq12
// SIG // 0gVbS9RY+OPjnf+nJgvZpr67Yshu9PWN0Xd2HSY9n9xi
// SIG // au2OynVqtEGIWrSoQXoOH8Y4YNMrrdoOmjNZsYzT6xOP
// SIG // M+h1gjRrvYDCuWbnZXUcOGuOWdOgKJLaH9AqjskxK76t
// SIG // GI6BOF6WtPvO0/z1VFzan+2PqklO/vS7S0LjGEeMN3Ej
// SIG // 47jbrLy3/YAZ3IeUajO5Gg7WFg4C8geNhH7MXjKsClsA
// SIG // Pk1YtB61kan0sdqJWxOeoSXBJDIzkis97EbrqRQl91K6
// SIG // MmH+di/tolU63WvF1nrDxutjJ590/ALi383iRbgG3zkh
// SIG // EceyBWTvdlD6FxNbhIy+bJJdck2QdzLm4DgOBfCqETYb
// SIG // 4hQBEk/pxvHPLiLG2Xm9PEnmEDKo1RJpMIIHejCCBWKg
// SIG // AwIBAgIKYQ6Q0gAAAAAAAzANBgkqhkiG9w0BAQsFADCB
// SIG // iDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEyMDAGA1UEAxMpTWlj
// SIG // cm9zb2Z0IFJvb3QgQ2VydGlmaWNhdGUgQXV0aG9yaXR5
// SIG // IDIwMTEwHhcNMTEwNzA4MjA1OTA5WhcNMjYwNzA4MjEw
// SIG // OTA5WjB+MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSgwJgYDVQQD
// SIG // Ex9NaWNyb3NvZnQgQ29kZSBTaWduaW5nIFBDQSAyMDEx
// SIG // MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA
// SIG // q/D6chAcLq3YbqqCEE00uvK2WCGfQhsqa+laUKq4Bjga
// SIG // BEm6f8MMHt03a8YS2AvwOMKZBrDIOdUBFDFC04kNeWSH
// SIG // fpRgJGyvnkmc6Whe0t+bU7IKLMOv2akrrnoJr9eWWcpg
// SIG // GgXpZnboMlImEi/nqwhQz7NEt13YxC4Ddato88tt8zpc
// SIG // oRb0RrrgOGSsbmQ1eKagYw8t00CT+OPeBw3VXHmlSSnn
// SIG // Db6gE3e+lD3v++MrWhAfTVYoonpy4BI6t0le2O3tQ5GD
// SIG // 2Xuye4Yb2T6xjF3oiU+EGvKhL1nkkDstrjNYxbc+/jLT
// SIG // swM9sbKvkjh+0p2ALPVOVpEhNSXDOW5kf1O6nA+tGSOE
// SIG // y/S6A4aN91/w0FK/jJSHvMAhdCVfGCi2zCcoOCWYOUo2
// SIG // z3yxkq4cI6epZuxhH2rhKEmdX4jiJV3TIUs+UsS1Vz8k
// SIG // A/DRelsv1SPjcF0PUUZ3s/gA4bysAoJf28AVs70b1FVL
// SIG // 5zmhD+kjSbwYuER8ReTBw3J64HLnJN+/RpnF78IcV9uD
// SIG // jexNSTCnq47f7Fufr/zdsGbiwZeBe+3W7UvnSSmnEyim
// SIG // p31ngOaKYnhfsi+E11ecXL93KCjx7W3DKI8sj0A3T8Hh
// SIG // hUSJxAlMxdSlQy90lfdu+HggWCwTXWCVmj5PM4TasIgX
// SIG // 3p5O9JawvEagbJjS4NaIjAsCAwEAAaOCAe0wggHpMBAG
// SIG // CSsGAQQBgjcVAQQDAgEAMB0GA1UdDgQWBBRIbmTlUAXT
// SIG // gqoXNzcitW2oynUClTAZBgkrBgEEAYI3FAIEDB4KAFMA
// SIG // dQBiAEMAQTALBgNVHQ8EBAMCAYYwDwYDVR0TAQH/BAUw
// SIG // AwEB/zAfBgNVHSMEGDAWgBRyLToCMZBDuRQFTuHqp8cx
// SIG // 0SOJNDBaBgNVHR8EUzBRME+gTaBLhklodHRwOi8vY3Js
// SIG // Lm1pY3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0cy9N
// SIG // aWNSb29DZXJBdXQyMDExXzIwMTFfMDNfMjIuY3JsMF4G
// SIG // CCsGAQUFBwEBBFIwUDBOBggrBgEFBQcwAoZCaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNS
// SIG // b29DZXJBdXQyMDExXzIwMTFfMDNfMjIuY3J0MIGfBgNV
// SIG // HSAEgZcwgZQwgZEGCSsGAQQBgjcuAzCBgzA/BggrBgEF
// SIG // BQcCARYzaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3Br
// SIG // aW9wcy9kb2NzL3ByaW1hcnljcHMuaHRtMEAGCCsGAQUF
// SIG // BwICMDQeMiAdAEwAZQBnAGEAbABfAHAAbwBsAGkAYwB5
// SIG // AF8AcwB0AGEAdABlAG0AZQBuAHQALiAdMA0GCSqGSIb3
// SIG // DQEBCwUAA4ICAQBn8oalmOBUeRou09h0ZyKbC5YR4WOS
// SIG // mUKWfdJ5DJDBZV8uLD74w3LRbYP+vj/oCso7v0epo/Np
// SIG // 22O/IjWll11lhJB9i0ZQVdgMknzSGksc8zxCi1LQsP1r
// SIG // 4z4HLimb5j0bpdS1HXeUOeLpZMlEPXh6I/MTfaaQdION
// SIG // 9MsmAkYqwooQu6SpBQyb7Wj6aC6VoCo/KmtYSWMfCWlu
// SIG // WpiW5IP0wI/zRive/DvQvTXvbiWu5a8n7dDd8w6vmSiX
// SIG // mE0OPQvyCInWH8MyGOLwxS3OW560STkKxgrCxq2u5bLZ
// SIG // 2xWIUUVYODJxJxp/sfQn+N4sOiBpmLJZiWhub6e3dMNA
// SIG // BQamASooPoI/E01mC8CzTfXhj38cbxV9Rad25UAqZaPD
// SIG // XVJihsMdYzaXht/a8/jyFqGaJ+HNpZfQ7l1jQeNbB5yH
// SIG // PgZ3BtEGsXUfFL5hYbXw3MYbBL7fQccOKO7eZS/sl/ah
// SIG // XJbYANahRr1Z85elCUtIEJmAH9AAKcWxm6U/RXceNcbS
// SIG // oqKfenoi+kiVH6v7RyOA9Z74v2u3S5fi63V4GuzqN5l5
// SIG // GEv/1rMjaHXmr/r8i+sLgOppO6/8MO0ETI7f33VtY5E9
// SIG // 0Z1WTk+/gFcioXgRMiF670EKsT/7qMykXcGhiJtXcVZO
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGY8w
// SIG // ghmLAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAJSizOq+JXzOdsAAAAAAlIwDQYJYIZI
// SIG // AWUDBAIBBQCgga4wGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEILS8hgt1sK79OJxutNcL
// SIG // BrTo/XK8fktR6WtiSZaRtC6EMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAOhq2un5IdQMGiRiYX8bC79Jo9nnjJcHpOtvT
// SIG // nVEv6L9+04V/BrwhrvbSQxReHGrob/b4ELnIYCt/ugR1
// SIG // 31aJ7ofSOeja3dXWvA2d/9Ly9IyxqsKRXOLwrK9fFF01
// SIG // nCTGRsfN6t/LIyP9NFNqdm23shYdWyZwTWN5iVBPHJjV
// SIG // ykCmP0a8a4ARcNwLztTEtv9yF1I3fZ884iHNYNWdEKg6
// SIG // gXa0QxFZEunW6ADQuJw+8omXe2btvIu/jc5WJKohzTu4
// SIG // gYL8n+vMOlRBhTzJaqlsjbGr9Jeg0rrhawxwZNLjXmAC
// SIG // PN+ZToAsXQ4I/5gONg9R99CF+40cglkTK4oeR5uvp6GC
// SIG // FxkwghcVBgorBgEEAYI3AwMBMYIXBTCCFwEGCSqGSIb3
// SIG // DQEHAqCCFvIwghbuAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFZBgsqhkiG9w0BCRABBKCCAUgEggFEMIIBQAIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCC7HBG2
// SIG // X9ljriggsuPBSa7Uf1ZcJ5JCIVQdU20MdmMy3wIGYf1W
// SIG // PUpdGBMyMDIyMDIxMTAxNTc0NC42ODlaMASAAgH0oIHY
// SIG // pIHVMIHSMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYDVQQL
// SIG // EyRNaWNyb3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExp
// SIG // bWl0ZWQxJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNOOkQw
// SIG // ODItNEJGRC1FRUJBMSUwIwYDVQQDExxNaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBTZXJ2aWNloIIRaDCCBxQwggT8oAMC
// SIG // AQICEzMAAAGP81Go61py3cwAAQAAAY8wDQYJKoZIhvcN
// SIG // AQELBQAwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UE
// SIG // AxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAw
// SIG // HhcNMjExMDI4MTkyNzQ2WhcNMjMwMTI2MTkyNzQ2WjCB
// SIG // 0jELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWlj
// SIG // cm9zb2Z0IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVk
// SIG // MSYwJAYDVQQLEx1UaGFsZXMgVFNTIEVTTjpEMDgyLTRC
// SIG // RkQtRUVCQTElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgU2VydmljZTCCAiIwDQYJKoZIhvcNAQEBBQAD
// SIG // ggIPADCCAgoCggIBAJlXPv61zxcehZOPgqS67mw6y02t
// SIG // 0LgB0VV7svs7MV8JKIJE9Gvl1rgWm8B8qo/EUYmUEL3b
// SIG // 2zquTURMTnh4mgrZFLENNhEgHvQs/paATbbHwqvOOrt6
// SIG // LVhwiZapLw60q+5jAasHEWO3H4QBny75aTEqI6AJ5O0X
// SIG // o/o3CZ2MSHjd+Bd4fScADWN+tKBmAiEu6SzqLFlfm8bo
// SIG // Pbok2WBP13JcmDRel3c2f8w/+FOacU+DGUJswRrw7PvH
// SIG // A3QP7LWX4/68votF1GDRT4bqnPlCpMJv1zRwfgg7BkJf
// SIG // mUtBnG1FLp+FT04RyZupkQMC+cvM6bVhCKHG03kUk5mZ
// SIG // 1GtomB9hDgVe3go8dEnW+pC3NcXRUXJA3kBkeCdchcsm
// SIG // 7mbFD/MdHTrBBKC0LjobipQy0BIOw+mcZmSZ0vAdN3sJ
// SIG // P0qVS6rG+ulNqsheAcA7dbmZIxGe34pyKFIEs+Ae31i2
// SIG // CHjtjgmMSBNF78LFaKfT70102bRj885h1O+dxmqysrjO
// SIG // qGv6mk82L6wH1G+ymIb1UCsRlD5C/fniojOxtKnpyQha
// SIG // 182T8EVqHHAEd9z4TRLrs8ymRSeA3mkwi4P/LitEOEIx
// SIG // UXn+Z+B/tikCBIm2e8yHgV944LKyAm880ptEF90kVZmR
// SIG // //wKqfGMZMHKCNVggYs7/OM/XqsEQXUOB2HDW0DDAgMB
// SIG // AAGjggE2MIIBMjAdBgNVHQ4EFgQU8wbmdGuuSc7ioc6F
// SIG // m9uX+zcjcbwwHwYDVR0jBBgwFoAUn6cVXQBeYl2D9OXS
// SIG // ZacbUzUZ6XIwXwYDVR0fBFgwVjBUoFKgUIZOaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jcmwvTWlj
// SIG // cm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUyMDIwMTAo
// SIG // MSkuY3JsMGwGCCsGAQUFBwEBBGAwXjBcBggrBgEFBQcw
// SIG // AoZQaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9w
// SIG // cy9jZXJ0cy9NaWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIw
// SIG // UENBJTIwMjAxMCgxKS5jcnQwDAYDVR0TAQH/BAIwADAT
// SIG // BgNVHSUEDDAKBggrBgEFBQcDCDANBgkqhkiG9w0BAQsF
// SIG // AAOCAgEAzX/TqPc8oQuZ9YwvIlOzSWN/RYs44cWcCWyW
// SIG // P2LcJ+t6ZTJU0mgaXq2p+eun7kaIxiUr9xMGbPka7jlN
// SIG // k/2UQ8eFR3rCx7XJRPBpjDNakzGmTy/CNha0Zn+TqKeB
// SIG // qnMTXTRAgQpVWZp9CsxXTzKkWuf9EegpoKiYdJrryJop
// SIG // IB7m76IbGrzxMsh0GveBw+PyzSnf2CGgiij8/UgOXwGu
// SIG // KYUOBL89mrmPUlJbiHeTCvR+XI1lcAcQr2AA/tQlvc+x
// SIG // rISZTY6gb1rSjuidAHpn4Os9vIO6nOxv7Qra5R+P8tu8
// SIG // vrLbsFlzb8HbEndZbweDOtwLjJfWKemrv1xZJxsyTxep
// SIG // /7lkeiYUL84eNCC4Hk4S5mIX/M/mg2+K9jgSxtT9gemg
// SIG // k1tmEJLe06VJ8yNHChq9tdwmyrRpPzjiB0rAzsWrJnhi
// SIG // fhYlCQoldecId2mU/1U/z5C/ROIQwQMBrePRvPIEgjtM
// SIG // fY33Q2VnVhmxC15UpgNxD+Hk2Ku0a6JWNOBvHxrRdKc7
// SIG // mbuNwNvc2iPZSK+bpSkc/BKEB1OnLtD8VMNAfR/HAJL0
// SIG // MWjLpkWf+Hwm6jW+E3D5D3FjiNuEGJb6W7U/ad9X5WBJ
// SIG // ZnOcIxqZQJMv55CXE9B2RDV3p8VrT77eIHKKqaXiTwN0
// SIG // v9Q+eyi9+uu3qSK9MldvdBNqLWWwFvAwggdxMIIFWaAD
// SIG // AgECAhMzAAAAFcXna54Cm0mZAAAAAAAVMA0GCSqGSIb3
// SIG // DQEBCwUAMIGIMQswCQYDVQQGEwJVUzETMBEGA1UECBMK
// SIG // V2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwG
// SIG // A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMTIwMAYD
// SIG // VQQDEylNaWNyb3NvZnQgUm9vdCBDZXJ0aWZpY2F0ZSBB
// SIG // dXRob3JpdHkgMjAxMDAeFw0yMTA5MzAxODIyMjVaFw0z
// SIG // MDA5MzAxODMyMjVaMHwxCzAJBgNVBAYTAlVTMRMwEQYD
// SIG // VQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25k
// SIG // MR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24x
// SIG // JjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBD
// SIG // QSAyMDEwMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIIC
// SIG // CgKCAgEA5OGmTOe0ciELeaLL1yR5vQ7VgtP97pwHB9Kp
// SIG // bE51yMo1V/YBf2xK4OK9uT4XYDP/XE/HZveVU3Fa4n5K
// SIG // Wv64NmeFRiMMtY0Tz3cywBAY6GB9alKDRLemjkZrBxTz
// SIG // xXb1hlDcwUTIcVxRMTegCjhuje3XD9gmU3w5YQJ6xKr9
// SIG // cmmvHaus9ja+NSZk2pg7uhp7M62AW36MEBydUv626GIl
// SIG // 3GoPz130/o5Tz9bshVZN7928jaTjkY+yOSxRnOlwaQ3K
// SIG // Ni1wjjHINSi947SHJMPgyY9+tVSP3PoFVZhtaDuaRr3t
// SIG // pK56KTesy+uDRedGbsoy1cCGMFxPLOJiss254o2I5Jas
// SIG // AUq7vnGpF1tnYN74kpEeHT39IM9zfUGaRnXNxF803RKJ
// SIG // 1v2lIH1+/NmeRd+2ci/bfV+AutuqfjbsNkz2K26oElHo
// SIG // vwUDo9Fzpk03dJQcNIIP8BDyt0cY7afomXw/TNuvXsLz
// SIG // 1dhzPUNOwTM5TI4CvEJoLhDqhFFG4tG9ahhaYQFzymei
// SIG // XtcodgLiMxhy16cg8ML6EgrXY28MyTZki1ugpoMhXV8w
// SIG // dJGUlNi5UPkLiWHzNgY1GIRH29wb0f2y1BzFa/ZcUlFd
// SIG // Etsluq9QBXpsxREdcu+N+VLEhReTwDwV2xo3xwgVGD94
// SIG // q0W29R6HXtqPnhZyacaue7e3PmriLq0CAwEAAaOCAd0w
// SIG // ggHZMBIGCSsGAQQBgjcVAQQFAgMBAAEwIwYJKwYBBAGC
// SIG // NxUCBBYEFCqnUv5kxJq+gpE8RjUpzxD/LwTuMB0GA1Ud
// SIG // DgQWBBSfpxVdAF5iXYP05dJlpxtTNRnpcjBcBgNVHSAE
// SIG // VTBTMFEGDCsGAQQBgjdMg30BATBBMD8GCCsGAQUFBwIB
// SIG // FjNodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3Bz
// SIG // L0RvY3MvUmVwb3NpdG9yeS5odG0wEwYDVR0lBAwwCgYI
// SIG // KwYBBQUHAwgwGQYJKwYBBAGCNxQCBAweCgBTAHUAYgBD
// SIG // AEEwCwYDVR0PBAQDAgGGMA8GA1UdEwEB/wQFMAMBAf8w
// SIG // HwYDVR0jBBgwFoAU1fZWy4/oolxiaNE9lJBb186aGMQw
// SIG // VgYDVR0fBE8wTTBLoEmgR4ZFaHR0cDovL2NybC5taWNy
// SIG // b3NvZnQuY29tL3BraS9jcmwvcHJvZHVjdHMvTWljUm9v
// SIG // Q2VyQXV0XzIwMTAtMDYtMjMuY3JsMFoGCCsGAQUFBwEB
// SIG // BE4wTDBKBggrBgEFBQcwAoY+aHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tL3BraS9jZXJ0cy9NaWNSb29DZXJBdXRf
// SIG // MjAxMC0wNi0yMy5jcnQwDQYJKoZIhvcNAQELBQADggIB
// SIG // AJ1VffwqreEsH2cBMSRb4Z5yS/ypb+pcFLY+TkdkeLEG
// SIG // k5c9MTO1OdfCcTY/2mRsfNB1OW27DzHkwo/7bNGhlBgi
// SIG // 7ulmZzpTTd2YurYeeNg2LpypglYAA7AFvonoaeC6Ce57
// SIG // 32pvvinLbtg/SHUB2RjebYIM9W0jVOR4U3UkV7ndn/OO
// SIG // PcbzaN9l9qRWqveVtihVJ9AkvUCgvxm2EhIRXT0n4ECW
// SIG // OKz3+SmJw7wXsFSFQrP8DJ6LGYnn8AtqgcKBGUIZUnWK
// SIG // NsIdw2FzLixre24/LAl4FOmRsqlb30mjdAy87JGA0j3m
// SIG // Sj5mO0+7hvoyGtmW9I/2kQH2zsZ0/fZMcm8Qq3UwxTSw
// SIG // ethQ/gpY3UA8x1RtnWN0SCyxTkctwRQEcb9k+SS+c23K
// SIG // jgm9swFXSVRk2XPXfx5bRAGOWhmRaw2fpCjcZxkoJLo4
// SIG // S5pu+yFUa2pFEUep8beuyOiJXk+d0tBMdrVXVAmxaQFE
// SIG // fnyhYWxz/gq77EFmPWn9y8FBSX5+k77L+DvktxW/tM4+
// SIG // pTFRhLy/AsGConsXHRWJjXD+57XQKBqJC4822rpM+Zv/
// SIG // Cuk0+CQ1ZyvgDbjmjJnW4SLq8CdCPSWU5nR0W2rRnj7t
// SIG // fqAxM328y+l7vzhwRNGQ8cirOoo6CGJ/2XBjU02N7oJt
// SIG // pQUQwXEGahC0HVUzWLOhcGbyoYIC1zCCAkACAQEwggEA
// SIG // oYHYpIHVMIHSMQswCQYDVQQGEwJVUzETMBEGA1UECBMK
// SIG // V2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwG
// SIG // A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYD
// SIG // VQQLEyRNaWNyb3NvZnQgSXJlbGFuZCBPcGVyYXRpb25z
// SIG // IExpbWl0ZWQxJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNO
// SIG // OkQwODItNEJGRC1FRUJBMSUwIwYDVQQDExxNaWNyb3Nv
// SIG // ZnQgVGltZS1TdGFtcCBTZXJ2aWNloiMKAQEwBwYFKw4D
// SIG // AhoDFQA+TS+CBHbnSAcHRqAmldFgW0GaaqCBgzCBgKR+
// SIG // MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMA0GCSqG
// SIG // SIb3DQEBBQUAAgUA5a+9UTAiGA8yMDIyMDIxMTAwMzUy
// SIG // OVoYDzIwMjIwMjEyMDAzNTI5WjB3MD0GCisGAQQBhFkK
// SIG // BAExLzAtMAoCBQDlr71RAgEAMAoCAQACAhANAgH/MAcC
// SIG // AQACAhGHMAoCBQDlsQ7RAgEAMDYGCisGAQQBhFkKBAIx
// SIG // KDAmMAwGCisGAQQBhFkKAwKgCjAIAgEAAgMHoSChCjAI
// SIG // AgEAAgMBhqAwDQYJKoZIhvcNAQEFBQADgYEAJJ66Cnah
// SIG // eee3pqUHpVE7NWK7VSDYpL4SXijez8JzLWX8e9Azsjk8
// SIG // wA4jIz92vchKxKGj8i2Vah1lrX4KpyfVCQg69Q1Kf4vX
// SIG // 7W5qz7VNPehzAGjCyVKIwRrrwnO4nqsGXPPCWBE2Xzom
// SIG // a9OrbzXZ8LCtxsQv3SgGH7gniuUMsIcxggQNMIIECQIB
// SIG // ATCBkzB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQD
// SIG // Ex1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAIT
// SIG // MwAAAY/zUajrWnLdzAABAAABjzANBglghkgBZQMEAgEF
// SIG // AKCCAUowGgYJKoZIhvcNAQkDMQ0GCyqGSIb3DQEJEAEE
// SIG // MC8GCSqGSIb3DQEJBDEiBCAhfKeJBHb7GOw8s2LGJSB6
// SIG // QTxnre2dWSX0UHV/3oA6wDCB+gYLKoZIhvcNAQkQAi8x
// SIG // geowgecwgeQwgb0EIJdyBU/ixsYLlY4ipttiLZjunRQ1
// SIG // lvJ0obujuoPMhccfMIGYMIGApH4wfDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgUENBIDIwMTACEzMAAAGP81Go61py3cwAAQAA
// SIG // AY8wIgQgrYHsRexO066zdpi5i4jf8v+odkpHep9hrXe1
// SIG // W5+n8WwwDQYJKoZIhvcNAQELBQAEggIAIRKZrLcaSyys
// SIG // dxrqj4gti0R/rYpwOyGPN3qKwChrD3S993R63tA8w+y6
// SIG // gs47L5brAWCsj5pWFXwcK0RQHXEq9Zw3u3KSGW3BE0KY
// SIG // 558GSsC9qXkPPaO8Fd2GBcdSo4Hpp8dPnyyaTBTVQZe4
// SIG // Vgtz4MKAAnFmxsZQAYusw6vtA/GndqNe+GBpQQCffzep
// SIG // SJGSrAxaBNFJo5cyjZyx041uXFtU0qzv6rkk2dPHy8fD
// SIG // So9mUykLPb6t62Ba0y3vX2sq9w5NaDTdDIOzUPIU1G6l
// SIG // TBu9WLXVuZ1AcERJWzUQYDt1Q9DrvD3QopxzegLEaphC
// SIG // Pqz/qImoCYVCx9zJulQgAdQrhi62P/E0Tt948DLf9mZT
// SIG // JBxycpuK0O1hl/b6JSXpgIxAm6RvqgKD/PVFFsPk76Ff
// SIG // lzTgUcFMQ9Uejd/nzj3n9bNlsfKenFBlcKkd787aoTTD
// SIG // VlQdBZ3cYdwLq2V3aVonmyzkngWQfP4s39X3NMKYygH6
// SIG // 5s0GHj0esL04joxKr+sDMdfZVObMsEOqIF9IfdJSaB2v
// SIG // JZBFY9n+14BRP6gIwtQTgTov6Y2nnQk6JXc1QeWyDZz5
// SIG // fU426JTO9cvTFbwwtekqel5sVJHCbepPjPzx9kh5ZzvO
// SIG // 5NjESgEBZVo7qraccozuqqTYCLG+GCDWpMbzYBtfsJ0z
// SIG // POsarmDwHas=
// SIG // End signature block
