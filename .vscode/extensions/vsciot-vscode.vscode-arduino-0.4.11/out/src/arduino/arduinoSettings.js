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
exports.ArduinoSettings = void 0;
const os = require("os");
const path = require("path");
const WinReg = require("winreg");
const util = require("../common/util");
const platform_1 = require("../common/platform");
const vscodeSettings_1 = require("./vscodeSettings");
class ArduinoSettings {
    constructor() {
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const platform = os.platform();
            this._commandPath = vscodeSettings_1.VscodeSettings.getInstance().commandPath;
            this._useArduinoCli = vscodeSettings_1.VscodeSettings.getInstance().useArduinoCli;
            yield this.tryResolveArduinoPath();
            yield this.tryGetDefaultBaudRate();
            yield this.tryGetDefaultTimestampFormat();
            if (platform === "win32") {
                yield this.updateWindowsPath();
                if (this._commandPath === "") {
                    this._useArduinoCli ? this._commandPath = "arduino-cli.exe" : this._commandPath = "arduino_debug.exe";
                }
            }
            else if (platform === "linux") {
                if (util.directoryExistsSync(path.join(this._arduinoPath, "portable"))) {
                    this._packagePath = path.join(this._arduinoPath, "portable");
                }
                else {
                    this._packagePath = path.join(process.env.HOME, ".arduino15");
                }
                if (this.preferences.get("sketchbook.path")) {
                    if (util.directoryExistsSync(path.join(this._arduinoPath, "portable"))) {
                        this._sketchbookPath = path.join(this._arduinoPath, "portable", this.preferences.get("sketchbook.path"));
                    }
                    else {
                        this._sketchbookPath = this.preferences.get("sketchbook.path");
                    }
                }
                else {
                    this._sketchbookPath = path.join(process.env.HOME, "Arduino");
                }
                if (this._commandPath === "" && !this._useArduinoCli) {
                    this._commandPath = "arduino";
                }
            }
            else if (platform === "darwin") {
                if (util.directoryExistsSync(path.join(this._arduinoPath, "portable"))) {
                    this._packagePath = path.join(this._arduinoPath, "portable");
                }
                else {
                    this._packagePath = path.join(process.env.HOME, "Library/Arduino15");
                }
                if (this.preferences.get("sketchbook.path")) {
                    if (util.directoryExistsSync(path.join(this._arduinoPath, "portable"))) {
                        this._sketchbookPath = path.join(this._arduinoPath, "portable", this.preferences.get("sketchbook.path"));
                    }
                    else {
                        this._sketchbookPath = this.preferences.get("sketchbook.path");
                    }
                }
                else {
                    this._sketchbookPath = path.join(process.env.HOME, "Documents/Arduino");
                }
                if (this._commandPath === "" && !this._useArduinoCli) {
                    this._commandPath = "/Contents/MacOS/Arduino";
                }
            }
        });
    }
    get arduinoPath() {
        return this._arduinoPath;
    }
    get defaultExamplePath() {
        if (os.platform() === "darwin") {
            return path.join(util.resolveMacArduinoAppPath(this._arduinoPath, this._useArduinoCli), "/Contents/Java/examples");
        }
        else {
            return path.join(this._arduinoPath, "examples");
        }
    }
    get packagePath() {
        return this._packagePath;
    }
    get defaultPackagePath() {
        if (os.platform() === "darwin") {
            return path.join(util.resolveMacArduinoAppPath(this._arduinoPath, this._useArduinoCli), "/Contents/Java/hardware");
        }
        else { // linux and win32.
            return path.join(this._arduinoPath, "hardware");
        }
    }
    get defaultLibPath() {
        if (os.platform() === "darwin") {
            return path.join(util.resolveMacArduinoAppPath(this._arduinoPath, this._useArduinoCli), "/Contents/Java/libraries");
        }
        else { // linux and win32
            return path.join(this._arduinoPath, "libraries");
        }
    }
    get commandPath() {
        const platform = os.platform();
        if (platform === "darwin") {
            return path.join(util.resolveMacArduinoAppPath(this._arduinoPath, this._useArduinoCli), path.normalize(this._commandPath));
        }
        else {
            return path.join(this._arduinoPath, path.normalize(this._commandPath));
        }
    }
    get sketchbookPath() {
        return this._sketchbookPath;
    }
    get preferencePath() {
        return path.join(this.packagePath, "preferences.txt");
    }
    get preferences() {
        if (!this._preferences) {
            this._preferences = util.parseConfigFile(this.preferencePath);
        }
        return this._preferences;
    }
    get useArduinoCli() {
        return this._useArduinoCli;
    }
    get defaultBaudRate() {
        return this._defaultBaudRate;
    }
    get defaultTimestampFormat() {
        return this._defaultTimestampFormat;
    }
    reloadPreferences() {
        this._preferences = util.parseConfigFile(this.preferencePath);
        if (this.preferences.get("sketchbook.path")) {
            if (util.directoryExistsSync(path.join(this._arduinoPath, "portable"))) {
                this._sketchbookPath = path.join(this._arduinoPath, "portable", this.preferences.get("sketchbook.path"));
            }
            else {
                this._sketchbookPath = this.preferences.get("sketchbook.path");
            }
        }
    }
    /**
     * For Windows platform, there are two situations here:
     *  - User change the location of the default *Documents* folder.
     *  - Use the windows store Arduino app.
     */
    updateWindowsPath() {
        return __awaiter(this, void 0, void 0, function* () {
            let folder;
            try {
                folder = yield util.getRegistryValues(WinReg.HKCU, "\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders", "Personal");
            }
            catch (ex) {
            }
            if (!folder) {
                folder = path.join(process.env.USERPROFILE, "Documents");
            }
            // For some case, docFolder parsed from win32 registry looks like "%USERPROFILE%\Documents,
            // Should replace the environment variables with actual value.
            folder = folder.replace(/%([^%]+)%/g, (match, p1) => {
                return process.env[p1];
            });
            if (util.directoryExistsSync(path.join(this._arduinoPath, "portable"))) {
                this._packagePath = path.join(this._arduinoPath, "portable");
            }
            else if (util.fileExistsSync(path.join(this._arduinoPath, "AppxManifest.xml"))) {
                this._packagePath = path.join(folder, "ArduinoData");
            }
            else {
                this._packagePath = path.join(process.env.LOCALAPPDATA, "Arduino15");
            }
            if (this.preferences.get("sketchbook.path")) {
                if (util.directoryExistsSync(path.join(this._arduinoPath, "portable"))) {
                    this._sketchbookPath = path.join(this._arduinoPath, "portable", this.preferences.get("sketchbook.path"));
                }
                else {
                    this._sketchbookPath = this.preferences.get("sketchbook.path");
                }
            }
            else {
                this._sketchbookPath = path.join(folder, "Arduino");
            }
        });
    }
    tryResolveArduinoPath() {
        return __awaiter(this, void 0, void 0, function* () {
            // Query arduino path sequentially from the following places such as "vscode user settings", "system environment variables",
            // "usual software installation directory for each os".
            // 1. Search vscode user settings first.
            const configValue = vscodeSettings_1.VscodeSettings.getInstance().arduinoPath;
            if (!configValue || !configValue.trim()) {
                // 2 & 3. Resolve arduino path from system environment variables and usual software installation directory.
                this._arduinoPath = yield Promise.resolve(platform_1.resolveArduinoPath());
            }
            else {
                this._arduinoPath = configValue;
            }
        });
    }
    tryGetDefaultBaudRate() {
        return __awaiter(this, void 0, void 0, function* () {
            const supportBaudRates = [300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 74880, 115200, 230400, 250000];
            const configValue = vscodeSettings_1.VscodeSettings.getInstance().defaultBaudRate;
            if (!configValue || supportBaudRates.indexOf(configValue) === -1) {
                this._defaultBaudRate = 0;
            }
            else {
                this._defaultBaudRate = configValue;
            }
        });
    }
    tryGetDefaultTimestampFormat() {
        return __awaiter(this, void 0, void 0, function* () {
            const configValue = vscodeSettings_1.VscodeSettings.getInstance().defaultTimestampFormat;
            if (!configValue) {
                this._defaultTimestampFormat = "";
            }
            else {
                this._defaultTimestampFormat = configValue;
            }
        });
    }
}
exports.ArduinoSettings = ArduinoSettings;

