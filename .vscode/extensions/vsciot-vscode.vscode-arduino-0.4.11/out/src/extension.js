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
exports.deactivate = exports.activate = void 0;
const impor = require("impor")(__dirname);
const fs = require("fs");
const path = require("path");
const uuidModule = impor("uuid/v4");
const vscode = require("vscode");
const constants = require("./common/constants");
const arduinoContentProviderModule = impor("./arduino/arduinoContentProvider");
const vscodeSettings_1 = require("./arduino/vscodeSettings");
const arduinoActivatorModule = impor("./arduinoActivator");
const arduinoContextModule = impor("./arduinoContext");
const constants_1 = require("./common/constants");
const platform_1 = require("./common/platform");
const util = require("./common/util");
const workspace_1 = require("./common/workspace");
const arduinoDebugConfigurationProviderModule = impor("./debug/configurationProvider");
const deviceContext_1 = require("./deviceContext");
const completionProviderModule = impor("./langService/completionProvider");
const Logger = require("./logger/logger");
const nsatModule = impor("./nsat");
const arduino_1 = require("./arduino/arduino");
const serialMonitor_1 = require("./serialmonitor/serialMonitor");
const usbDetectorModule = impor("./serialmonitor/usbDetector");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        Logger.configure(context);
        const activeGuid = uuidModule().replace(/-/g, "");
        Logger.traceUserData("start-activate-extension", { correlationId: activeGuid });
        // Show a warning message if the working file is not under the workspace folder.
        // People should know the extension might not work appropriately, they should look for the doc to get started.
        const openEditor = vscode.window.activeTextEditor;
        if (openEditor && openEditor.document.fileName.endsWith(".ino")) {
            const workingFile = path.normalize(openEditor.document.fileName);
            const workspaceFolder = (vscode.workspace && workspace_1.ArduinoWorkspace.rootPath) || "";
            if (!workspaceFolder || workingFile.indexOf(path.normalize(workspaceFolder)) < 0) {
                vscode.window.showWarningMessage(`The open file "${workingFile}" is not inside the workspace folder, ` +
                    "the arduino extension might not work properly.");
            }
        }
        const vscodeSettings = vscodeSettings_1.VscodeSettings.getInstance();
        const deviceContext = deviceContext_1.DeviceContext.getInstance();
        deviceContext.extensionPath = context.extensionPath;
        context.subscriptions.push(deviceContext);
        const commandExecution = (command, commandBody, args, getUserData) => __awaiter(this, void 0, void 0, function* () {
            const guid = uuidModule().replace(/-/g, "");
            Logger.traceUserData(`start-command-` + command, { correlationId: guid });
            const timer1 = new Logger.Timer();
            let telemetryResult;
            try {
                let result = commandBody(...args);
                if (result) {
                    result = yield Promise.resolve(result);
                }
                if (result && result.telemetry) {
                    telemetryResult = result;
                }
                else if (getUserData) {
                    telemetryResult = getUserData();
                }
            }
            catch (error) {
                Logger.traceError("executeCommandError", error, { correlationId: guid, command });
            }
            Logger.traceUserData(`end-command-` + command, Object.assign(Object.assign({}, telemetryResult), { correlationId: guid, duration: timer1.end() }));
            nsatModule.NSAT.takeSurvey(context);
        });
        const registerArduinoCommand = (command, commandBody, getUserData) => {
            return context.subscriptions.push(vscode.commands.registerCommand(command, (...args) => __awaiter(this, void 0, void 0, function* () {
                if (!arduinoContextModule.default.initialized) {
                    yield arduinoActivatorModule.default.activate();
                }
                if (!serialMonitor_1.SerialMonitor.getInstance().initialized) {
                    serialMonitor_1.SerialMonitor.getInstance().initialize();
                }
                const arduinoPath = arduinoContextModule.default.arduinoApp.settings.arduinoPath;
                const commandPath = arduinoContextModule.default.arduinoApp.settings.commandPath;
                const useArduinoCli = arduinoContextModule.default.arduinoApp.settings.useArduinoCli;
                // Pop up vscode User Settings page when cannot resolve arduino path.
                if (!arduinoPath || !platform_1.validateArduinoPath(arduinoPath, useArduinoCli)) {
                    Logger.notifyUserError("InvalidArduinoPath", new Error(constants.messages.INVALID_ARDUINO_PATH));
                    vscode.commands.executeCommand("workbench.action.openGlobalSettings");
                }
                else if (!commandPath || !util.fileExistsSync(commandPath)) {
                    Logger.notifyUserError("InvalidCommandPath", new Error(constants.messages.INVALID_COMMAND_PATH + commandPath));
                }
                else {
                    yield commandExecution(command, commandBody, args, getUserData);
                }
            })));
        };
        const registerNonArduinoCommand = (command, commandBody, getUserData) => {
            return context.subscriptions.push(vscode.commands.registerCommand(command, (...args) => __awaiter(this, void 0, void 0, function* () {
                if (!serialMonitor_1.SerialMonitor.getInstance().initialized) {
                    serialMonitor_1.SerialMonitor.getInstance().initialize();
                }
                yield commandExecution(command, commandBody, args, getUserData);
            })));
        };
        registerArduinoCommand("arduino.initialize", () => __awaiter(this, void 0, void 0, function* () { return yield deviceContext.initialize(); }));
        registerArduinoCommand("arduino.verify", () => __awaiter(this, void 0, void 0, function* () {
            if (!arduinoContextModule.default.arduinoApp.building) {
                yield vscode.window.withProgress({
                    location: vscode.ProgressLocation.Window,
                    title: "Arduino: Verifying...",
                }, () => __awaiter(this, void 0, void 0, function* () {
                    yield arduinoContextModule.default.arduinoApp.build(arduino_1.BuildMode.Verify);
                }));
            }
        }), () => {
            return {
                board: (arduinoContextModule.default.boardManager.currentBoard === null) ? null :
                    arduinoContextModule.default.boardManager.currentBoard.name,
            };
        });
        registerArduinoCommand("arduino.upload", () => __awaiter(this, void 0, void 0, function* () {
            if (!arduinoContextModule.default.arduinoApp.building) {
                yield vscode.window.withProgress({
                    location: vscode.ProgressLocation.Window,
                    title: "Arduino: Uploading...",
                }, () => __awaiter(this, void 0, void 0, function* () {
                    yield arduinoContextModule.default.arduinoApp.build(arduino_1.BuildMode.Upload);
                }));
            }
        }), () => {
            return { board: arduinoContextModule.default.boardManager.currentBoard.name };
        });
        registerArduinoCommand("arduino.cliUpload", () => __awaiter(this, void 0, void 0, function* () {
            if (!arduinoContextModule.default.arduinoApp.building) {
                yield vscode.window.withProgress({
                    location: vscode.ProgressLocation.Window,
                    title: "Arduino: Using CLI to upload...",
                }, () => __awaiter(this, void 0, void 0, function* () {
                    yield arduinoContextModule.default.arduinoApp.build(arduino_1.BuildMode.CliUpload);
                }));
            }
        }), () => {
            return { board: arduinoContextModule.default.boardManager.currentBoard.name };
        });
        registerArduinoCommand("arduino.selectSketch", () => __awaiter(this, void 0, void 0, function* () {
            const sketchFileName = deviceContext.sketch;
            // Include any ino, cpp, or c files under the workspace folder
            const includePattern = "**/*.{ino,cpp,c}";
            // The sketchbook folder may contain hardware & library folders, any sketches under these paths
            // should be excluded
            const sketchbookPath = arduinoContextModule.default.arduinoApp.settings.sketchbookPath;
            const excludePatterns = [
                path.relative(workspace_1.ArduinoWorkspace.rootPath, sketchbookPath + "/hardware/**"),
                path.relative(workspace_1.ArduinoWorkspace.rootPath, sketchbookPath + "/libraries/**")
            ];
            // If an output path is specified, it should be excluded as well
            if (deviceContext.output) {
                const outputPath = path.relative(workspace_1.ArduinoWorkspace.rootPath, path.resolve(workspace_1.ArduinoWorkspace.rootPath, deviceContext.output));
                excludePatterns.push(`${outputPath}/**`);
            }
            const excludePattern = `{${excludePatterns.map((p) => p.replace("\\", "/")).join(",")}}`;
            const fileUris = yield vscode.workspace.findFiles(includePattern, excludePattern);
            const newSketchFileName = yield vscode.window.showQuickPick(fileUris.map((fileUri) => ({
                label: path.relative(workspace_1.ArduinoWorkspace.rootPath, fileUri.fsPath),
                description: fileUri.fsPath,
            })), { placeHolder: sketchFileName, matchOnDescription: true });
            if (!newSketchFileName) {
                return;
            }
            deviceContext.sketch = newSketchFileName.label;
            deviceContext.showStatusBar();
        }));
        registerArduinoCommand("arduino.uploadUsingProgrammer", () => __awaiter(this, void 0, void 0, function* () {
            if (!arduinoContextModule.default.arduinoApp.building) {
                yield vscode.window.withProgress({
                    location: vscode.ProgressLocation.Window,
                    title: "Arduino: Uploading (programmer)...",
                }, () => __awaiter(this, void 0, void 0, function* () {
                    yield arduinoContextModule.default.arduinoApp.build(arduino_1.BuildMode.UploadProgrammer);
                }));
            }
        }), () => {
            return { board: arduinoContextModule.default.boardManager.currentBoard.name };
        });
        registerArduinoCommand("arduino.cliUploadUsingProgrammer", () => __awaiter(this, void 0, void 0, function* () {
            if (!arduinoContextModule.default.arduinoApp.building) {
                yield vscode.window.withProgress({
                    location: vscode.ProgressLocation.Window,
                    title: "Arduino: Using CLI to upload (programmer)...",
                }, () => __awaiter(this, void 0, void 0, function* () {
                    yield arduinoContextModule.default.arduinoApp.build(arduino_1.BuildMode.CliUploadProgrammer);
                }));
            }
        }), () => {
            return { board: arduinoContextModule.default.boardManager.currentBoard.name };
        });
        registerArduinoCommand("arduino.rebuildIntelliSenseConfig", () => __awaiter(this, void 0, void 0, function* () {
            if (!arduinoContextModule.default.arduinoApp.building) {
                yield vscode.window.withProgress({
                    location: vscode.ProgressLocation.Window,
                    title: "Arduino: Rebuilding IS Configuration...",
                }, () => __awaiter(this, void 0, void 0, function* () {
                    yield arduinoContextModule.default.arduinoApp.build(arduino_1.BuildMode.Analyze);
                }));
            }
        }), () => {
            return { board: arduinoContextModule.default.boardManager.currentBoard.name };
        });
        registerArduinoCommand("arduino.selectProgrammer", () => __awaiter(this, void 0, void 0, function* () {
            // Note: this guard does not prevent building while setting the
            // programmer. But when looking at the code of selectProgrammer
            // it seems not to be possible to trigger building while setting
            // the programmer. If the timed IntelliSense analysis is triggered
            // this is not a problem, since it doesn't use the programmer.
            if (!arduinoContextModule.default.arduinoApp.building) {
                try {
                    yield arduinoContextModule.default.arduinoApp.programmerManager.selectProgrammer();
                }
                catch (ex) {
                }
            }
        }), () => {
            return {
                board: (arduinoContextModule.default.boardManager.currentBoard === null) ? null :
                    arduinoContextModule.default.boardManager.currentBoard.name,
            };
        });
        registerArduinoCommand("arduino.openExample", (path) => arduinoContextModule.default.arduinoApp.openExample(path));
        registerArduinoCommand("arduino.loadPackages", () => __awaiter(this, void 0, void 0, function* () { return yield arduinoContextModule.default.boardManager.loadPackages(true); }));
        registerArduinoCommand("arduino.installBoard", (packageName, arch, version = "") => __awaiter(this, void 0, void 0, function* () {
            let installed = false;
            const installedBoards = arduinoContextModule.default.boardManager.installedBoards;
            installedBoards.forEach((board, key) => {
                let _packageName;
                if (board.platform.package && board.platform.package.name) {
                    _packageName = board.platform.package.name;
                }
                else {
                    _packageName = board.platform.packageName;
                }
                if (packageName === _packageName &&
                    arch === board.platform.architecture &&
                    (!version || version === board.platform.installedVersion)) {
                    installed = true;
                }
            });
            if (!installed) {
                yield arduinoContextModule.default.boardManager.loadPackages(true);
                yield arduinoContextModule.default.arduinoApp.installBoard(packageName, arch, version);
            }
            return;
        }));
        // serial monitor commands
        const serialMonitor = serialMonitor_1.SerialMonitor.getInstance();
        context.subscriptions.push(serialMonitor);
        registerNonArduinoCommand("arduino.selectSerialPort", () => serialMonitor.selectSerialPort(null, null));
        registerNonArduinoCommand("arduino.openSerialMonitor", () => serialMonitor.openSerialMonitor());
        registerNonArduinoCommand("arduino.changeBaudRate", () => serialMonitor.changeBaudRate());
        registerNonArduinoCommand("arduino.changeTimestampFormat", () => serialMonitor.changeTimestampFormat());
        registerNonArduinoCommand("arduino.sendMessageToSerialPort", () => serialMonitor.sendMessageToSerialPort());
        registerNonArduinoCommand("arduino.closeSerialMonitor", (port, showWarning = true) => serialMonitor.closeSerialMonitor(port, showWarning));
        const completionProvider = new completionProviderModule.CompletionProvider();
        context.subscriptions.push(vscode.languages.registerCompletionItemProvider(constants_1.ARDUINO_MODE, completionProvider, "<", '"', "."));
        context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider("arduino", new arduinoDebugConfigurationProviderModule.ArduinoDebugConfigurationProvider()));
        if (workspace_1.ArduinoWorkspace.rootPath && (util.fileExistsSync(path.join(workspace_1.ArduinoWorkspace.rootPath, constants_1.ARDUINO_CONFIG_FILE))
            || (openEditor && openEditor.document.fileName.endsWith(".ino")))) {
            (() => __awaiter(this, void 0, void 0, function* () {
                if (!arduinoContextModule.default.initialized) {
                    yield arduinoActivatorModule.default.activate();
                }
                if (!serialMonitor_1.SerialMonitor.getInstance().initialized) {
                    serialMonitor_1.SerialMonitor.getInstance().initialize();
                }
                vscode.commands.executeCommand("setContext", "vscode-arduino:showExampleExplorer", true);
            }))();
        }
        vscode.window.onDidChangeActiveTextEditor(() => __awaiter(this, void 0, void 0, function* () {
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor && ((path.basename(activeEditor.document.fileName) === "arduino.json"
                && path.basename(path.dirname(activeEditor.document.fileName)) === ".vscode")
                || activeEditor.document.fileName.endsWith(".ino"))) {
                if (!arduinoContextModule.default.initialized) {
                    yield arduinoActivatorModule.default.activate();
                }
                if (!serialMonitor_1.SerialMonitor.getInstance().initialized) {
                    serialMonitor_1.SerialMonitor.getInstance().initialize();
                }
                vscode.commands.executeCommand("setContext", "vscode-arduino:showExampleExplorer", true);
            }
        }));
        const allowPDEFiletype = vscodeSettings.allowPDEFiletype;
        if (allowPDEFiletype) {
            vscode.workspace.onDidOpenTextDocument((document) => __awaiter(this, void 0, void 0, function* () {
                if (/\.pde$/.test(document.uri.fsPath)) {
                    const newFsName = document.uri.fsPath.replace(/\.pde$/, ".ino");
                    yield vscode.commands.executeCommand("workbench.action.closeActiveEditor");
                    fs.renameSync(document.uri.fsPath, newFsName);
                    yield vscode.commands.executeCommand("vscode.open", vscode.Uri.file(newFsName));
                }
            }));
            vscode.window.onDidChangeActiveTextEditor((editor) => __awaiter(this, void 0, void 0, function* () {
                if (!editor) {
                    return;
                }
                const document = editor.document;
                if (/\.pde$/.test(document.uri.fsPath)) {
                    const newFsName = document.uri.fsPath.replace(/\.pde$/, ".ino");
                    yield vscode.commands.executeCommand("workbench.action.closeActiveEditor");
                    fs.renameSync(document.uri.fsPath, newFsName);
                    yield vscode.commands.executeCommand("vscode.open", vscode.Uri.file(newFsName));
                }
            }));
        }
        Logger.traceUserData("end-activate-extension", { correlationId: activeGuid });
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            const arduinoManagerProvider = new arduinoContentProviderModule.ArduinoContentProvider(context.extensionPath);
            yield arduinoManagerProvider.initialize();
            context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(constants_1.ARDUINO_MANAGER_PROTOCOL, arduinoManagerProvider));
            registerArduinoCommand("arduino.showBoardManager", () => __awaiter(this, void 0, void 0, function* () {
                const panel = vscode.window.createWebviewPanel("arduinoBoardManager", "Arduino Board Manager", vscode.ViewColumn.Two, {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                });
                panel.webview.html = yield arduinoManagerProvider.provideTextDocumentContent(constants_1.BOARD_MANAGER_URI);
            }));
            registerArduinoCommand("arduino.showLibraryManager", () => __awaiter(this, void 0, void 0, function* () {
                const panel = vscode.window.createWebviewPanel("arduinoLibraryManager", "Arduino Library Manager", vscode.ViewColumn.Two, {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                });
                panel.webview.html = yield arduinoManagerProvider.provideTextDocumentContent(constants_1.LIBRARY_MANAGER_URI);
            }));
            registerArduinoCommand("arduino.showBoardConfig", () => __awaiter(this, void 0, void 0, function* () {
                const panel = vscode.window.createWebviewPanel("arduinoBoardConfiguration", "Arduino Board Configuration", vscode.ViewColumn.Two, {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                });
                panel.webview.html = yield arduinoManagerProvider.provideTextDocumentContent(constants_1.BOARD_CONFIG_URI);
            }));
            registerArduinoCommand("arduino.showExamples", (forceRefresh = false) => __awaiter(this, void 0, void 0, function* () {
                vscode.commands.executeCommand("setContext", "vscode-arduino:showExampleExplorer", true);
                if (forceRefresh) {
                    vscode.commands.executeCommand("arduino.reloadExample");
                }
                const panel = vscode.window.createWebviewPanel("arduinoExamples", "Arduino Examples", vscode.ViewColumn.Two, {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                });
                panel.webview.html = yield arduinoManagerProvider.provideTextDocumentContent(constants_1.EXAMPLES_URI);
            }));
            // change board type
            registerArduinoCommand("arduino.changeBoardType", () => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield arduinoContextModule.default.boardManager.changeBoardType();
                }
                catch (exception) {
                    Logger.error(exception.message);
                }
                arduinoManagerProvider.update(constants_1.LIBRARY_MANAGER_URI);
                arduinoManagerProvider.update(constants_1.EXAMPLES_URI);
            }), () => {
                return { board: arduinoContextModule.default.boardManager.currentBoard.name };
            });
            registerArduinoCommand("arduino.reloadExample", () => {
                arduinoManagerProvider.update(constants_1.EXAMPLES_URI);
            }, () => {
                return {
                    board: (arduinoContextModule.default.boardManager.currentBoard === null) ? null :
                        arduinoContextModule.default.boardManager.currentBoard.name,
                };
            });
        }), 100);
        setTimeout(() => {
            // delay to detect usb
            usbDetectorModule.UsbDetector.getInstance().initialize(context.extensionPath);
            usbDetectorModule.UsbDetector.getInstance().startListening();
        }, 200);
    });
}
exports.activate = activate;
function deactivate() {
    return __awaiter(this, void 0, void 0, function* () {
        const monitor = serialMonitor_1.SerialMonitor.getInstance();
        yield monitor.closeSerialMonitor(null, false);
        usbDetectorModule.UsbDetector.getInstance().stopListening();
        Logger.traceUserData("deactivate-extension");
    });
}
exports.deactivate = deactivate;

