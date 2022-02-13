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
exports.BoardManager = void 0;
const fs = require("fs");
const path = require("path");
const url = require("url");
const vscode = require("vscode");
const util = require("../common/util");
const constants = require("../common/constants");
const outputChannel_1 = require("../common/outputChannel");
const utils_1 = require("../common/sharedUtilities/utils");
const deviceContext_1 = require("../deviceContext");
const board_1 = require("./board");
const package_1 = require("./package");
const programmer_1 = require("./programmer");
const vscodeSettings_1 = require("./vscodeSettings");
class BoardManager {
    constructor(_settings, _arduinoApp) {
        this._settings = _settings;
        this._arduinoApp = _arduinoApp;
        this._onBoardTypeChanged = new vscode.EventEmitter();
        this._boardConfigStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, constants.statusBarPriority.BOARD);
        this._boardConfigStatusBar.command = "arduino.showBoardConfig";
        this._boardConfigStatusBar.tooltip = "Show Board Config";
    }
    loadPackages(update = false) {
        return __awaiter(this, void 0, void 0, function* () {
            this._packages = [];
            this._platforms = [];
            this._installedPlatforms = [];
            const additionalUrls = this.getAdditionalUrls();
            if (update) { // Update index files.
                yield this.setPreferenceUrls(additionalUrls);
                yield this._arduinoApp.initialize(true);
            }
            // Parse package index files.
            const indexFiles = ["package_index.json"].concat(additionalUrls);
            const rootPackageFolder = this._settings.packagePath;
            for (const indexFile of indexFiles) {
                const indexFileName = this.getIndexFileName(indexFile);
                if (!indexFileName) {
                    continue;
                }
                if (!update && !util.fileExistsSync(path.join(rootPackageFolder, indexFileName))) {
                    yield this.setPreferenceUrls(additionalUrls);
                    yield this._arduinoApp.initialize(true);
                }
                this.loadPackageContent(indexFileName);
            }
            // Load default platforms from arduino installation directory and user manually installed platforms.
            this.loadInstalledPlatforms();
            // Load all supported board types
            this.loadInstalledBoards();
            this.loadInstalledProgrammers();
            this.updateStatusBar();
            this._boardConfigStatusBar.show();
            const dc = deviceContext_1.DeviceContext.getInstance();
            dc.onChangeBoard(() => this.onDeviceContextBoardChange());
            dc.onChangeConfiguration(() => this.onDeviceContextConfigurationChange());
            // load initial board from DeviceContext by emulating
            // a board change event.
            this.onDeviceContextBoardChange();
            this.updateStatusBar(true);
        });
    }
    changeBoardType() {
        return __awaiter(this, void 0, void 0, function* () {
            const supportedBoardTypes = this.listBoards();
            if (supportedBoardTypes.length === 0) {
                vscode.window.showInformationMessage("No supported board is available.");
                return;
            }
            // TODO:? Add separator item between different platforms.
            const chosen = yield vscode.window.showQuickPick(supportedBoardTypes.map((entry) => {
                return {
                    label: entry.name,
                    description: entry.platform.name,
                    entry,
                };
            }).sort((a, b) => {
                if (a.description === b.description) {
                    return a.label === b.label ? 0 : (a.label > b.label ? 1 : -1);
                }
                else {
                    return a.description > b.description ? 1 : -1;
                }
            }), { placeHolder: "Select board type" });
            if (chosen && chosen.label) {
                this.doChangeBoardType(chosen.entry);
            }
        });
    }
    updatePackageIndex(indexUri) {
        return __awaiter(this, void 0, void 0, function* () {
            let allUrls = this.getAdditionalUrls();
            if (!(allUrls.indexOf(indexUri) >= 0)) {
                allUrls = allUrls.concat(indexUri);
                vscodeSettings_1.VscodeSettings.getInstance().updateAdditionalUrls(allUrls);
                yield this._arduinoApp.setPref("boardsmanager.additional.urls", this.getAdditionalUrls().join(","));
            }
            return true;
        });
    }
    get onBoardTypeChanged() {
        return this._onBoardTypeChanged.event;
    }
    doChangeBoardType(targetBoard) {
        const dc = deviceContext_1.DeviceContext.getInstance();
        if (dc.board === targetBoard.key) {
            return;
        }
        // Resetting the board first that we don't overwrite the configuration
        // of the previous board.
        this._currentBoard = null;
        // This will cause a configuration changed event which will have no
        // effect because no current board is set.
        dc.configuration = targetBoard.customConfig;
        // This will generate a device context board event which will set the
        // correct board and configuration. We know that it will trigger - we
        // made sure above that the boards actually differ
        dc.board = targetBoard.key;
    }
    get packages() {
        return this._packages;
    }
    get platforms() {
        return this._platforms;
    }
    get installedBoards() {
        return this._boards;
    }
    get installedProgrammers() {
        return this._programmers;
    }
    get currentBoard() {
        return this._currentBoard;
    }
    getInstalledPlatforms() {
        // Always using manually installed platforms to overwrite the same platform from arduino installation directory.
        const installedPlatforms = this.getDefaultPlatforms();
        const mergePlatform = (plat) => {
            const find = installedPlatforms.find((_plat) => {
                return _plat.packageName === plat.packageName && _plat.architecture === plat.architecture;
            });
            if (!find) {
                installedPlatforms.push(plat);
            }
            else {
                find.defaultPlatform = plat.defaultPlatform;
                find.version = plat.version;
                find.rootBoardPath = plat.rootBoardPath;
            }
        };
        const customPlatforms = this.getCustomPlatforms();
        const manuallyInstalled = this.getManuallyInstalledPlatforms();
        customPlatforms.forEach(mergePlatform);
        manuallyInstalled.forEach(mergePlatform);
        return installedPlatforms;
    }
    loadPackageContent(indexFile) {
        const indexFileName = this.getIndexFileName(indexFile);
        if (!util.fileExistsSync(path.join(this._settings.packagePath, indexFileName))) {
            return;
        }
        const packageContent = fs.readFileSync(path.join(this._settings.packagePath, indexFileName), "utf8");
        if (!packageContent) {
            return;
        }
        let rawModel = null;
        try {
            rawModel = JSON.parse(packageContent);
        }
        catch (ex) {
            outputChannel_1.arduinoChannel.error(`Invalid json file "${path.join(this._settings.packagePath, indexFileName)}".
            Suggest to remove it manually and allow boardmanager to re-download it.`);
            return;
        }
        if (!rawModel || !rawModel.packages || !rawModel.packages.length) {
            return;
        }
        this._packages = this._packages.concat(rawModel.packages);
        rawModel.packages.forEach((pkg) => {
            pkg.platforms.forEach((plat) => {
                plat.package = pkg;
                const addedPlatform = this._platforms
                    .find((_plat) => _plat.architecture === plat.architecture && _plat.package.name === plat.package.name);
                if (addedPlatform) {
                    // union boards from all versions.
                    // We should not union boards: https://github.com/Microsoft/vscode-arduino/issues/414
                    // addedPlatform.boards = util.union(addedPlatform.boards, plat.boards, (a, b) => {
                    //     return a.name === b.name;
                    // });
                    if (addedPlatform.name === plat.name) {
                        addedPlatform.versions.push(plat.version);
                        // Check if this is the latest version. Platforms typically support more boards in later versions.
                        addedPlatform.versions.sort(utils_1.versionCompare);
                        if (plat.version === addedPlatform.versions[addedPlatform.versions.length - 1]) {
                            addedPlatform.boards = plat.boards;
                        }
                    }
                }
                else {
                    plat.versions = [plat.version];
                    // Clear the version information since the plat will be used to contain all supported versions.
                    plat.version = "";
                    this._platforms.push(plat);
                }
            });
        });
    }
    updateInstalledPlatforms(pkgName, arch) {
        const archPath = path.join(this._settings.packagePath, "packages", pkgName, "hardware", arch);
        const allVersion = util.filterJunk(util.readdirSync(archPath, true));
        if (allVersion && allVersion.length) {
            const newPlatform = {
                packageName: pkgName,
                architecture: arch,
                version: allVersion[0],
                rootBoardPath: path.join(archPath, allVersion[0]),
                defaultPlatform: false,
            };
            const existingPlatform = this._platforms.find((_plat) => {
                return _plat.package.name === pkgName && _plat.architecture === arch;
            });
            if (existingPlatform) {
                existingPlatform.defaultPlatform = newPlatform.defaultPlatform;
                if (!existingPlatform.installedVersion) {
                    existingPlatform.installedVersion = newPlatform.version;
                    existingPlatform.rootBoardPath = newPlatform.rootBoardPath;
                    this._installedPlatforms.push(existingPlatform);
                }
                this.loadInstalledBoardsFromPlatform(existingPlatform);
                this.loadInstalledProgrammersFromPlatform(existingPlatform);
            }
        }
    }
    updateStatusBar(show = true) {
        if (show) {
            this._boardConfigStatusBar.show();
            if (this._currentBoard) {
                this._boardConfigStatusBar.text = this._currentBoard.name;
            }
            else {
                this._boardConfigStatusBar.text = "<Select Board Type>";
            }
        }
        else {
            this._boardConfigStatusBar.hide();
        }
    }
    /**
     * Event callback if DeviceContext detected a new board - either when
     * loaded from configuration file or when set by the doChangeBoardType
     * member.
     */
    onDeviceContextBoardChange() {
        const dc = deviceContext_1.DeviceContext.getInstance();
        const newBoard = this._boards.get(dc.board);
        if (board_1.boardEqual(newBoard, this._currentBoard)) {
            return;
        }
        if (newBoard) {
            this._currentBoard = newBoard;
            if (dc.configuration) {
                // In case the configuration is incompatible, we reset it as
                // setting partially valid configurations can lead to nasty
                // surprises. When setting a new board this is acceptable
                const r = this._currentBoard.loadConfig(dc.configuration);
                if (r !== package_1.BoardConfigResult.Success && r !== package_1.BoardConfigResult.SuccessNoChange) {
                    this._currentBoard.resetConfig();
                    // we don't reset dc.configuration to give the user a
                    // chance to fix her/his configuration
                    this.invalidConfigWarning(r);
                }
            }
            else {
                this._currentBoard.resetConfig();
                dc.configuration = undefined;
            }
        }
        else {
            this._currentBoard = null;
        }
        this._onBoardTypeChanged.fire();
        this.updateStatusBar();
    }
    /**
     * Event callback if DeviceContext detected a configuration change
     * - either when loaded from configuration file or when set by the
     * doChangeBoardType member.
     */
    onDeviceContextConfigurationChange() {
        const dc = deviceContext_1.DeviceContext.getInstance();
        if (this._currentBoard) {
            const r = this._currentBoard.loadConfig(dc.configuration);
            if (r !== package_1.BoardConfigResult.Success && r !== package_1.BoardConfigResult.SuccessNoChange) {
                this._currentBoard.resetConfig();
                // We reset the configuration here but do not write it back
                // to the configuration file - this can be annoying when
                // someone tries to set a special configuration and doesn't
                // get it right the first time.
                this.invalidConfigWarning(r);
            }
        }
    }
    invalidConfigWarning(result) {
        let what = "";
        switch (result) {
            case package_1.BoardConfigResult.InvalidFormat:
                what = ": Invalid format must be of the form \"key1=value2,key1=value2,...\"";
                break;
            case package_1.BoardConfigResult.InvalidConfigID:
                what = ": Invalid configuration key";
                break;
            case package_1.BoardConfigResult.InvalidOptionID:
                what = ": Invalid configuration value";
                break;
        }
        vscode.window.showWarningMessage(`Invalid board configuration detected in configuration file${what}. Falling back to defaults.`);
    }
    loadInstalledPlatforms() {
        const installed = this.getInstalledPlatforms();
        installed.forEach((platform) => {
            const existingPlatform = this._platforms.find((_plat) => {
                return _plat.package.name === platform.packageName && _plat.architecture === platform.architecture;
            });
            if (existingPlatform) {
                existingPlatform.defaultPlatform = platform.defaultPlatform;
                if (!existingPlatform.installedVersion) {
                    existingPlatform.installedVersion = platform.version;
                    existingPlatform.rootBoardPath = platform.rootBoardPath;
                    this._installedPlatforms.push(existingPlatform);
                }
            }
            else {
                platform.installedVersion = platform.version;
                this._installedPlatforms.push(platform);
            }
        });
    }
    // Default arduino package information from arduino installation directory.
    getDefaultPlatforms() {
        const defaultPlatforms = [];
        try {
            const packageBundled = fs.readFileSync(path.join(this._settings.defaultPackagePath, "package_index_bundled.json"), "utf8");
            if (!packageBundled) {
                return defaultPlatforms;
            }
            const bundledObject = JSON.parse(packageBundled);
            if (bundledObject && bundledObject.packages) {
                for (const pkg of bundledObject.packages) {
                    for (const platform of pkg.platforms) {
                        if (platform.version) {
                            defaultPlatforms.push({
                                packageName: pkg.name,
                                architecture: platform.architecture,
                                version: platform.version,
                                rootBoardPath: path.join(this._settings.defaultPackagePath, pkg.name, platform.architecture),
                                defaultPlatform: true,
                            });
                        }
                    }
                }
            }
        }
        catch (ex) {
        }
        return defaultPlatforms;
    }
    getCustomPlatforms() {
        const customPlatforms = [];
        const hardwareFolder = path.join(this._settings.sketchbookPath, "hardware");
        if (!util.directoryExistsSync(hardwareFolder)) {
            return customPlatforms;
        }
        const dirs = util.filterJunk(util.readdirSync(hardwareFolder, true)); // in Mac, filter .DS_Store file.
        if (!dirs || dirs.length < 1) {
            return customPlatforms;
        }
        for (const packageName of dirs) {
            const architectures = util.filterJunk(util.readdirSync(path.join(hardwareFolder, packageName), true));
            if (!architectures || architectures.length < 1) {
                continue;
            }
            architectures.forEach((architecture) => {
                const platformFolder = path.join(hardwareFolder, packageName, architecture);
                if (util.fileExistsSync(path.join(platformFolder, "boards.txt")) && util.fileExistsSync(path.join(platformFolder, "platform.txt"))) {
                    const configs = util.parseConfigFile(path.join(platformFolder, "platform.txt"));
                    customPlatforms.push({
                        packageName,
                        architecture,
                        version: configs.get("version"),
                        rootBoardPath: path.join(hardwareFolder, packageName, architecture),
                        defaultPlatform: false,
                    });
                }
            });
        }
        return customPlatforms;
    }
    // User manually installed packages.
    getManuallyInstalledPlatforms() {
        const manuallyInstalled = [];
        const rootPackagePath = path.join(path.join(this._settings.packagePath, "packages"));
        if (!util.directoryExistsSync(rootPackagePath)) {
            return manuallyInstalled;
        }
        const dirs = util.filterJunk(util.readdirSync(rootPackagePath, true)); // in Mac, filter .DS_Store file.
        for (const packageName of dirs) {
            const archPath = path.join(this._settings.packagePath, "packages", packageName, "hardware");
            if (!util.directoryExistsSync(archPath)) {
                continue;
            }
            const architectures = util.filterJunk(util.readdirSync(archPath, true));
            architectures.forEach((architecture) => {
                const allVersion = util.filterJunk(util.readdirSync(path.join(archPath, architecture), true));
                if (allVersion && allVersion.length) {
                    manuallyInstalled.push({
                        packageName,
                        architecture,
                        version: allVersion[0],
                        rootBoardPath: path.join(archPath, architecture, allVersion[0]),
                        defaultPlatform: false,
                    });
                }
            });
        }
        return manuallyInstalled;
    }
    loadInstalledBoards() {
        this._boards = new Map();
        this._installedPlatforms.forEach((plat) => {
            this.loadInstalledBoardsFromPlatform(plat);
        });
    }
    loadInstalledBoardsFromPlatform(plat) {
        if (util.fileExistsSync(path.join(plat.rootBoardPath, "boards.txt"))) {
            const boardContent = fs.readFileSync(path.join(plat.rootBoardPath, "boards.txt"), "utf8");
            const res = board_1.parseBoardDescriptor(boardContent, plat);
            res.forEach((bd) => {
                this._boards.set(bd.key, bd);
            });
        }
    }
    loadInstalledProgrammers() {
        this._programmers = new Map();
        this._installedPlatforms.forEach((plat) => {
            this.loadInstalledProgrammersFromPlatform(plat);
        });
    }
    loadInstalledProgrammersFromPlatform(plat) {
        if (util.fileExistsSync(path.join(plat.rootBoardPath, "programmers.txt"))) {
            const programmersContent = fs.readFileSync(path.join(plat.rootBoardPath, "programmers.txt"), "utf8");
            const res = programmer_1.parseProgrammerDescriptor(programmersContent, plat);
            res.forEach((prog) => {
                this._programmers.set(prog.name, prog);
            });
        }
    }
    listBoards() {
        const result = [];
        this._boards.forEach((b) => {
            result.push(b);
        });
        return result;
    }
    getIndexFileName(uriString) {
        if (!uriString) {
            return;
        }
        const normalizedUrl = url.parse(uriString);
        if (!normalizedUrl) {
            return;
        }
        return normalizedUrl.pathname.substr(normalizedUrl.pathname.lastIndexOf("/") + 1);
    }
    getAdditionalUrls() {
        // For better compatibility, merge urls both in user settings and arduino IDE preferences.
        const settingsUrls = vscodeSettings_1.VscodeSettings.getInstance().additionalUrls;
        let preferencesUrls = [];
        const preferences = this._settings.preferences;
        if (preferences && preferences.has("boardsmanager.additional.urls")) {
            preferencesUrls = util.toStringArray(preferences.get("boardsmanager.additional.urls"));
        }
        return util.union(settingsUrls, preferencesUrls);
    }
    setPreferenceUrls(additionalUrls) {
        return __awaiter(this, void 0, void 0, function* () {
            const settingsUrls = additionalUrls.join(",");
            if (this._settings.preferences.get("boardsmanager.additional.urls") !== settingsUrls) {
                yield this._arduinoApp.setPref("boardsmanager.additional.urls", settingsUrls);
            }
        });
    }
}
exports.BoardManager = BoardManager;