//# sourceMappingURL=arduinoSettings.js.map

// SIG // Begin signature block
// SIG // MIInuAYJKoZIhvcNAQcCoIInqTCCJ6UCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // Sfre8HqE6qbJCGSIZVzmPWQoE2X7vAoEK7ePu/Wvj9Gg
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIAqMtF6+nAnLP5ySoOf3
// SIG // ZyPnwEhnh8PM/1t1nuswc1g4MEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEACaFfzWwPotA+d+ASMz/xtJPUA4VYos91Vet1
// SIG // +6CCPr8D0lSkklo2eUI3vnNlH2ujLIv7D5k7vtR/wfXQ
// SIG // d9wG5JdaTbbznMMzh3D6/D/lUG+IbE6fme3vMEoLtcML
// SIG // LlmCc648Y59f9YiPC9XPBGVJ45Q+SNnKpXN0eO8d9yUb
// SIG // prnvrBiKUb3PgOw6XCkLzlH/F9jWZLJPT1fEGb+pJw73
// SIG // 6nk4x+Uzz6pViKsEtr3vBX33mfV98vkEV/y5LCaqtkbB
// SIG // PFgDRRhxcRJkDJCb1NQmBZx8OsgQ/eL9xhgofktLVZmL
// SIG // uhxaGhT82KrZuuOGj7NRzpCsxPKg/RQDl/G8XW6btKGC
// SIG // FxkwghcVBgorBgEEAYI3AwMBMYIXBTCCFwEGCSqGSIb3
// SIG // DQEHAqCCFvIwghbuAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFZBgsqhkiG9w0BCRABBKCCAUgEggFEMIIBQAIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCC4MjSh
// SIG // QgUOt/2k5w2gM7kl8fTwVbvTvvTzOF9WDJsTVQIGYf1i
// SIG // e9OsGBMyMDIyMDIxMTAxNTc0Ny42MzVaMASAAgH0oIHY
// SIG // pIHVMIHSMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYDVQQL
// SIG // EyRNaWNyb3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExp
// SIG // bWl0ZWQxJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNOOjNC
// SIG // RDQtNEI4MC02OUMzMSUwIwYDVQQDExxNaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBTZXJ2aWNloIIRaDCCBxQwggT8oAMC
// SIG // AQICEzMAAAGJtL+GMIQcS48AAQAAAYkwDQYJKoZIhvcN
// SIG // AQELBQAwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UE
// SIG // AxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAw
// SIG // HhcNMjExMDI4MTkyNzQxWhcNMjMwMTI2MTkyNzQxWjCB
// SIG // 0jELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWlj
// SIG // cm9zb2Z0IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVk
// SIG // MSYwJAYDVQQLEx1UaGFsZXMgVFNTIEVTTjozQkQ0LTRC
// SIG // ODAtNjlDMzElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgU2VydmljZTCCAiIwDQYJKoZIhvcNAQEBBQAD
// SIG // ggIPADCCAgoCggIBAL0GV8WRZmuqZZrjsrzaVfMTjTsH
// SIG // GKJWRvwY8mVhkpOSThmi8qyiHeVcVR1h5bJiROEr587H
// SIG // abCplcfKLTjb3iFBb0nHhGafFV5ruZtX7vC+3Pt5cF3I
// SIG // m43HKrRL7ULJaJEFcdK/i+eGm6zQ2q8BRu9yGkYnSEtY
// SIG // vXPrpyfKGMoQ0S6wsrBQFcckITzWZFiu2fP1RrpGiiwF
// SIG // h1wof/ked4eNoBS/vf5gAC8cwl17qH4vH/1ygpu8TcFX
// SIG // NYTjQgs+qKveALn81TZJCFuG61EIGKQnCZvVNFzZkL7a
// SIG // 6KWA5/VLWPGENDSnp1z7XYCx3UPDZ794oBKyi61iNGuZ
// SIG // +Y43Sn8JPvJr2pKnWZpTrHnjktV7KUDSQCtbmZZQCE3J
// SIG // 0GTnDuaH4zkN97o1nJAF3c/v8d6O5eAFP00jjMxmTMIV
// SIG // HbVcAt3UmyLaUlRYJ4zNgjhCfc4AmnbzoqxgyzeO9Y2S
// SIG // NowpZI7CU3YD5N+N00AOCRb3bP7p2atLi6/p4md1+ODg
// SIG // cdsfoFZZZ9nOFG2VzbngOMktUyRm2yRSCCwJk1APQLo+
// SIG // XiEhk2zYslse/R5wjk2q9/UBCqM5uC505g18tPyiPx/5
// SIG // 2GRirkx33JD9vMEEtOqw/nw0ucS8HETAlvdg5B15rW4R
// SIG // skYpQTi+S8WXpUH8beeMJeFlAtAHQBKJT3pDg8DvAgMB
// SIG // AAGjggE2MIIBMjAdBgNVHQ4EFgQUl28fs0daeCCAHoLg
// SIG // OqxypK35e1AwHwYDVR0jBBgwFoAUn6cVXQBeYl2D9OXS
// SIG // ZacbUzUZ6XIwXwYDVR0fBFgwVjBUoFKgUIZOaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jcmwvTWlj
// SIG // cm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUyMDIwMTAo
// SIG // MSkuY3JsMGwGCCsGAQUFBwEBBGAwXjBcBggrBgEFBQcw
// SIG // AoZQaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9w
// SIG // cy9jZXJ0cy9NaWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIw
// SIG // UENBJTIwMjAxMCgxKS5jcnQwDAYDVR0TAQH/BAIwADAT
// SIG // BgNVHSUEDDAKBggrBgEFBQcDCDANBgkqhkiG9w0BAQsF
// SIG // AAOCAgEAjrS3aVlCOCsHyy632iqywfdg6mwLKRljONU2
// SIG // juCZfrB8T6OdtrrtxikAo5pEVq3h7ZX8svZDpOy1msd5
// SIG // N5HvBrX3rX24e6h9C3ldlzloN/QTpx3+pk3GauxWEmWX
// SIG // IdSQ0I3PfPjnZaMPqFoodA27eAlf3tfWXBPtZ9c81pLJ
// SIG // FBHdH+YzyFIrN96fr5GPLM3bgLQnCHDxVISPB2+WpT1A
// SIG // DzIxs8Cm+zSCm53/I/HD9fALOSL3nJBdKIdXMOt0WP7z
// SIG // yutiw2HaYu1pxtjm754H1lSrcIsEyOIx49nDvat+xw3v
// SIG // zz5dteoEqVGYdGqduJipjA33CqdTeJhHbMc+KLHjqz2H
// SIG // hbBx1iRSegIr76p+9Ck3iaaea/g8Uqm3kstJsSFDqv5Q
// SIG // GlMYDUkFVF9urfK/n3IpKHyr9t1h67UVd7e61U7AfWM6
// SIG // 0WoopJs+vCuR1nbfTKlC8T0D6PqaWdC0apDmnuOuvlCk
// SIG // WNCcVrXazHObx5R2X56o2sI/0bDNkukOn2vU/Qp2NTc+
// SIG // w2ARt8mScgjxbK4FNObPZY6n7EqbaRXVIfUeHHvi+9Ul
// SIG // gyzNsf9TBSyxwDG17BKfCpaBBrWg1C58bX0trWIX7ihq
// SIG // kV6BHwzwDJyHU70D4dxh0OEo5JAQERy9DGO+WpYRkyh1
// SIG // owtmi1TqPKGyiAZPIX5xQ1H/xMlcOLkwggdxMIIFWaAD
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
// SIG // OjNCRDQtNEI4MC02OUMzMSUwIwYDVQQDExxNaWNyb3Nv
// SIG // ZnQgVGltZS1TdGFtcCBTZXJ2aWNloiMKAQEwBwYFKw4D
// SIG // AhoDFQAhpQmt5Hrcnrnsu2yTaVpDLognEKCBgzCBgKR+
// SIG // MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMA0GCSqG
// SIG // SIb3DQEBBQUAAgUA5a/JwjAiGA8yMDIyMDIxMTAxMjgz
// SIG // NFoYDzIwMjIwMjEyMDEyODM0WjB3MD0GCisGAQQBhFkK
// SIG // BAExLzAtMAoCBQDlr8nCAgEAMAoCAQACAhRuAgH/MAcC
// SIG // AQACAhKTMAoCBQDlsRtCAgEAMDYGCisGAQQBhFkKBAIx
// SIG // KDAmMAwGCisGAQQBhFkKAwKgCjAIAgEAAgMHoSChCjAI
// SIG // AgEAAgMBhqAwDQYJKoZIhvcNAQEFBQADgYEAGdIAt0W3
// SIG // wjgI4t2oigK6A8f/tA4dnO7HcgDti0FuuEiMtxiiUgaP
// SIG // kSWJmTrImFdzDOQ1x93hKMBN/Vou8HLhPqNR/hXQwYRY
// SIG // 1gcXx3iUuJ6PTEU4+3OVp1zVZ7xSeFgX9ilVNOVL40AN
// SIG // 96Aodb2o/rodQrO/Otfwfh/Kv517qpExggQNMIIECQIB
// SIG // ATCBkzB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQD
// SIG // Ex1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAIT
// SIG // MwAAAYm0v4YwhBxLjwABAAABiTANBglghkgBZQMEAgEF
// SIG // AKCCAUowGgYJKoZIhvcNAQkDMQ0GCyqGSIb3DQEJEAEE
// SIG // MC8GCSqGSIb3DQEJBDEiBCCxJ91eQcdRKTsc8t/vTsXW
// SIG // S7Vqizkl1McRcNyXyNuE6jCB+gYLKoZIhvcNAQkQAi8x
// SIG // geowgecwgeQwgb0EIGZ3RzHcUFdVbG6Vhzkx6lhMnL3E
// SIG // SZu3GOvZf1Jk/I9FMIGYMIGApH4wfDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgUENBIDIwMTACEzMAAAGJtL+GMIQcS48AAQAA
// SIG // AYkwIgQgEJCj2+yKHe5vNBLOhtz4t5I4ZA7qJX6B3kmA
// SIG // yASgoQ4wDQYJKoZIhvcNAQELBQAEggIAqBIYSpN0lGv7
// SIG // an8iHy+pffCsAURCAX3qCoqUH0LrWscZjNuZGoWljwBy
// SIG // yO7HRe6gEosxewdAYHzwyOc1nrqeryGeS6b0uWmfqv8d
// SIG // in/CvT9+I5EKINFKjlUsQ0/gL/qdGN54zqcppRphGfAB
// SIG // AmqkhSb7Bi2P9blACjUcrhMWBm1lepnyZylXjJuLYUNZ
// SIG // 8fnXzOQD53c2TlS6kuYektxc5SOwAF62u0vrBQTTdgnM
// SIG // Y82/EMqKZLhdstoho6QIdyig61ld1YcQW6V2+8RGZW4Z
// SIG // woTTypA2j7xl4NJv1hUgC3QKexq2LG5ahb2qn0sIe7u3
// SIG // cnbvfFf5rqCaY5A8qnve7cXbx7JJ9TpnVv+jk2RNScY1
// SIG // i3RB9rWU98QRAAUd2n0s1ba+2muvEk8fFR1mJjZeEyl+
// SIG // 4t1k1g1tktum2BzjDzdweejuh31mwGtT+zVx93D/nvTY
// SIG // mPCe1xT45ZxaV/WuHHbmhz6aaCZxIYFb654tKjsnr/Tq
// SIG // mGH6IICO4meSqeLyk8JnoXFqggUwA4FNMD50XxJzIDT4
// SIG // r4VjSOsGRV5bK82u62RRZGqxDT859j6VKEnEEP/Q89rc
// SIG // bASmFW7kjtAOU7Ei7Mb4ZOCMS2XBx4IFl1bV1tVOU4DJ
// SIG // a15P/8buoOTDFpO2Bk5Vs8HO68Lg2SP9YHqIKigKs1Ys
// SIG // uEP3l6UobkM=
// SIG // End signature block
