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
exports.ArduinoContentProvider = void 0;
const path = require("path");
const Uuid = require("uuid/v4");
const vscode = require("vscode");
const arduinoActivator_1 = require("../arduinoActivator");
const arduinoContext_1 = require("../arduinoContext");
const Constants = require("../common/constants");
const JSONHelper = require("../common/cycle");
const deviceContext_1 = require("../deviceContext");
const Logger = require("../logger/logger");
const localWebServer_1 = require("./localWebServer");
class ArduinoContentProvider {
    constructor(_extensionPath) {
        this._extensionPath = _extensionPath;
        this._onDidChange = new vscode.EventEmitter();
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this._webserver = new localWebServer_1.default(this._extensionPath);
            // Arduino Boards Manager
            this.addHandlerWithLogger("show-boardmanager", "/boardmanager", (req, res) => this.getHtmlView(req, res));
            this.addHandlerWithLogger("show-packagemanager", "/api/boardpackages", (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.getBoardPackages(req, res); }));
            this.addHandlerWithLogger("install-board", "/api/installboard", (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.installPackage(req, res); }), true);
            this.addHandlerWithLogger("uninstall-board", "/api/uninstallboard", (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.uninstallPackage(req, res); }), true);
            this.addHandlerWithLogger("open-link", "/api/openlink", (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.openLink(req, res); }), true);
            this.addHandlerWithLogger("open-settings", "/api/opensettings", (req, res) => this.openSettings(req, res), true);
            // Arduino Libraries Manager
            this.addHandlerWithLogger("show-librarymanager", "/librarymanager", (req, res) => this.getHtmlView(req, res));
            this.addHandlerWithLogger("load-libraries", "/api/libraries", (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.getLibraries(req, res); }));
            this.addHandlerWithLogger("install-library", "/api/installlibrary", (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.installLibrary(req, res); }), true);
            this.addHandlerWithLogger("uninstall-library", "/api/uninstalllibrary", (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.uninstallLibrary(req, res); }), true);
            this.addHandlerWithLogger("add-libpath", "/api/addlibpath", (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.addLibPath(req, res); }), true);
            // Arduino Board Config
            this.addHandlerWithLogger("show-boardconfig", "/boardconfig", (req, res) => this.getHtmlView(req, res));
            this.addHandlerWithLogger("load-installedboards", "/api/installedboards", (req, res) => this.getInstalledBoards(req, res));
            this.addHandlerWithLogger("load-configitems", "/api/configitems", (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.getBoardConfig(req, res); }));
            this.addHandlerWithLogger("update-selectedboard", "/api/updateselectedboard", (req, res) => this.updateSelectedBoard(req, res), true);
            this.addHandlerWithLogger("update-config", "/api/updateconfig", (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.updateConfig(req, res); }), true);
            // Arduino Examples TreeView
            this.addHandlerWithLogger("show-examplesview", "/examples", (req, res) => this.getHtmlView(req, res));
            this.addHandlerWithLogger("load-examples", "/api/examples", (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.getExamples(req, res); }));
            this.addHandlerWithLogger("open-example", "/api/openexample", (req, res) => this.openExample(req, res), true);
            yield this._webserver.start();
        });
    }
    provideTextDocumentContent(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!arduinoContext_1.default.initialized) {
                yield arduinoActivator_1.default.activate();
            }
            let type = "";
            if (uri.toString() === Constants.BOARD_MANAGER_URI.toString()) {
                type = "boardmanager";
            }
            else if (uri.toString() === Constants.LIBRARY_MANAGER_URI.toString()) {
                type = "librarymanager";
            }
            else if (uri.toString() === Constants.BOARD_CONFIG_URI.toString()) {
                type = "boardConfig";
            }
            else if (uri.toString() === Constants.EXAMPLES_URI.toString()) {
                type = "examples";
            }
            const timeNow = new Date().getTime();
            return `
        <html>
        <head>
            <script type="text/javascript">
                window.onload = function() {
                    console.log('reloaded results window at time ${timeNow}ms');
                    var doc = document.documentElement;
                    var styles = window.getComputedStyle(doc);
                    var backgroundcolor = styles.getPropertyValue('--background-color') || '#1e1e1e';
                    var color = styles.getPropertyValue('--color') || '#d4d4d4';
                    var theme = document.body.className || 'vscode-dark';
                    var url = "${this._webserver.getEndpointUri(type)}?" +
                            "theme=" + encodeURIComponent(theme.trim()) +
                            "&backgroundcolor=" + encodeURIComponent(backgroundcolor.trim()) +
                            "&color=" + encodeURIComponent(color.trim());
                    document.getElementById('frame').src = url;
                };
            </script>
        </head>
        <body style="margin: 0; padding: 0; height: 100%; overflow: hidden;">
            <iframe id="frame" width="100%" height="100%" frameborder="0" style="position:absolute; left: 0; right: 0; bottom: 0; top: 0px;"/>
        </body>
        </html>`;
        });
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    update(uri) {
        this._onDidChange.fire(uri);
    }
    getHtmlView(req, res) {
        return res.sendFile(path.join(this._extensionPath, "./out/views/index.html"));
    }
    getBoardPackages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield arduinoContext_1.default.boardManager.loadPackages(req.query.update === "true");
            return res.json({
                platforms: JSONHelper.decycle(arduinoContext_1.default.boardManager.platforms, undefined),
            });
        });
    }
    installPackage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body.packageName || !req.body.arch) {
                return res.status(400).send("BAD Request! Missing { packageName, arch } parameters!");
            }
            else {
                try {
                    yield arduinoContext_1.default.arduinoApp.installBoard(req.body.packageName, req.body.arch, req.body.version);
                    return res.json({
                        status: "OK",
                    });
                }
                catch (error) {
                    return res.status(500).send(`Install board failed with message "code:${error.code}, err:${error.stderr}"`);
                }
            }
        });
    }
    uninstallPackage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body.packagePath) {
                return res.status(400).send("BAD Request! Missing { packagePath } parameter!");
            }
            else {
                try {
                    yield arduinoContext_1.default.arduinoApp.uninstallBoard(req.body.boardName, req.body.packagePath);
                    return res.json({
                        status: "OK",
                    });
                }
                catch (error) {
                    return res.status(500).send(`Uninstall board failed with message "${error}"`);
                }
            }
        });
    }
    openLink(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body.link) {
                return res.status(400).send("BAD Request! Missing { link } parameter!");
            }
            else {
                try {
                    yield vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(req.body.link));
                    return res.json({
                        status: "OK",
                    });
                }
                catch (error) {
                    return res.status(500).send(`Cannot open the link with error message "${error}"`);
                }
            }
        });
    }
    openSettings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body.query) {
                return res.status(400).send("BAD Request! Missing { query } parameter!");
            }
            else {
                try {
                    yield vscode.commands.executeCommand("workbench.action.openGlobalSettings", { query: req.body.query });
                    return res.json({
                        status: "OK",
                    });
                }
                catch (error) {
                    return res.status(500).send(`Cannot open the setting with error message "${error}"`);
                }
            }
        });
    }
    getLibraries(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield arduinoContext_1.default.arduinoApp.libraryManager.loadLibraries(req.query.update === "true");
            return res.json({
                libraries: arduinoContext_1.default.arduinoApp.libraryManager.libraries,
            });
        });
    }
    installLibrary(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body.libraryName) {
                return res.status(400).send("BAD Request! Missing { libraryName } parameters!");
            }
            else {
                try {
                    yield arduinoContext_1.default.arduinoApp.installLibrary(req.body.libraryName, req.body.version);
                    return res.json({
                        status: "OK",
                    });
                }
                catch (error) {
                    return res.status(500).send(`Install library failed with message "code:${error.code}, err:${error.stderr}"`);
                }
            }
        });
    }
    uninstallLibrary(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body.libraryPath) {
                return res.status(400).send("BAD Request! Missing { libraryPath } parameters!");
            }
            else {
                try {
                    yield arduinoContext_1.default.arduinoApp.uninstallLibrary(req.body.libraryName, req.body.libraryPath);
                    return res.json({
                        status: "OK",
                    });
                }
                catch (error) {
                    return res.status(500).send(`Uninstall library failed with message "code:${error.code}, err:${error.stderr}"`);
                }
            }
        });
    }
    addLibPath(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body.libraryPath) {
                return res.status(400).send("BAD Request! Missing { libraryPath } parameters!");
            }
            else {
                try {
                    yield arduinoContext_1.default.arduinoApp.includeLibrary(req.body.libraryPath);
                    return res.json({
                        status: "OK",
                    });
                }
                catch (error) {
                    return res.status(500).send(`Add library path failed with message "code:${error.code}, err:${error.stderr}"`);
                }
            }
        });
    }
    getInstalledBoards(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const installedBoards = [];
            arduinoContext_1.default.boardManager.installedBoards.forEach((b) => {
                const isSelected = arduinoContext_1.default.boardManager.currentBoard ? b.key === arduinoContext_1.default.boardManager.currentBoard.key : false;
                installedBoards.push({
                    key: b.key,
                    name: b.name,
                    platform: b.platform.name,
                    isSelected,
                });
            });
            return res.json({
                installedBoards: JSONHelper.decycle(installedBoards, undefined),
            });
        });
    }
    getBoardConfig(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return res.json({
                configitems: (arduinoContext_1.default.boardManager.currentBoard === null) ? null : arduinoContext_1.default.boardManager.currentBoard.configItems,
            });
        });
    }
    updateSelectedBoard(req, res) {
        if (!req.body.boardId) {
            return res.status(400).send("BAD Request! Missing parameters!");
        }
        else {
            try {
                const bd = arduinoContext_1.default.boardManager.installedBoards.get(req.body.boardId);
                arduinoContext_1.default.boardManager.doChangeBoardType(bd);
                return res.json({
                    status: "OK",
                });
            }
            catch (error) {
                return res.status(500).send(`Update board config failed with message "code:${error.code}, err:${error.stderr}"`);
            }
        }
    }
    updateConfig(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body.configId || !req.body.optionId) {
                return res.status(400).send("BAD Request! Missing parameters!");
            }
            else {
                try {
                    arduinoContext_1.default.boardManager.currentBoard.updateConfig(req.body.configId, req.body.optionId);
                    const dc = deviceContext_1.DeviceContext.getInstance();
                    dc.configuration = arduinoContext_1.default.boardManager.currentBoard.customConfig;
                    return res.json({
                        status: "OK",
                    });
                }
                catch (error) {
                    return res.status(500).send(`Update board config failed with message "code:${error.code}, err:${error.stderr}"`);
                }
            }
        });
    }
    getExamples(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const examples = yield arduinoContext_1.default.arduinoApp.exampleManager.loadExamples();
            return res.json({
                examples,
            });
        });
    }
    openExample(req, res) {
        if (!req.body.examplePath) {
            return res.status(400).send("BAD Request! Missing { examplePath } parameter!");
        }
        else {
            try {
                arduinoContext_1.default.arduinoApp.openExample(req.body.examplePath);
                return res.json({
                    status: "OK",
                });
            }
            catch (error) {
                return res.status(500).send(`Cannot open the example folder with error message "${error}"`);
            }
        }
    }
    addHandlerWithLogger(handlerName, url, handler, post = false) {
        const wrappedHandler = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const guid = Uuid().replace(/-/g, "");
            let properties = {};
            if (post) {
                properties = Object.assign({}, req.body);
                // Removal requirement for GDPR
                if ("install-board" === handlerName) {
                    const packageNameKey = "packageName";
                    delete properties[packageNameKey];
                }
            }
            Logger.traceUserData(`start-` + handlerName, Object.assign({ correlationId: guid }, properties));
            const timer1 = new Logger.Timer();
            try {
                yield Promise.resolve(handler(req, res));
            }
            catch (error) {
                Logger.traceError("expressHandlerError", error, Object.assign({ correlationId: guid, handlerName }, properties));
            }
            Logger.traceUserData(`end-` + handlerName, { correlationId: guid, duration: timer1.end() });
        });
        if (post) {
            this._webserver.addPostHandler(url, wrappedHandler);
        }
        else {
            this._webserver.addHandler(url, wrappedHandler);
        }
    }
}
exports.ArduinoContentProvider = ArduinoContentProvider;