//# sourceMappingURL=boardManager.js.map

// SIG // Begin signature block
// SIG // MIInuAYJKoZIhvcNAQcCoIInqTCCJ6UCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // ux+MfpZLs+5GIBJEHePPLWmglTXa5nQ5LNg96Wss6wmg
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIHWS07k6QkM2NMDMB3f7
// SIG // zb8A8i1H3Q+eVFAPrA9ZCMKrMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAkliBSsdVUSq0AGwHTgdE0kKK6iaVoVdHGvBC
// SIG // DucRWKsMJBwBSX2zHJhDiSCZ7RtVhrgg7SnXdGEhXRPj
// SIG // rdGYePsQinMSp/F8D9XDJReKGcoLEp0I23CCLXgURiu/
// SIG // noKCdsuDTaXzSj+qwfQ0x8F+2HFVkWTQWlJLf+RAj3LQ
// SIG // kMOhmv1izPg5l9dIunBECBHeUvALt8+1+/yIo9w6ID/6
// SIG // NIinXN5czGwJvwidR7+XhlEW+QzfblgTOCXOAwHxd+9B
// SIG // TCtzkGXOXV0xs2lHFHroMJTgoqRh3bw6bvfupOGpDqDp
// SIG // ySHEQRZcB7gei7KzJR+GoqSbdiYZ83agy7P2Rf6/eaGC
// SIG // FxkwghcVBgorBgEEAYI3AwMBMYIXBTCCFwEGCSqGSIb3
// SIG // DQEHAqCCFvIwghbuAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFZBgsqhkiG9w0BCRABBKCCAUgEggFEMIIBQAIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCAYTOsS
// SIG // qQbuMmz8xmGXvMthnfnqGL+Nu+4ZMALhraeckwIGYf1S
// SIG // 306EGBMyMDIyMDIxMTAxNTc0NS4xMjdaMASAAgH0oIHY
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
// SIG // MC8GCSqGSIb3DQEJBDEiBCAif4rtrIozK7NEwE6ZDrlj
// SIG // +JXT6JSU6xF0wOqSJPcn6zCB+gYLKoZIhvcNAQkQAi8x
// SIG // geowgecwgeQwgb0EINWti/gVKpDPBn/E5iEFnYHik062
// SIG // FyMDqHzriYgYmGmeMIGYMIGApH4wfDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgUENBIDIwMTACEzMAAAGMAZdiRzZ2ZjsAAQAA
// SIG // AYwwIgQghlhORpoixOE65JtQkmaeh85Rm/4vb4wgdMuJ
// SIG // jB8y+VAwDQYJKoZIhvcNAQELBQAEggIAgh3hjhJ6ifft
// SIG // YHZ5ZyzBuXw00Tj3nWbIOG/ZHWQW72uQMOeBVTyO8rK/
// SIG // o2OkOURZ1z5mU3noIZpiNh81kiNVX8i54Jjo51TwRP25
// SIG // +hz4Rodg1uY2C4fmGaUIW5aQwtfW9hpE2b03UxTByWoH
// SIG // mInpw0P5cAHSXIqC0QGDApZ2mWRbY6B6aUNJLITYh3ap
// SIG // hlD9m5/hsk6tB+WpVl8q5cns7JIpYE4+DZ6maFQzEqK5
// SIG // /kX7a/FG2OPJQvpTfQiKUZR7LD9jzUlre/aydxk5AWB0
// SIG // xKPxTGmwniCCugscSaWrGGKYXEf5VDGvoHnYH/knetBH
// SIG // XxB0IO2VV/5zEQpCDaYmDdyInWJE0TZDn4kQSyhD7HBf
// SIG // eAbgwkSO14ndR+tnvXYYV4KvxoltH53woZyvlElvc8B+
// SIG // pGl3kddZ8q8N+cQpSIGZbmNZVUkhe2aHzy+oSmcLpE/1
// SIG // gZE0JtbL1kwPJh5la2Rvttcs8DA/C/yeZzmUHFCOVcUG
// SIG // ZK7QtiRq4HnrT19NuQ9tzyfEMVXBztZiqNTEQjBp0PVi
// SIG // xUajNLk518e1GaDd5ORaGv2xwGs4ac7QoxPMCJxzmQA3
// SIG // jePqqxe+USiJIU83faa6yf+5/AqCuKKpViO13AQa5VpQ
// SIG // rFzY7vRtSBLOp+6g+L8SoGd4YnUhKAP77BU+iL+7K2tO
// SIG // GERcr3mZ8SA=
// SIG // End signature block
