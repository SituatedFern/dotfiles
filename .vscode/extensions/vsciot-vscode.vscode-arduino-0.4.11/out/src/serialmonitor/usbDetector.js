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
exports.UsbDetector = void 0;
const fs = require("fs");
const os = require("os");
const path = require("path");
const vscode = require("vscode");
const vscodeSettings_1 = require("../arduino/vscodeSettings");
const arduinoActivator_1 = require("../arduinoActivator");
const arduinoContext_1 = require("../arduinoContext");
const constants_1 = require("../common/constants");
const workspace_1 = require("../common/workspace");
const util = require("../common/util");
const Logger = require("../logger/logger");
const serialMonitor_1 = require("./serialMonitor");
const HTML_EXT = ".html";
const MARKDOWN_EXT = ".md";
class UsbDetector {
    constructor() {
        this._boardDescriptors = null;
        this._extensionRoot = null;
    }
    static getInstance() {
        if (!UsbDetector._instance) {
            UsbDetector._instance = new UsbDetector();
        }
        return UsbDetector._instance;
    }
    initialize(extensionRoot) {
        this._extensionRoot = extensionRoot;
    }
    startListening() {
        return __awaiter(this, void 0, void 0, function* () {
            const enableUSBDetection = vscodeSettings_1.VscodeSettings.getInstance().enableUSBDetection;
            if (os.platform() === "linux" || !enableUSBDetection) {
                return;
            }
            this._usbDetector = require("usb-detection");
            if (!this._usbDetector) {
                return;
            }
            if (this._extensionRoot === null) {
                throw new Error("UsbDetector should be initialized before using.");
            }
            this._usbDetector.on("add", (device) => __awaiter(this, void 0, void 0, function* () {
                if (device.vendorId && device.productId) {
                    const deviceDescriptor = this.getUsbDeviceDescriptor(util.convertToHex(device.vendorId, 4), // vid and pid both are 2 bytes long.
                    util.convertToHex(device.productId, 4), this._extensionRoot);
                    // Not supported device for discovery.
                    if (!deviceDescriptor) {
                        return;
                    }
                    const boardKey = `${deviceDescriptor.package}:${deviceDescriptor.architecture}:${deviceDescriptor.id}`;
                    Logger.traceUserData("detected a board", { board: boardKey });
                    if (!arduinoContext_1.default.initialized) {
                        yield arduinoActivator_1.default.activate();
                    }
                    if (!serialMonitor_1.SerialMonitor.getInstance().initialized) {
                        serialMonitor_1.SerialMonitor.getInstance().initialize();
                    }
                    // TODO EW: this is board manager code which should be moved into board manager
                    let bd = arduinoContext_1.default.boardManager.installedBoards.get(boardKey);
                    const openEditor = vscode.window.activeTextEditor;
                    if (workspace_1.ArduinoWorkspace.rootPath && (util.fileExistsSync(path.join(workspace_1.ArduinoWorkspace.rootPath, constants_1.ARDUINO_CONFIG_FILE))
                        || (openEditor && openEditor.document.fileName.endsWith(".ino")))) {
                        if (!bd) {
                            arduinoContext_1.default.boardManager.updatePackageIndex(deviceDescriptor.indexFile).then((shouldLoadPackageContent) => {
                                const ignoreBoards = vscodeSettings_1.VscodeSettings.getInstance().ignoreBoards || [];
                                if (ignoreBoards.indexOf(deviceDescriptor.name) >= 0) {
                                    return;
                                }
                                vscode.window.showInformationMessage(`Install board package for ${deviceDescriptor.name}`, "Yes", "No", "Don't ask again").then((ans) => {
                                    if (ans === "Yes") {
                                        arduinoContext_1.default.arduinoApp.installBoard(deviceDescriptor.package, deviceDescriptor.architecture)
                                            .then(() => {
                                            if (shouldLoadPackageContent) {
                                                arduinoContext_1.default.boardManager.loadPackageContent(deviceDescriptor.indexFile);
                                            }
                                            arduinoContext_1.default.boardManager.updateInstalledPlatforms(deviceDescriptor.package, deviceDescriptor.architecture);
                                            bd = arduinoContext_1.default.boardManager.installedBoards.get(boardKey);
                                            this.switchBoard(bd, deviceDescriptor);
                                        });
                                    }
                                    else if (ans === "Don't ask again") {
                                        ignoreBoards.push(deviceDescriptor.name);
                                        vscodeSettings_1.VscodeSettings.getInstance().ignoreBoards = ignoreBoards;
                                    }
                                });
                            });
                        }
                        else if (arduinoContext_1.default.boardManager.currentBoard) {
                            const currBoard = arduinoContext_1.default.boardManager.currentBoard;
                            if (currBoard.board !== deviceDescriptor.id
                                || currBoard.platform.architecture !== deviceDescriptor.architecture
                                || currBoard.getPackageName() !== deviceDescriptor.package) {
                                const ignoreBoards = vscodeSettings_1.VscodeSettings.getInstance().ignoreBoards || [];
                                if (ignoreBoards.indexOf(deviceDescriptor.name) >= 0) {
                                    return;
                                }
                                vscode.window.showInformationMessage(`Detected board ${deviceDescriptor.name}. Would you like to switch to this board type?`, "Yes", "No", "Don't ask again")
                                    .then((ans) => {
                                    if (ans === "Yes") {
                                        return this.switchBoard(bd, deviceDescriptor);
                                    }
                                    else if (ans === "Don't ask again") {
                                        ignoreBoards.push(deviceDescriptor.name);
                                        vscodeSettings_1.VscodeSettings.getInstance().ignoreBoards = ignoreBoards;
                                    }
                                });
                            }
                            else {
                                const monitor = serialMonitor_1.SerialMonitor.getInstance();
                                monitor.selectSerialPort(deviceDescriptor.vid, deviceDescriptor.pid);
                                this.showReadMeAndExample(deviceDescriptor.readme);
                            }
                        }
                        else {
                            this.switchBoard(bd, deviceDescriptor);
                        }
                    }
                }
            }));
            this._usbDetector.startMonitoring();
        });
    }
    stopListening() {
        if (this._usbDetector) {
            this._usbDetector.stopMonitoring();
        }
    }
    pauseListening() {
        if (this._usbDetector) {
            this._usbDetector.stopMonitoring();
        }
    }
    resumeListening() {
        if (this._usbDetector) {
            this._usbDetector.startMonitoring();
        }
        else {
            this.startListening();
        }
    }
    switchBoard(bd, deviceDescriptor, showReadMe = true) {
        arduinoContext_1.default.boardManager.doChangeBoardType(bd);
        const monitor = serialMonitor_1.SerialMonitor.getInstance();
        monitor.selectSerialPort(deviceDescriptor.vid, deviceDescriptor.pid);
        if (showReadMe) {
            this.showReadMeAndExample(deviceDescriptor.readme);
        }
    }
    showReadMeAndExample(readme) {
        if (arduinoContext_1.default.boardManager.currentBoard) {
            let readmeFilePath = "";
            if (readme) {
                readmeFilePath = path.join(arduinoContext_1.default.boardManager.currentBoard.platform.rootBoardPath, readme);
            }
            if (!readmeFilePath || !util.fileExistsSync(readmeFilePath)) {
                readmeFilePath = path.join(arduinoContext_1.default.boardManager.currentBoard.platform.rootBoardPath, "README.md");
            }
            vscode.commands.executeCommand("arduino.showExamples", true);
            if (util.fileExistsSync(readmeFilePath)) {
                if (readmeFilePath.endsWith(MARKDOWN_EXT)) {
                    vscode.commands.executeCommand("markdown.showPreview", vscode.Uri.file(readmeFilePath));
                }
                else if (readmeFilePath.endsWith(HTML_EXT)) {
                    const panel = vscode.window.createWebviewPanel("arduinoBoardReadMe", "", vscode.ViewColumn.One, {
                        enableScripts: true,
                        retainContextWhenHidden: true,
                    });
                    panel.webview.html = fs.readFileSync(readmeFilePath, "utf8");
                }
            }
        }
    }
    getUsbDeviceDescriptor(vendorId, productId, extensionRoot) {
        if (!this._boardDescriptors) {
            this._boardDescriptors = [];
            const fileContent = fs.readFileSync(path.join(extensionRoot, "misc", "usbmapping.json"), "utf8");
            const boardIndexes = JSON.parse(fileContent);
            boardIndexes.forEach((boardIndex) => {
                boardIndex.boards.forEach((board) => board.indexFile = boardIndex.index_file);
                this._boardDescriptors = this._boardDescriptors.concat(boardIndex.boards);
            });
        }
        return this._boardDescriptors.find((obj) => {
            return obj.vid === vendorId && (obj.pid === productId || (obj.pid.indexOf && obj.pid.indexOf(productId) >= 0));
        });
    }
}
exports.UsbDetector = UsbDetector;

