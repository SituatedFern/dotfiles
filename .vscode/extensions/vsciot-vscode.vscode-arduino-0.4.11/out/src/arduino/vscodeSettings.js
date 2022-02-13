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
exports.VscodeSettings = void 0;
const vscode = require("vscode");
const util_1 = require("../common/util");
const configKeys = {
    ARDUINO_PATH: "arduino.path",
    ARDUINO_COMMAND_PATH: "arduino.commandPath",
    ADDITIONAL_URLS: "arduino.additionalUrls",
    LOG_LEVEL: "arduino.logLevel",
    CLEAR_OUTPUT_ON_START: "arduino.clearOutputOnBuild",
    AUTO_UPDATE_INDEX_FILES: "arduino.autoUpdateIndexFiles",
    ALLOW_PDE_FILETYPE: "arduino.allowPDEFiletype",
    ENABLE_USB_DETECTION: "arduino.enableUSBDetection",
    DISABLE_TESTING_OPEN: "arduino.disableTestingOpen",
    IGNORE_BOARDS: "arduino.ignoreBoards",
    SKIP_HEADER_PROVIDER: "arduino.skipHeaderProvider",
    DEFAULT_BAUD_RATE: "arduino.defaultBaudRate",
    USE_ARDUINO_CLI: "arduino.useArduinoCli",
    DISABLE_INTELLISENSE_AUTO_GEN: "arduino.disableIntelliSenseAutoGen",
    DEFAULT_TIMESTAMP_FORMAT: "arduino.defaultTimestampFormat",
};
class VscodeSettings {
    constructor() {
    }
    static getInstance() {
        if (!VscodeSettings._instance) {
            VscodeSettings._instance = new VscodeSettings();
        }
        return VscodeSettings._instance;
    }
    get arduinoPath() {
        return this.getConfigValue(configKeys.ARDUINO_PATH);
    }
    get commandPath() {
        return this.getConfigValue(configKeys.ARDUINO_COMMAND_PATH);
    }
    get additionalUrls() {
        const value = this.getConfigValue(configKeys.ADDITIONAL_URLS);
        // Even though the schema says value must be a string array, version
        // 0.4.9 and earlier also allowed a single comma delimeted string. We
        // continue to unofficially support that format to avoid breaking
        // existing settings, but we immediately write back the correctly
        // formatted version.
        const split = util_1.toStringArray(value);
        if (typeof value === "string") {
            this.updateAdditionalUrls(split);
        }
        return split;
    }
    get logLevel() {
        return this.getConfigValue(configKeys.LOG_LEVEL) || "info";
    }
    get clearOutputOnBuild() {
        return this.getConfigValue(configKeys.CLEAR_OUTPUT_ON_START);
    }
    get allowPDEFiletype() {
        return this.getConfigValue(configKeys.ALLOW_PDE_FILETYPE);
    }
    get enableUSBDetection() {
        return this.getConfigValue(configKeys.ENABLE_USB_DETECTION);
    }
    get disableTestingOpen() {
        return this.getConfigValue(configKeys.DISABLE_TESTING_OPEN);
    }
    get ignoreBoards() {
        return this.getConfigValue(configKeys.IGNORE_BOARDS);
    }
    set ignoreBoards(value) {
        this.setConfigValue(configKeys.IGNORE_BOARDS, value, true);
    }
    get defaultBaudRate() {
        return this.getConfigValue(configKeys.DEFAULT_BAUD_RATE);
    }
    get useArduinoCli() {
        return this.getConfigValue(configKeys.USE_ARDUINO_CLI);
    }
    get skipHeaderProvider() {
        return this.getConfigValue(configKeys.SKIP_HEADER_PROVIDER);
    }
    get disableIntelliSenseAutoGen() {
        return this.getConfigValue(configKeys.DISABLE_INTELLISENSE_AUTO_GEN);
    }
    get defaultTimestampFormat() {
        return this.getConfigValue(configKeys.DEFAULT_TIMESTAMP_FORMAT);
    }
    updateAdditionalUrls(value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setConfigValue(configKeys.ADDITIONAL_URLS, value, true);
        });
    }
    getConfigValue(key) {
        const workspaceConfig = vscode.workspace.getConfiguration();
        return workspaceConfig.get(key);
    }
    setConfigValue(key, value, global = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const workspaceConfig = vscode.workspace.getConfiguration();
            yield workspaceConfig.update(key, value, global);
        });
    }
}
exports.VscodeSettings = VscodeSettings;

//# sourceMappingURL=vscodeSettings.js.map