//# sourceMappingURL=extension.js.map

// SIG // Begin signature block
// SIG // MIInuAYJKoZIhvcNAQcCoIInqTCCJ6UCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // nAmhk9KSIMbQuI5n7GVIRAnn3aFo6TTXo8+yy2joocug
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIEnfKtgmVsDCh/6tND5X
// SIG // Koww2+/2TTgEKlQmeF6MzixVMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAYCQ1IAu7hZVvu/GBtegIVYh9jTIRaxhsYsU6
// SIG // B8oXGPQ4M65Q57luqOG06vp+qrWEA6L4khyv3HsM6P66
// SIG // Git59qPbGocr0vMpKkOvM8lVDVT/y9v0U3eCS8lIk6Q/
// SIG // Agxk5Nd9xRrm/+dJYvaWzFkhuZ31tYwg8ijz/8Ue1Oog
// SIG // LictPiTwEDCgnghRtKYnASCZAwUb7BK7+vpQ2HkwLoDU
// SIG // fL2P2E+kJCD/CtxgwKELr11gUCx1eaRA+PvHJqzZAJ+n
// SIG // ZQhihgQrvKCSJN0NqiYdB8b0MC7AJBij+hJyFDSYHIAC
// SIG // DV2wu+eqedQeAHWCrMB+dohGvPC7QDUP2+ugJAP76aGC
// SIG // FxkwghcVBgorBgEEAYI3AwMBMYIXBTCCFwEGCSqGSIb3
// SIG // DQEHAqCCFvIwghbuAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFZBgsqhkiG9w0BCRABBKCCAUgEggFEMIIBQAIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCBSOcxk
// SIG // dx6D1KGw33k4g7Dg8NWXq/d5/mxO3lRy0zMJuwIGYf1S
// SIG // 306PGBMyMDIyMDIxMTAxNTc0NS4yODJaMASAAgH0oIHY
// SIG // pIHVMIHSMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYDVQQL
// SIG // EyRNaWNyb3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExp
// SIG // bWl0ZWQxJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNOOjg2
// SIG // REYtNEJCQy05MzM1MSUwIwYDVQQDExxNaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBTZXJ2aWNloIIRaDCCBxQwggT8oAMC
// SIG // AQICEzMAAAGMAZdiRzZ2ZjsAAQAAAYwwDQYJKoZIhvcN
// SIG // AQELBQAwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UE
// SIG // AxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAw
// SIG // HhcNMjExMDI4MTkyNzQ0WhcNMjMwMTI2MTkyNzQ0WjCB
// SIG // 0jELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWlj
// SIG // cm9zb2Z0IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVk
// SIG // MSYwJAYDVQQLEx1UaGFsZXMgVFNTIEVTTjo4NkRGLTRC
// SIG // QkMtOTMzNTElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgU2VydmljZTCCAiIwDQYJKoZIhvcNAQEBBQAD
// SIG // ggIPADCCAgoCggIBANNIaEyhE/khrGssPvQRXZvrmfpL
// SIG // xDxi3ebBfF5U91MuGBqk/Ovg6/Bt5Oqv5UWoIsUSr5/o
// SIG // NgBUS/Vbmagtbk72u3WTfQoYqLRxxZsskGT2pV3SUwvJ
// SIG // yiK24EzFwMIf5m4Z5qGsbCPYxpYr2IIuRjThO7uk1eFD
// SIG // rZ1T/IqIU1HzTCoWWiXc5lg44Vguy4z1yIWpvUIUZFc6
// SIG // 5MXySnOfQLGhg9z74kZIB6BsX6XVhzz2lvIohB43ODw5
// SIG // gipbltyfiHVN/B/jJCj5npAuxrUUy1ygQrlil0vE42WP
// SIG // 8JDXM1jRKPpeSdzmXR3lYoMacwp3rJGX3B18awl9obnu
// SIG // 6ib1q5LBUrZGWzhuyGJmn2DEK2RrpZe9j50taCHUHWJ0
// SIG // ef54HL0kG9dRkNJDTA84irEnfuYn1GmGyS2dFxMTVeKi
// SIG // 1wkuuQ4/vBcoAo7Tb5A4geR7PSOyvc8WbFG+3yikhhGf
// SIG // cgNCYE1m3ADwmD7bgB1SfFCmk/eu6SZu/q94YHHt/FVN
// SIG // /bKXnhx4GgkuL163pUy4lDAJdDrZOZ3CkCnNpBp77sD9
// SIG // kQkt5BBBQMaJ8C5/Kcnncq3mU2wTEAan9aN5I9IpTie/
// SIG // 3/z93Na52mDtNRgyaJr+6LaW+c/tYa0qCLPLvunq7iSg
// SIG // k4oXdIv/G3OuwChe+sKVrr1vQYW1DE7FpMMOK+NnAgMB
// SIG // AAGjggE2MIIBMjAdBgNVHQ4EFgQUls5ThqmCIWCIeVad
// SIG // PojK3UCLUiMwHwYDVR0jBBgwFoAUn6cVXQBeYl2D9OXS
// SIG // ZacbUzUZ6XIwXwYDVR0fBFgwVjBUoFKgUIZOaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jcmwvTWlj
// SIG // cm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUyMDIwMTAo
// SIG // MSkuY3JsMGwGCCsGAQUFBwEBBGAwXjBcBggrBgEFBQcw
// SIG // AoZQaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9w
// SIG // cy9jZXJ0cy9NaWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIw
// SIG // UENBJTIwMjAxMCgxKS5jcnQwDAYDVR0TAQH/BAIwADAT
// SIG // BgNVHSUEDDAKBggrBgEFBQcDCDANBgkqhkiG9w0BAQsF
// SIG // AAOCAgEA12jFRVjCCanW5UGSuqJLO3HQlMHjwJphCHnb
// SIG // MrrIFDCEJUKmo3wj/YhufMjhUkcdpOfY9oQAUmQcRZm5
// SIG // FY8IWBAtciT0JveOuIFM+RvrjludYvLnnngd4dovg5qF
// SIG // jSjUrpSDcn0hoFujwgwokajt6p/CmFcy86Hpnz4q/1Fc
// SIG // eQgIFXBAwDLcW0a0x1wQAV8gmumkN/o7pFgeWkMy8Oqo
// SIG // R4c+xyDlPav0PWNjZ1QSj38yJcD429ja0Bn0J107LHxQ
// SIG // /fDqUR6tO2VMdtYOKbPFd94UkpCdrg8IbaeVbRRpxfgM
// SIG // cxQZQr3N9yz05l7HM5cuvskIAEcJjR3jQNutlqiyyTPO
// SIG // CM/DktVXxNTesmApC44PNfsxl7I7zBpowZYssWcF1hli
// SIG // ZrKLwek+odRq35rzCrnThPdg+u0kd809w3QOScC/UwM1
// SIG // /FIYtGhmLZ+bjVAxW8SKMyETKS1aT/2Di54Pq9r/LPJc
// SIG // lr9Gn48GWBwSeuDFlTcR3GjbY85GLUI3WeW4cpGunV/g
// SIG // 7UA/W4d844tEpa31QyC8RG+jo8qrXxo+4lmbya2+AKiF
// SIG // YB0Gg84LosREvYnrRYpB33+qfewuaqG002ysDdABD96u
// SIG // bXsiPTSDlZSZdIIuSG3efB4n9ySzur6fuch146Ei/zJY
// SIG // RZrxrWmJkMA+ys05vbgAxeAcz/5sdr8wggdxMIIFWaAD
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
// SIG // Ojg2REYtNEJCQy05MzM1MSUwIwYDVQQDExxNaWNyb3Nv
// SIG // ZnQgVGltZS1TdGFtcCBTZXJ2aWNloiMKAQEwBwYFKw4D
// SIG // AhoDFQA0ovIU66v0PKKacHhsrmSzRCav1aCBgzCBgKR+
// SIG // MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMA0GCSqG
// SIG // SIb3DQEBBQUAAgUA5a+57DAiGA8yMDIyMDIxMTAwMjEw
// SIG // MFoYDzIwMjIwMjEyMDAyMTAwWjB3MD0GCisGAQQBhFkK
// SIG // BAExLzAtMAoCBQDlr7nsAgEAMAoCAQACAgSHAgH/MAcC
// SIG // AQACAhFPMAoCBQDlsQtsAgEAMDYGCisGAQQBhFkKBAIx
// SIG // KDAmMAwGCisGAQQBhFkKAwKgCjAIAgEAAgMHoSChCjAI
// SIG // AgEAAgMBhqAwDQYJKoZIhvcNAQEFBQADgYEAceVh1uGg
// SIG // V2LJhqgHNnzoaKL/kUZGKnres9VTND4THJJ8DbTnbNXA
// SIG // 4HEIkgOC+2hjtRDyN+Swt6i5zbW4LfdZZd9nRTF0jAwh
// SIG // tO9Ohf3cpnhqyq1yCcYssliJAT56cGrONfX1mcI0h2gE
// SIG // 18clXRsUdgu3fFtGm4qajuyYECGYvjkxggQNMIIECQIB
// SIG // ATCBkzB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQD
// SIG // Ex1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAIT
// SIG // MwAAAYwBl2JHNnZmOwABAAABjDANBglghkgBZQMEAgEF
// SIG // AKCCAUowGgYJKoZIhvcNAQkDMQ0GCyqGSIb3DQEJEAEE
// SIG // MC8GCSqGSIb3DQEJBDEiBCCyq3wRCWYiaJFzGPVwgZ3t
// SIG // Se3WXdx8yCLkncCcBy+UGjCB+gYLKoZIhvcNAQkQAi8x
// SIG // geowgecwgeQwgb0EINWti/gVKpDPBn/E5iEFnYHik062
// SIG // FyMDqHzriYgYmGmeMIGYMIGApH4wfDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgUENBIDIwMTACEzMAAAGMAZdiRzZ2ZjsAAQAA
// SIG // AYwwIgQghlhORpoixOE65JtQkmaeh85Rm/4vb4wgdMuJ
// SIG // jB8y+VAwDQYJKoZIhvcNAQELBQAEggIAbDg/3E6F6SOP
// SIG // JP5IzioI9Lnr5JuM+U0Mf6tgjn/e1/uZNm+Mjy9Dsx3h
// SIG // Ut489hXM4qgXxqGl4xamVTCK3K3zHC3Usfg6rfsiZN0y
// SIG // AUEsGvMFblDUcoAmietRaTIgm+AaHl2zE1/PFuTqdyD7
// SIG // C17mWyVb30lAKCTePkBX5w1h7aqVe3IVRdkVghoiQcAy
// SIG // 2qvk5OsM97HMmpIx2zWsfmd96D0YvtEZj/mGZcsUTIWc
// SIG // PD+L+Cy6hGtyZ61zwrILWe+YU3q2JMtJQyXGWb1T/Iio
// SIG // 64VRJotB/55q1CisGdGHovsFueEIMLLLyP+Tj1vos6Lb
// SIG // dR2RptBxaWf/B5gNHeW1s6bsWUde2PPCnqpYZtAv21F5
// SIG // 71ssNSy5LXHjx47dj+VSJY5N4leYi9rpb6U3KZTCPzTz
// SIG // HRznLCuGZFyul9BtNFifehtFpvU2NhTdYDkQdSpJ/18c
// SIG // QkipOskyNwdwq+qmpRHttiz/KoawzxLHse4K3ys6a4Gz
// SIG // zgLmevq4vYvRB95r6zdvv8yC8FOb+GYkEmFO8MLous+V
// SIG // K6/cqrxvpicGyaEhN4flomX3XN+OWInB1cUnu/0mULiw
// SIG // vZ6HWwsVRgzEFZ+NXPdplfJcHELegu37P4DFDmIYMgBO
// SIG // 2JLWU9UdkGCnb5fmIA42zVc2tMfJwqal5CUC9ZdA/OGG
// SIG // UmeV31o3ido=
// SIG // End signature block