//# sourceMappingURL=usbDetector.js.map

// SIG // Begin signature block
// SIG // MIIjkAYJKoZIhvcNAQcCoIIjgTCCI30CAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // yOq3vqZEhTgrk/Xo3nQZnWr6uE5TtM9VyZgezXmgvcug
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCFWcw
// SIG // ghVjAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAJSizOq+JXzOdsAAAAAAlIwDQYJYIZI
// SIG // AWUDBAIBBQCgga4wGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEINU24eG9mtiBZSOzQBYL
// SIG // URlo1ie9rBEiyXA0EpriYnUjMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAfwWgeui4koyj7aAMJfk5hSE4WjUBSX+PCgzf
// SIG // vCu37gftpig33TpnPHtDtQsXbaNoKAYDdthe2YIFnETp
// SIG // Ytzy5QD1ILyMeeYKQGESvGjwg7aiTOZI3iCn+uMVGocK
// SIG // HZ+lEgZqM5P3lvXoidqXJknY6N/+0YDpYCwSylbMQedc
// SIG // Y7p9z8dl4prqCauHYQ0qn+6K6sSabpGvBxxGV0L5jW8s
// SIG // Nq4ntEbXvLmPDWeQi3uVW2EMUjtT8LupL+KAhydPs8v7
// SIG // 2fzNR43Bqilg0Ebz10/HFgzPKk6WpeJznQjX5QJKm+qK
// SIG // Ts54wTMjK4PnNKFRYayyBP5XkhpuIj+Ql1byiXmCC6GC
// SIG // EvEwghLtBgorBgEEAYI3AwMBMYIS3TCCEtkGCSqGSIb3
// SIG // DQEHAqCCEsowghLGAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFVBgsqhkiG9w0BCRABBKCCAUQEggFAMIIBPAIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCBYCrFF
// SIG // BS4p96G2gNP5+vmj2grSx1F9vmB0nixN+BHH8AIGYfwg
// SIG // m1GoGBMyMDIyMDIxMTAxNTc0Ny40NThaMASAAgH0oIHU
// SIG // pIHRMIHOMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSkwJwYDVQQL
// SIG // EyBNaWNyb3NvZnQgT3BlcmF0aW9ucyBQdWVydG8gUmlj
// SIG // bzEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046Rjc3Ri1F
// SIG // MzU2LTVCQUUxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2Wggg5EMIIE9TCCA92gAwIBAgIT
// SIG // MwAAAV6dKcdfhwWh6gAAAAABXjANBgkqhkiG9w0BAQsF
// SIG // ADB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDAeFw0y
// SIG // MTAxMTQxOTAyMTlaFw0yMjA0MTExOTAyMTlaMIHOMQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMSkwJwYDVQQLEyBNaWNyb3Nv
// SIG // ZnQgT3BlcmF0aW9ucyBQdWVydG8gUmljbzEmMCQGA1UE
// SIG // CxMdVGhhbGVzIFRTUyBFU046Rjc3Ri1FMzU2LTVCQUUx
// SIG // JTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNl
// SIG // cnZpY2UwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEK
// SIG // AoIBAQCa0yODkHoZ96Cqds7oelj9mYm/w8cP7Ky3nsk2
// SIG // /Xnez1/ny4O8wQNMpeorxdp+pWrhh/FuxAcETxL+2Qkl
// SIG // 8F4GGehhmh/GlPjqw1wG3OAV0zuV5yxsEm2snvUdvrkB
// SIG // 3QiZmjLc/5RAVlCucbx6I9E1K1zmXWf77+06jFgOIdQE
// SIG // 9cPyQUeJB7VdYvClnZUPnWV/4DR6QO9iKC6DpqSJmxkc
// SIG // 3BkOGdis6uHjAfcI2hUVdSRf8M9YSxSIxrZVN3ho0QYg
// SIG // RBFSO1BDDEryOKyvgnywCGZ1C7u0s5SH6klN0dKUjVGo
// SIG // cKVnQogenysyKveGfvfPPJqELqPeUQD5sx0FtTCNAgMB
// SIG // AAGjggEbMIIBFzAdBgNVHQ4EFgQUqnJ8ug3dS+VUwhAA
// SIG // ns5UeNX4HyswHwYDVR0jBBgwFoAU1WM6XIoxkPNDe3xG
// SIG // G8UzaFqFbVUwVgYDVR0fBE8wTTBLoEmgR4ZFaHR0cDov
// SIG // L2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVj
// SIG // dHMvTWljVGltU3RhUENBXzIwMTAtMDctMDEuY3JsMFoG
// SIG // CCsGAQUFBwEBBE4wTDBKBggrBgEFBQcwAoY+aHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNU
// SIG // aW1TdGFQQ0FfMjAxMC0wNy0wMS5jcnQwDAYDVR0TAQH/
// SIG // BAIwADATBgNVHSUEDDAKBggrBgEFBQcDCDANBgkqhkiG
// SIG // 9w0BAQsFAAOCAQEAfyH8WYTGJATKkZl54f1YreG38coq
// SIG // AJa+xydVw0h0yL0cAw9Txq9LqWRP766yP0Df9Vourw3C
// SIG // ppydq+14+qVmTmanPQafrgb6T2rpbnuLLbt06ik3PRbt
// SIG // iuYm3LaReKBz32fiCngoaKfjJPYOzeZZR879Ggg4mjNM
// SIG // NmgE96490B0EvIo50Of6obc8KNQKFJ1dctrq1sF+Wh3V
// SIG // M2qHgCa7539nnvPSn+MnI48mnzSUlKf6mlwZW4zLvdLz
// SIG // bmybLXUsTrb8HMXnhz+mWmG05dnDpWuHKJIj1PgVIyGQ
// SIG // P7fyGX2KGszBpgbS1hSWXQvS2Flpiy7DSdlttapHkkqR
// SIG // AMOKZjCCBnEwggRZoAMCAQICCmEJgSoAAAAAAAIwDQYJ
// SIG // KoZIhvcNAQELBQAwgYgxCzAJBgNVBAYTAlVTMRMwEQYD
// SIG // VQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25k
// SIG // MR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24x
// SIG // MjAwBgNVBAMTKU1pY3Jvc29mdCBSb290IENlcnRpZmlj
// SIG // YXRlIEF1dGhvcml0eSAyMDEwMB4XDTEwMDcwMTIxMzY1
// SIG // NVoXDTI1MDcwMTIxNDY1NVowfDELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgUENBIDIwMTAwggEiMA0GCSqGSIb3DQEBAQUAA4IB
// SIG // DwAwggEKAoIBAQCpHQ28dxGKOiDs/BOX9fp/aZRrdFQQ
// SIG // 1aUKAIKF++18aEssX8XD5WHCdrc+Zitb8BVTJwQxH0Eb
// SIG // GpUdzgkTjnxhMFmxMEQP8WCIhFRDDNdNuDgIs0Ldk6zW
// SIG // czBXJoKjRQ3Q6vVHgc2/JGAyWGBG8lhHhjKEHnRhZ5Ff
// SIG // gVSxz5NMksHEpl3RYRNuKMYa+YaAu99h/EbBJx0kZxJy
// SIG // GiGKr0tkiVBisV39dx898Fd1rL2KQk1AUdEPnAY+Z3/1
// SIG // ZsADlkR+79BL/W7lmsqxqPJ6Kgox8NpOBpG2iAg16Hgc
// SIG // sOmZzTznL0S6p/TcZL2kAcEgCZN4zfy8wMlEXV4WnAEF
// SIG // TyJNAgMBAAGjggHmMIIB4jAQBgkrBgEEAYI3FQEEAwIB
// SIG // ADAdBgNVHQ4EFgQU1WM6XIoxkPNDe3xGG8UzaFqFbVUw
// SIG // GQYJKwYBBAGCNxQCBAweCgBTAHUAYgBDAEEwCwYDVR0P
// SIG // BAQDAgGGMA8GA1UdEwEB/wQFMAMBAf8wHwYDVR0jBBgw
// SIG // FoAU1fZWy4/oolxiaNE9lJBb186aGMQwVgYDVR0fBE8w
// SIG // TTBLoEmgR4ZFaHR0cDovL2NybC5taWNyb3NvZnQuY29t
// SIG // L3BraS9jcmwvcHJvZHVjdHMvTWljUm9vQ2VyQXV0XzIw
// SIG // MTAtMDYtMjMuY3JsMFoGCCsGAQUFBwEBBE4wTDBKBggr
// SIG // BgEFBQcwAoY+aHR0cDovL3d3dy5taWNyb3NvZnQuY29t
// SIG // L3BraS9jZXJ0cy9NaWNSb29DZXJBdXRfMjAxMC0wNi0y
// SIG // My5jcnQwgaAGA1UdIAEB/wSBlTCBkjCBjwYJKwYBBAGC
// SIG // Ny4DMIGBMD0GCCsGAQUFBwIBFjFodHRwOi8vd3d3Lm1p
// SIG // Y3Jvc29mdC5jb20vUEtJL2RvY3MvQ1BTL2RlZmF1bHQu
// SIG // aHRtMEAGCCsGAQUFBwICMDQeMiAdAEwAZQBnAGEAbABf
// SIG // AFAAbwBsAGkAYwB5AF8AUwB0AGEAdABlAG0AZQBuAHQA
// SIG // LiAdMA0GCSqGSIb3DQEBCwUAA4ICAQAH5ohRDeLG4Jg/
// SIG // gXEDPZ2joSFvs+umzPUxvs8F4qn++ldtGTCzwsVmyWrf
// SIG // 9efweL3HqJ4l4/m87WtUVwgrUYJEEvu5U4zM9GASinbM
// SIG // QEBBm9xcF/9c+V4XNZgkVkt070IQyK+/f8Z/8jd9Wj8c
// SIG // 8pl5SpFSAK84Dxf1L3mBZdmptWvkx872ynoAb0swRCQi
// SIG // PM/tA6WWj1kpvLb9BOFwnzJKJ/1Vry/+tuWOM7tiX5rb
// SIG // V0Dp8c6ZZpCM/2pif93FSguRJuI57BlKcWOdeyFtw5yj
// SIG // ojz6f32WapB4pm3S4Zz5Hfw42JT0xqUKloakvZ4argRC
// SIG // g7i1gJsiOCC1JeVk7Pf0v35jWSUPei45V3aicaoGig+J
// SIG // FrphpxHLmtgOR5qAxdDNp9DvfYPw4TtxCd9ddJgiCGHa
// SIG // sFAeb73x4QDf5zEHpJM692VHeOj4qEir995yfmFrb3ep
// SIG // gcunCaw5u+zGy9iCtHLNHfS4hQEegPsbiSpUObJb2sgN
// SIG // VZl6h3M7COaYLeqN4DMuEin1wC9UJyH3yKxO2ii4sanb
// SIG // lrKnQqLJzxlBTeCG+SqaoxFmMNO7dDJL32N79ZmKLxvH
// SIG // Ia9Zta7cRDyXUHHXodLFVeNp3lfB0d4wwP3M5k37Db9d
// SIG // T+mdHhk4L7zPWAUu7w2gUDXa7wknHNWzfjUeCLraNtvT
// SIG // X4/edIhJEqGCAtIwggI7AgEBMIH8oYHUpIHRMIHOMQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMSkwJwYDVQQLEyBNaWNyb3Nv
// SIG // ZnQgT3BlcmF0aW9ucyBQdWVydG8gUmljbzEmMCQGA1UE
// SIG // CxMdVGhhbGVzIFRTUyBFU046Rjc3Ri1FMzU2LTVCQUUx
// SIG // JTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNl
// SIG // cnZpY2WiIwoBATAHBgUrDgMCGgMVAFZJj1f/IWVUvRc2
// SIG // 7aF9sd2dsWMqoIGDMIGApH4wfDELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgUENBIDIwMTAwDQYJKoZIhvcNAQEFBQACBQDlr9lv
// SIG // MCIYDzIwMjIwMjEwMjIzNTI3WhgPMjAyMjAyMTEyMjM1
// SIG // MjdaMHcwPQYKKwYBBAGEWQoEATEvMC0wCgIFAOWv2W8C
// SIG // AQAwCgIBAAICJIsCAf8wBwIBAAICEU8wCgIFAOWxKu8C
// SIG // AQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYKKwYBBAGEWQoD
// SIG // AqAKMAgCAQACAwehIKEKMAgCAQACAwGGoDANBgkqhkiG
// SIG // 9w0BAQUFAAOBgQAaSfW6O5k5z6sznlTwYrdiZPx6nIds
// SIG // m4PY4ZvWSuHVYrdQvhUroOoTdjZjK9LBHVUbqPPcUwTO
// SIG // RQqFPdGf6Ada/s6ybBxaK4w5Njh8d89in8QWYm54rK4e
// SIG // yvazAWTV05TXMUVbMhxExhmgzRwSC8kF5eMijDWwScOX
// SIG // lfcGeIyQ9jGCAw0wggMJAgEBMIGTMHwxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFBDQSAyMDEwAhMzAAABXp0px1+HBaHqAAAA
// SIG // AAFeMA0GCWCGSAFlAwQCAQUAoIIBSjAaBgkqhkiG9w0B
// SIG // CQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZIhvcNAQkEMSIE
// SIG // IEs6iVySBbcRX1YXIFLkexIwx4gH0Xzwy2hDZX6EaI5O
// SIG // MIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB5DCBvQQgfuWE
// SIG // 7JTUl47gfuZkA0ykZDO6a5HsIV53r16S7/ES0+IwgZgw
// SIG // gYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQD
// SIG // Ex1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAIT
// SIG // MwAAAV6dKcdfhwWh6gAAAAABXjAiBCAOp4yfhMk9dbj5
// SIG // teJ3pu0eDkcFUphd9elevrstNyyhDjANBgkqhkiG9w0B
// SIG // AQsFAASCAQAEWMujCXyMsDKqCZoQstrwWfegs4VXjZXG
// SIG // fu9nzrJdAmvFHGLISiWcibmOD1/1IXt+g+ovc0OEyYBO
// SIG // mI48dM+5yMApidsLE84aCKCS5r1GPIm4T606fZUV3IXO
// SIG // eCUbNniy0QZSt2TMW+tWXxAaH0hwV3JWtsGNlzklMZUd
// SIG // nhZ7lDhKRtMdmq1yY/kG3YlRcWvV+lHmHLmdBoiczZI1
// SIG // 0BvDZio/sX5fdEUcXIqVOI2AaeYsE05Kcpu/bRZN1MVN
// SIG // K9aD+/+F930GqLWbEoOq6RfWUw4bRTybMQ/Jj50L9xic
// SIG // CbEsVS1/EtHKk2yjyhG2TdsF9V4dgcOJTEHgQ828tKZT
// SIG // End signature block