// SIG // Begin signature block
// SIG // MIIjkAYJKoZIhvcNAQcCoIIjgTCCI30CAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 22Hghp1suaalASrb0S7mMba8mD9VUuNB898HW5OIzMSg
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIIhONy7M/7UEXLsNvN5k
// SIG // EASSwSaiudwNSLemWp0r9KfOMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAA0xPfkvce5K7uALz5qFnE7ISaKXS5t1cOvHU
// SIG // vj1LdiaB/9cUMJZNZNws45n86YiobBENWsPcSbfM9b6s
// SIG // mseq4N5WAUqyr8V2ioKjpDdji8PaFQPB2KGbPVjnr1Vg
// SIG // 0EHWfeZUNNvtWyqHpWRfcnASIDiyIK8VVM1bPh7d3c/f
// SIG // cJ0zMbaqbW8UCaf8jK3PPfrUvkpzPgTM8/xmSDfo5ToZ
// SIG // 4R/BDgwNYOrQdyRpg/Hqx6Ld4ZopFaogTZuq8si7DBl6
// SIG // raBBT16ehrtKMrrkYO+1D/LLiiGcjA4EOBfCg6gJO6w5
// SIG // 5jeVbSZPzGgSSfz/W3NOqQW9EeFHDrNY31aDbRMiqqGC
// SIG // EvEwghLtBgorBgEEAYI3AwMBMYIS3TCCEtkGCSqGSIb3
// SIG // DQEHAqCCEsowghLGAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFVBgsqhkiG9w0BCRABBKCCAUQEggFAMIIBPAIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCC8q8gG
// SIG // zwZjgJYBl3gBxxxpJZGvGraqItBc4zxodzuV6QIGYfw8
// SIG // OurBGBMyMDIyMDIxMTAxNTc0NS41NjVaMASAAgH0oIHU
// SIG // pIHRMIHOMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSkwJwYDVQQL
// SIG // EyBNaWNyb3NvZnQgT3BlcmF0aW9ucyBQdWVydG8gUmlj
// SIG // bzEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046Nzg4MC1F
// SIG // MzkwLTgwMTQxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2Wggg5EMIIE9TCCA92gAwIBAgIT
// SIG // MwAAAVyG0uPsOfaLOAAAAAABXDANBgkqhkiG9w0BAQsF
// SIG // ADB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDAeFw0y
// SIG // MTAxMTQxOTAyMTdaFw0yMjA0MTExOTAyMTdaMIHOMQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMSkwJwYDVQQLEyBNaWNyb3Nv
// SIG // ZnQgT3BlcmF0aW9ucyBQdWVydG8gUmljbzEmMCQGA1UE
// SIG // CxMdVGhhbGVzIFRTUyBFU046Nzg4MC1FMzkwLTgwMTQx
// SIG // JTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNl
// SIG // cnZpY2UwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEK
// SIG // AoIBAQDQKis+ryofYkCyaBLyXAlMHeX52rcEF5iGTJSf
// SIG // OL+J7DLn53yWxutt3/1PDgbtbMjlzme1cxzngv/qyGa8
// SIG // 3CUGkPK+ZQkI5/X4ht45Pqaj0hUZd8PWBhY6Lsvxcbkg
// SIG // OrPzL+29BktG2h05SRYEbgygYAbE2oBkeEkZh5xXa0oU
// SIG // 97ZNU91gEi0xiEnhhseItA8g7s/M0FZqaS/PgVMoj4q9
// SIG // Fv12TrLgOhRMY94E78ky34g1YZjXMMz7+S0JayFYq9Jt
// SIG // vu1A02PIp8x5f9gpR+DeNrqm1pPR9iOK6QgnFFkgcNZv
// SIG // A3uIU7ExkBE+6okfhXyOz0JSUPvXn+wDQH5T0jYbAgMB
// SIG // AAGjggEbMIIBFzAdBgNVHQ4EFgQUX/MUrDkocoCQBX+4
// SIG // mnstYxjBuj4wHwYDVR0jBBgwFoAU1WM6XIoxkPNDe3xG
// SIG // G8UzaFqFbVUwVgYDVR0fBE8wTTBLoEmgR4ZFaHR0cDov
// SIG // L2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVj
// SIG // dHMvTWljVGltU3RhUENBXzIwMTAtMDctMDEuY3JsMFoG
// SIG // CCsGAQUFBwEBBE4wTDBKBggrBgEFBQcwAoY+aHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNU
// SIG // aW1TdGFQQ0FfMjAxMC0wNy0wMS5jcnQwDAYDVR0TAQH/
// SIG // BAIwADATBgNVHSUEDDAKBggrBgEFBQcDCDANBgkqhkiG
// SIG // 9w0BAQsFAAOCAQEAeHlM9td+IHMOHCP1Mtnto5Du7XqS
// SIG // u0+Vl7e+mvwM/6XTQjegdQ+kGEURy/dCZhpWTHVLcBvw
// SIG // OhPUajag7/Wh0PP9hSxXK6zTk4A0NHI2f/TMfLLaNe5O
// SIG // K1ttkL02DkAQdeKLjQLA5aGfWqnP0LZovCRR3ejHO7xO
// SIG // aA4HlRpt8vHq+1IC5+IJEyGJ/JXkz2PR9srqC3120PF6
// SIG // 5dFlhQW5mZurdwxBvq+q2iJjSez6wUB56XV8Qo4xeVjT
// SIG // zGDXihFgPkZMgORQ+WANLil7ZTXeR4L8HFqPwAhsrj5b
// SIG // scGAXAwmUBRWraL9LjYzrEMRDEYAM6QOb6hDjsf01BGB
// SIG // ZHEQSTCCBnEwggRZoAMCAQICCmEJgSoAAAAAAAIwDQYJ
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
// SIG // CxMdVGhhbGVzIFRTUyBFU046Nzg4MC1FMzkwLTgwMTQx
// SIG // JTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNl
// SIG // cnZpY2WiIwoBATAHBgUrDgMCGgMVAJ7ipaPGnyhHlZx+
// SIG // Xesj+J5OafBMoIGDMIGApH4wfDELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgUENBIDIwMTAwDQYJKoZIhvcNAQEFBQACBQDlr/UA
// SIG // MCIYDzIwMjIwMjExMDAzMzA0WhgPMjAyMjAyMTIwMDMz
// SIG // MDRaMHcwPQYKKwYBBAGEWQoEATEvMC0wCgIFAOWv9QAC
// SIG // AQAwCgIBAAICGjUCAf8wBwIBAAICEkAwCgIFAOWxRoAC
// SIG // AQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYKKwYBBAGEWQoD
// SIG // AqAKMAgCAQACAwehIKEKMAgCAQACAwGGoDANBgkqhkiG
// SIG // 9w0BAQUFAAOBgQCvK99boT6bYrV5BILv5+bSwq/wJTrN
// SIG // D5kvEyMssbucncGZcMegIJRkBO54mU61mXsWiMAFdQ4k
// SIG // xs7C24DHueLKTfJujucHVKYIxmVHBWaO7RPdfNjq3iOk
// SIG // 6yIx9vMGYLbszg8spMc5Kj9IRnpx8TrwkEErP1JdrXmv
// SIG // yuaesN5z/DGCAw0wggMJAgEBMIGTMHwxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFBDQSAyMDEwAhMzAAABXIbS4+w59os4AAAA
// SIG // AAFcMA0GCWCGSAFlAwQCAQUAoIIBSjAaBgkqhkiG9w0B
// SIG // CQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZIhvcNAQkEMSIE
// SIG // IAH6GexkB/cPBESzSeu1DbzGG1WN9mKGv7qVfEtJdSbD
// SIG // MIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB5DCBvQQgTy1k
// SIG // V8IgT2wAMEnMpCArUD30LiCIRm8V77RcjwwZ5rUwgZgw
// SIG // gYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQD
// SIG // Ex1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAIT
// SIG // MwAAAVyG0uPsOfaLOAAAAAABXDAiBCDbRDd6H+YFTx7o
// SIG // z3Pw8YEPbwdaMjmVIUqFNmKX0DojgTANBgkqhkiG9w0B
// SIG // AQsFAASCAQB0B8WU5m2ciAMBJaEPaKRC6VjRwy8y1O6z
// SIG // 3FSac6QCYvqPEKBJDaBgN4qDUZ6XE0rg/zkVyGiW71MS
// SIG // psiUAfOW18P0Xk80jTn8oaGMeeprBn4YjqOkV3OBBH+L
// SIG // 9+wEifvrpihfC9/iKuYFisJzkK/hyOGdtoX2AqS+3B9N
// SIG // zOs3/rZHNAGuPIiGrMvzW+VEFY6r6XO7Ceu7oWFcnPNA
// SIG // xUuO4hfSvMjX0DwxNeYdsCqRvsWyt+asZ/F1s6/jAbjK
// SIG // nMsDyPJ9ot71VsGgQvXCDvnaDTHlbvTABnez6j+dDgQ9
// SIG // zLV/PLBMAwmzTMkAkMvibvhu2TWfIJVB8p8Lbm7BVi6f
// SIG // End signature block