//# sourceMappingURL=arduinoContentProvider.js.map

// SIG // Begin signature block
// SIG // MIIntgYJKoZIhvcNAQcCoIInpzCCJ6MCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // Cf+knuL33MbvoytlsKp6ROKB7ZpofaEerNVQpctU3BWg
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGY0w
// SIG // ghmJAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAJSizOq+JXzOdsAAAAAAlIwDQYJYIZI
// SIG // AWUDBAIBBQCgga4wGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEILT/73ENg8pW1t5KqE2i
// SIG // iENpdGyjr/R/loKug/C/V319MEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAFtk7lFFxDXQ/ivsgZvbeOrOhI56SYS1nyldD
// SIG // RnPPdD7GBWawyj6RPm4Khb5dpfWWmu27kT0onYd/O0vo
// SIG // wbXYbEz2dWsee+neLYYv1qx+L5lPq6XC/3+CLm8vqCyi
// SIG // 2B9n/3WFSlXuu+P4Dnr5+JREeg/GJsLlcDMYpf/RmxH2
// SIG // 1YptA0yFhyBoofDiNffWEvGKOaRDAGXgkEX+wbXbW9Xp
// SIG // A0zwHdSmC/JBy/A05QwBUtNTrk5zziv8n5x11gUxLAuX
// SIG // 7827js/WUYXnnHh245F+Qn6OlDgUzAcoZneYe3Qf+IyG
// SIG // ebn7Rt+keNdaLiLTph2S4DMqK3fpmfJCPKPVOiy1t6GC
// SIG // FxcwghcTBgorBgEEAYI3AwMBMYIXAzCCFv8GCSqGSIb3
// SIG // DQEHAqCCFvAwghbsAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFXBgsqhkiG9w0BCRABBKCCAUYEggFCMIIBPgIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCAi98ix
// SIG // rcsyQbl25lhmQmOypZ10D5aQ0MXk+nJ1SPAWywIGYf1i
// SIG // e9PAGBEyMDIyMDIxMTAxNTc0Ny45WjAEgAIB9KCB2KSB
// SIG // 1TCB0jELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMk
// SIG // TWljcm9zb2Z0IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1p
// SIG // dGVkMSYwJAYDVQQLEx1UaGFsZXMgVFNTIEVTTjozQkQ0
// SIG // LTRCODAtNjlDMzElMCMGA1UEAxMcTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgU2VydmljZaCCEWgwggcUMIIE/KADAgEC
// SIG // AhMzAAABibS/hjCEHEuPAAEAAAGJMA0GCSqGSIb3DQEB
// SIG // CwUAMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMT
// SIG // HU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMB4X
// SIG // DTIxMTAyODE5Mjc0MVoXDTIzMDEyNjE5Mjc0MVowgdIx
// SIG // CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9u
// SIG // MRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xLTArBgNVBAsTJE1pY3Jv
// SIG // c29mdCBJcmVsYW5kIE9wZXJhdGlvbnMgTGltaXRlZDEm
// SIG // MCQGA1UECxMdVGhhbGVzIFRTUyBFU046M0JENC00Qjgw
// SIG // LTY5QzMxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0
// SIG // YW1wIFNlcnZpY2UwggIiMA0GCSqGSIb3DQEBAQUAA4IC
// SIG // DwAwggIKAoICAQC9BlfFkWZrqmWa47K82lXzE407Bxii
// SIG // Vkb8GPJlYZKTkk4ZovKsoh3lXFUdYeWyYkThK+fOx2mw
// SIG // qZXHyi04294hQW9Jx4RmnxVea7mbV+7wvtz7eXBdyJuN
// SIG // xyq0S+1CyWiRBXHSv4vnhpus0NqvAUbvchpGJ0hLWL1z
// SIG // 66cnyhjKENEusLKwUBXHJCE81mRYrtnz9Ua6RoosBYdc
// SIG // KH/5HneHjaAUv73+YAAvHMJde6h+Lx/9coKbvE3BVzWE
// SIG // 40ILPqir3gC5/NU2SQhbhutRCBikJwmb1TRc2ZC+2uil
// SIG // gOf1S1jxhDQ0p6dc+12Asd1Dw2e/eKASsoutYjRrmfmO
// SIG // N0p/CT7ya9qSp1maU6x545LVeylA0kArW5mWUAhNydBk
// SIG // 5w7mh+M5Dfe6NZyQBd3P7/HejuXgBT9NI4zMZkzCFR21
// SIG // XALd1Jsi2lJUWCeMzYI4Qn3OAJp286KsYMs3jvWNkjaM
// SIG // KWSOwlN2A+TfjdNADgkW92z+6dmrS4uv6eJndfjg4HHb
// SIG // H6BWWWfZzhRtlc254DjJLVMkZtskUggsCZNQD0C6Pl4h
// SIG // IZNs2LJbHv0ecI5Nqvf1AQqjObgudOYNfLT8oj8f+dhk
// SIG // Yq5Md9yQ/bzBBLTqsP58NLnEvBxEwJb3YOQdea1uEbJG
// SIG // KUE4vkvFl6VB/G3njCXhZQLQB0ASiU96Q4PA7wIDAQAB
// SIG // o4IBNjCCATIwHQYDVR0OBBYEFJdvH7NHWngggB6C4Dqs
// SIG // cqSt+XtQMB8GA1UdIwQYMBaAFJ+nFV0AXmJdg/Tl0mWn
// SIG // G1M1GelyMF8GA1UdHwRYMFYwVKBSoFCGTmh0dHA6Ly93
// SIG // d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY3JsL01pY3Jv
// SIG // c29mdCUyMFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEwKDEp
// SIG // LmNybDBsBggrBgEFBQcBAQRgMF4wXAYIKwYBBQUHMAKG
// SIG // UGh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMv
// SIG // Y2VydHMvTWljcm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBD
// SIG // QSUyMDIwMTAoMSkuY3J0MAwGA1UdEwEB/wQCMAAwEwYD
// SIG // VR0lBAwwCgYIKwYBBQUHAwgwDQYJKoZIhvcNAQELBQAD
// SIG // ggIBAI60t2lZQjgrB8sut9oqssH3YOpsCykZYzjVNo7g
// SIG // mX6wfE+jnba67cYpAKOaRFat4e2V/LL2Q6TstZrHeTeR
// SIG // 7wa19619uHuofQt5XZc5aDf0E6cd/qZNxmrsVhJllyHU
// SIG // kNCNz3z452WjD6haKHQNu3gJX97X1lwT7WfXPNaSyRQR
// SIG // 3R/mM8hSKzfen6+RjyzN24C0Jwhw8VSEjwdvlqU9QA8y
// SIG // MbPApvs0gpud/yPxw/XwCzki95yQXSiHVzDrdFj+88rr
// SIG // YsNh2mLtacbY5u+eB9ZUq3CLBMjiMePZw72rfscN788+
// SIG // XbXqBKlRmHRqnbiYqYwN9wqnU3iYR2zHPiix46s9h4Ww
// SIG // cdYkUnoCK++qfvQpN4mmnmv4PFKpt5LLSbEhQ6r+UBpT
// SIG // GA1JBVRfbq3yv59yKSh8q/bdYeu1FXe3utVOwH1jOtFq
// SIG // KKSbPrwrkdZ230ypQvE9A+j6mlnQtGqQ5p7jrr5QpFjQ
// SIG // nFa12sxzm8eUdl+eqNrCP9GwzZLpDp9r1P0KdjU3PsNg
// SIG // EbfJknII8WyuBTTmz2WOp+xKm2kV1SH1Hhx74vvVJYMs
// SIG // zbH/UwUsscAxtewSnwqWgQa1oNQufG19La1iF+4oapFe
// SIG // gR8M8Aych1O9A+HcYdDhKOSQEBEcvQxjvlqWEZModaML
// SIG // ZotU6jyhsogGTyF+cUNR/8TJXDi5MIIHcTCCBVmgAwIB
// SIG // AgITMwAAABXF52ueAptJmQAAAAAAFTANBgkqhkiG9w0B
// SIG // AQsFADCBiDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEyMDAGA1UE
// SIG // AxMpTWljcm9zb2Z0IFJvb3QgQ2VydGlmaWNhdGUgQXV0
// SIG // aG9yaXR5IDIwMTAwHhcNMjEwOTMwMTgyMjI1WhcNMzAw
// SIG // OTMwMTgzMjI1WjB8MQswCQYDVQQGEwJVUzETMBEGA1UE
// SIG // CBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEe
// SIG // MBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYw
// SIG // JAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0Eg
// SIG // MjAxMDCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoC
// SIG // ggIBAOThpkzntHIhC3miy9ckeb0O1YLT/e6cBwfSqWxO
// SIG // dcjKNVf2AX9sSuDivbk+F2Az/1xPx2b3lVNxWuJ+Slr+
// SIG // uDZnhUYjDLWNE893MsAQGOhgfWpSg0S3po5GawcU88V2
// SIG // 9YZQ3MFEyHFcUTE3oAo4bo3t1w/YJlN8OWECesSq/XJp
// SIG // rx2rrPY2vjUmZNqYO7oaezOtgFt+jBAcnVL+tuhiJdxq
// SIG // D89d9P6OU8/W7IVWTe/dvI2k45GPsjksUZzpcGkNyjYt
// SIG // cI4xyDUoveO0hyTD4MmPfrVUj9z6BVWYbWg7mka97aSu
// SIG // eik3rMvrg0XnRm7KMtXAhjBcTyziYrLNueKNiOSWrAFK
// SIG // u75xqRdbZ2De+JKRHh09/SDPc31BmkZ1zcRfNN0Sidb9
// SIG // pSB9fvzZnkXftnIv231fgLrbqn427DZM9ituqBJR6L8F
// SIG // A6PRc6ZNN3SUHDSCD/AQ8rdHGO2n6Jl8P0zbr17C89XY
// SIG // cz1DTsEzOUyOArxCaC4Q6oRRRuLRvWoYWmEBc8pnol7X
// SIG // KHYC4jMYctenIPDC+hIK12NvDMk2ZItboKaDIV1fMHSR
// SIG // lJTYuVD5C4lh8zYGNRiER9vcG9H9stQcxWv2XFJRXRLb
// SIG // JbqvUAV6bMURHXLvjflSxIUXk8A8FdsaN8cIFRg/eKtF
// SIG // tvUeh17aj54WcmnGrnu3tz5q4i6tAgMBAAGjggHdMIIB
// SIG // 2TASBgkrBgEEAYI3FQEEBQIDAQABMCMGCSsGAQQBgjcV
// SIG // AgQWBBQqp1L+ZMSavoKRPEY1Kc8Q/y8E7jAdBgNVHQ4E
// SIG // FgQUn6cVXQBeYl2D9OXSZacbUzUZ6XIwXAYDVR0gBFUw
// SIG // UzBRBgwrBgEEAYI3TIN9AQEwQTA/BggrBgEFBQcCARYz
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9E
// SIG // b2NzL1JlcG9zaXRvcnkuaHRtMBMGA1UdJQQMMAoGCCsG
// SIG // AQUFBwMIMBkGCSsGAQQBgjcUAgQMHgoAUwB1AGIAQwBB
// SIG // MAsGA1UdDwQEAwIBhjAPBgNVHRMBAf8EBTADAQH/MB8G
// SIG // A1UdIwQYMBaAFNX2VsuP6KJcYmjRPZSQW9fOmhjEMFYG
// SIG // A1UdHwRPME0wS6BJoEeGRWh0dHA6Ly9jcmwubWljcm9z
// SIG // b2Z0LmNvbS9wa2kvY3JsL3Byb2R1Y3RzL01pY1Jvb0Nl
// SIG // ckF1dF8yMDEwLTA2LTIzLmNybDBaBggrBgEFBQcBAQRO
// SIG // MEwwSgYIKwYBBQUHMAKGPmh0dHA6Ly93d3cubWljcm9z
// SIG // b2Z0LmNvbS9wa2kvY2VydHMvTWljUm9vQ2VyQXV0XzIw
// SIG // MTAtMDYtMjMuY3J0MA0GCSqGSIb3DQEBCwUAA4ICAQCd
// SIG // VX38Kq3hLB9nATEkW+Geckv8qW/qXBS2Pk5HZHixBpOX
// SIG // PTEztTnXwnE2P9pkbHzQdTltuw8x5MKP+2zRoZQYIu7p
// SIG // Zmc6U03dmLq2HnjYNi6cqYJWAAOwBb6J6Gngugnue99q
// SIG // b74py27YP0h1AdkY3m2CDPVtI1TkeFN1JFe53Z/zjj3G
// SIG // 82jfZfakVqr3lbYoVSfQJL1AoL8ZthISEV09J+BAljis
// SIG // 9/kpicO8F7BUhUKz/AyeixmJ5/ALaoHCgRlCGVJ1ijbC
// SIG // HcNhcy4sa3tuPywJeBTpkbKpW99Jo3QMvOyRgNI95ko+
// SIG // ZjtPu4b6MhrZlvSP9pEB9s7GdP32THJvEKt1MMU0sHrY
// SIG // UP4KWN1APMdUbZ1jdEgssU5HLcEUBHG/ZPkkvnNtyo4J
// SIG // vbMBV0lUZNlz138eW0QBjloZkWsNn6Qo3GcZKCS6OEua
// SIG // bvshVGtqRRFHqfG3rsjoiV5PndLQTHa1V1QJsWkBRH58
// SIG // oWFsc/4Ku+xBZj1p/cvBQUl+fpO+y/g75LcVv7TOPqUx
// SIG // UYS8vwLBgqJ7Fx0ViY1w/ue10CgaiQuPNtq6TPmb/wrp
// SIG // NPgkNWcr4A245oyZ1uEi6vAnQj0llOZ0dFtq0Z4+7X6g
// SIG // MTN9vMvpe784cETRkPHIqzqKOghif9lwY1NNje6CbaUF
// SIG // EMFxBmoQtB1VM1izoXBm8qGCAtcwggJAAgEBMIIBAKGB
// SIG // 2KSB1TCB0jELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEtMCsGA1UE
// SIG // CxMkTWljcm9zb2Z0IElyZWxhbmQgT3BlcmF0aW9ucyBM
// SIG // aW1pdGVkMSYwJAYDVQQLEx1UaGFsZXMgVFNTIEVTTjoz
// SIG // QkQ0LTRCODAtNjlDMzElMCMGA1UEAxMcTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgU2VydmljZaIjCgEBMAcGBSsOAwIa
// SIG // AxUAIaUJreR63J657Ltsk2laQy6IJxCggYMwgYCkfjB8
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNy
// SIG // b3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDANBgkqhkiG
// SIG // 9w0BAQUFAAIFAOWvycIwIhgPMjAyMjAyMTEwMTI4MzRa
// SIG // GA8yMDIyMDIxMjAxMjgzNFowdzA9BgorBgEEAYRZCgQB
// SIG // MS8wLTAKAgUA5a/JwgIBADAKAgEAAgIUbgIB/zAHAgEA
// SIG // AgISkzAKAgUA5bEbQgIBADA2BgorBgEEAYRZCgQCMSgw
// SIG // JjAMBgorBgEEAYRZCgMCoAowCAIBAAIDB6EgoQowCAIB
// SIG // AAIDAYagMA0GCSqGSIb3DQEBBQUAA4GBABnSALdFt8I4
// SIG // COLdqIoCugPH/7QOHZzux3IA7YtBbrhIjLcYolIGj5El
// SIG // iZk6yJhXcwzkNcfd4SjATf1aLvBy4T6jUf4V0MGEWNYH
// SIG // F8d4lLiej0xFOPtzladc1We8UnhYF/YpVTTlS+NADfeg
// SIG // KHW9qP66HUKzvzrX8H4fyr+de6qRMYIEDTCCBAkCAQEw
// SIG // gZMwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMA
// SIG // AAGJtL+GMIQcS48AAQAAAYkwDQYJYIZIAWUDBAIBBQCg
// SIG // ggFKMBoGCSqGSIb3DQEJAzENBgsqhkiG9w0BCRABBDAv
// SIG // BgkqhkiG9w0BCQQxIgQg53j4kV35hAlF0Ldhv2ZuZZbG
// SIG // fqxEQp7+dJ/mjvjQshAwgfoGCyqGSIb3DQEJEAIvMYHq
// SIG // MIHnMIHkMIG9BCBmd0cx3FBXVWxulYc5MepYTJy9xEmb
// SIG // txjr2X9SZPyPRTCBmDCBgKR+MHwxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0
// SIG // YW1wIFBDQSAyMDEwAhMzAAABibS/hjCEHEuPAAEAAAGJ
// SIG // MCIEIBCQo9vsih3ubzQSzobc+LeSOGQO6iV+gd5JgMgE
// SIG // oKEOMA0GCSqGSIb3DQEBCwUABIICAG8NJnZmpi1h83lx
// SIG // EiGxutN31NtnmGh7vNlFw/DeKXogUa9Nfuz6MAlxDCdg
// SIG // K5jazIx93upgnJCkpq6l5JeAbRroiWhohIUBo3VUk+/F
// SIG // VhWWP2ZyxcQv2MPmblwQlNIf6nCnkupmHv5O6++OWtDr
// SIG // VabF/uqGVYZb3fzOa9nb4A/0QgSFUsHe2UKWMJRGt43x
// SIG // rN8WVk6w/zkMT/TJy6W20kQc/9KVq77ewgvGJnOBWOHo
// SIG // /Zj5W6kK6DihQIApuay/CGSoaNPGckOl86Okp1uZ860V
// SIG // 9aBsSd9TQnQjDjbWC+Pv/Jix8y1fP4f+45eP2mbp9wtB
// SIG // o8V/qTougJu5G2DlHeSIboWz2mlmyMGihO5EGTJPrmhR
// SIG // qjiKMLAVv502Dn0STj65s5prYXCVUvVbRb3a6jE0MqBm
// SIG // UqEAX3CqNjGpPDvrwYb8b/lRz+e0IuabGgbAw9eysSBD
// SIG // /UNGVOiIIOHPdtB5atyL1vsKus5+GGOXdi4WuWy2XMWP
// SIG // S2YHcdUOeM73ual8uJnatHk21A2sR66orhu/hYorDp9B
// SIG // U2w1s6UGioyjVW5NReVgcocOAoxBPSkdS5Jd+mxyuNX8
// SIG // fTuw8ymuWl2/oVRaXOGe4mMJz1yBZ3q+YX6KdFMqzsqS
// SIG // 4JcvXNgICIKTfd7z0Si2kkdhWwUnvk+fG+jrAnVOzTP2
// SIG // O7m/XqSJ
// SIG // End signature block
