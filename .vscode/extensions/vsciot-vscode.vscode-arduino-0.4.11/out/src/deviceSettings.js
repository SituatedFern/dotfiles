"use strict";
// Copyright (c) Elektronik Workshop. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceSettings = void 0;
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const constants = require("./common/constants");
const util = require("./common/util");
const logger = require("./logger/logger");
/**
 * Generic class which provides monitoring of a specific settings value.
 * If the value is modified a flag is set and an event is emitted.
 *
 * Usually you want to specialize the setter for any given value type
 * to prevent invalid or badly formatted values to enter your settings.
 */
class Setting {
    constructor(defaultValue) {
        /** Event emitter which fires when the value is changed. */
        this._emitter = new vscode.EventEmitter();
        this.default = defaultValue;
        this._value = this.default;
    }
    /**
     * Value-setter - sets the value.
     * If modified, the modified flag is set and the modified event is
     * fired.
     */
    set value(value) {
        if (value !== this._value) {
            this._value = value;
            this._modified = true;
            this._emitter.fire(this._value);
        }
    }
    /** Value-getter - returns the internal value. */
    get value() {
        return this._value;
    }
    /**
     * Returns true, if the internal value has been modified.
     * To clear the modified flag call commit().
     */
    get modified() {
        return this._modified;
    }
    /** Returns the modified-event emitter. */
    get emitter() {
        return this._emitter;
    }
    /**
     * Returns the internal value to its default value.
     * If the default value is different from the previous value,
     * it triggers the modified event and the modified flag is set.
     */
    reset() {
        this.value = this.default;
    }
    /** Reset the modified flag (if you know what you're doing) */
    commit() {
        this._modified = false;
    }
}
/**
 * String specialization of the Setting class.
 */
class StrSetting extends Setting {
    /**
     * When we override setter (below) we have to override getter as well
     * (see JS language specs).
     */
    get value() {
        return super.value;
    }
    /**
     * Set string value. Anything else than a string will set the value to
     * its default value (undefined). White spaces at the front and back are
     * trimmed before setting the value.
     * If the setting's value is changed during this operation, the base
     * class' event emitter will fire and the modified flag will be set.
     */
    set value(value) {
        if (typeof value !== "string") {
            value = this.default;
        }
        else {
            value = value.trim();
        }
        super.value = value;
    }
}
class BuildPrefSetting extends Setting {
    get value() {
        return super.value;
    }
    set value(value) {
        if (!Array.isArray(value)) {
            super.value = super.default;
            return;
        }
        if (value.length <= 0) {
            super.value = super.default;
            return;
        }
        for (const pref of value) {
            if (!Array.isArray(pref) || pref.length !== 2) {
                super.value = super.default;
                return;
            }
            for (const i of pref) {
                if (typeof i !== "string") {
                    super.value = super.default;
                    return;
                }
            }
        }
        super.value = value;
    }
}
/**
 * This class encapsulates all device/project specific settings and
 * provides common operations on them.
 */
class DeviceSettings {
    constructor() {
        this.port = new StrSetting();
        this.board = new StrSetting();
        this.sketch = new StrSetting();
        this.output = new StrSetting();
        this.debugger = new StrSetting();
        this.intelliSenseGen = new StrSetting();
        this.configuration = new StrSetting();
        this.prebuild = new StrSetting();
        this.postbuild = new StrSetting();
        this.programmer = new StrSetting();
        this.buildPreferences = new BuildPrefSetting();
    }
    /**
     * @returns true if any of the settings values has its modified flag
     * set.
     */
    get modified() {
        return this.port.modified ||
            this.board.modified ||
            this.sketch.modified ||
            this.output.modified ||
            this.debugger.modified ||
            this.intelliSenseGen.modified ||
            this.configuration.modified ||
            this.prebuild.modified ||
            this.postbuild.modified ||
            this.programmer.modified ||
            this.buildPreferences.modified;
    }
    /**
     * Clear modified flags of all settings values.
     */
    commit() {
        this.port.commit();
        this.board.commit();
        this.sketch.commit();
        this.output.commit();
        this.debugger.commit();
        this.intelliSenseGen.commit();
        this.configuration.commit();
        this.prebuild.commit();
        this.postbuild.commit();
        this.programmer.commit();
        this.buildPreferences.commit();
    }
    /**
     * Resets all settings values to their default values.
     * @param commit If true clear the modified flags after all values are
     * reset.
     */
    reset(commit = true) {
        this.port.reset();
        this.board.reset();
        this.sketch.reset();
        this.output.reset();
        this.debugger.reset();
        this.intelliSenseGen.reset();
        this.configuration.reset();
        this.prebuild.reset();
        this.postbuild.reset();
        this.programmer.reset();
        this.buildPreferences.reset();
        if (commit) {
            this.commit();
        }
    }
    /**
     * Load settings values from the given file.
     * If a value is changed through this operation, its event emitter will
     * fire.
     * @param file Path to the file the settings should be loaded from.
     * @param commit If true reset the modified flags after all values are read.
     * @returns true if the settings are loaded successfully.
     */
    load(file, commit = true) {
        const settings = util.tryParseJSON(fs.readFileSync(file, "utf8"));
        if (settings) {
            this.port.value = settings.port;
            this.board.value = settings.board;
            this.sketch.value = settings.sketch;
            this.configuration.value = settings.configuration;
            this.output.value = settings.output;
            this.debugger.value = settings.debugger;
            this.intelliSenseGen.value = settings.intelliSenseGen;
            this.prebuild.value = settings.prebuild;
            this.postbuild.value = settings.postbuild;
            this.programmer.value = settings.programmer;
            this.buildPreferences.value = settings.buildPreferences;
            if (commit) {
                this.commit();
            }
            return true;
        }
        else {
            logger.notifyUserError("arduinoFileError", new Error(constants.messages.ARDUINO_FILE_ERROR));
            return false;
        }
    }
    /**
     * Writes the settings to the given file if there are modified
     * values. The modification flags are reset (commit()) on successful write.
     * On write failure the modification flags are left unmodified.
     * @param file Path to file the JSON representation of the settings should
     * written to. If either the folder or the file does not exist they are
     * created.
     * @returns true on succes, false on write failure.
     */
    save(file) {
        if (!this.modified) {
            return true;
        }
        let settings = {};
        if (util.fileExistsSync(file)) {
            settings = util.tryParseJSON(fs.readFileSync(file, "utf8"));
        }
        if (!settings) {
            logger.notifyUserError("arduinoFileError", new Error(constants.messages.ARDUINO_FILE_ERROR));
            return false;
        }
        settings.sketch = this.sketch.value;
        settings.port = this.port.value;
        settings.board = this.board.value;
        settings.output = this.output.value;
        settings.debugger = this.debugger.value;
        settings.intelliSenseGen = this.intelliSenseGen.value;
        settings.configuration = this.configuration.value;
        settings.programmer = this.programmer.value;
        util.mkdirRecursivelySync(path.dirname(file));
        fs.writeFileSync(file, JSON.stringify(settings, undefined, 4));
        this.commit();
        return true;
    }
}
exports.DeviceSettings = DeviceSettings;

//# sourceMappingURL=deviceSettings.js.map

// SIG // Begin signature block
// SIG // MIInuAYJKoZIhvcNAQcCoIInqTCCJ6UCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // R39wx8Mjk151xzyNyR41YvYqVE1Yx8xv8Dvn2c2IiQyg
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIO9wgiWLz2932qkQu2pr
// SIG // cA3pxTLct0UhuoXh2UKZY7uzMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAXDi7BrUzJ34QZozBsQVo10QsvHyvk4gDByJv
// SIG // sdvbMv5OBS5FaTQvtha7DPaWIFiyuT9c7y02n3Mj73hi
// SIG // YfNtv76UmQ7Ag1//vdpdvyvPbC4hAgIUy+r3eNGNzbxH
// SIG // YC4D6zfGNjkJOBcBuLnMeJ+UwJJbnT4lAOhqqZDAjdgc
// SIG // BHswj1YHhiB9IdXo8IR7TCR8lAtGTp1yFLnoFfOlM8Hs
// SIG // YPtFGiC8AooSE1756vPY3DMclNa3RK4MD4DeJ+JZdXSW
// SIG // fpRpG4lNA0LYpLm0sbUXUMBrkNgq3I3qvpC4a2tjZ/U/
// SIG // rgk8Jj0OA61cwmw7A3hulY4eRm/xZ8vK8wAf8RZSxqGC
// SIG // FxkwghcVBgorBgEEAYI3AwMBMYIXBTCCFwEGCSqGSIb3
// SIG // DQEHAqCCFvIwghbuAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFZBgsqhkiG9w0BCRABBKCCAUgEggFEMIIBQAIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCBvLbAm
// SIG // hCL4eI70b/2vrjtqIfzloe+64AP0UhG4GMsQLwIGYf1S
// SIG // 31CwGBMyMDIyMDIxMTAxNTc1OC42MDVaMASAAgH0oIHY
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
// SIG // MC8GCSqGSIb3DQEJBDEiBCCXdMPWcNx0vwiv9H6qT54U
// SIG // a2bFOM6tOIIpPXC4oQ3vbzCB+gYLKoZIhvcNAQkQAi8x
// SIG // geowgecwgeQwgb0EINWti/gVKpDPBn/E5iEFnYHik062
// SIG // FyMDqHzriYgYmGmeMIGYMIGApH4wfDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgUENBIDIwMTACEzMAAAGMAZdiRzZ2ZjsAAQAA
// SIG // AYwwIgQghlhORpoixOE65JtQkmaeh85Rm/4vb4wgdMuJ
// SIG // jB8y+VAwDQYJKoZIhvcNAQELBQAEggIAJG+AX2xYr+6Q
// SIG // eesQPEFpvgyEqcYvrmbYD4xipFEADN+k/OLFK5DBAH41
// SIG // zTxDrJlzRKW6AIcUN7K2quPG/2DNbNWE0ruS5WXA0+5X
// SIG // BQv8Y2o6eWUoIQr4CRTh1vJrHLouM+HqXVtnEMQzJAW/
// SIG // wv5ovkVa9aL/rzqdJO+mY7btWSwp7/M3NUUJjR8wFxHx
// SIG // qr9suh6lvgvUnkrN+zd3AtOthiEjMdAm0m7si3/M3HTF
// SIG // +vIPFIPG7IB5MJRlzmsuRmoaNwVpMPO64B1r1exq9B+U
// SIG // IMM6i6guBoy8lDnCx6FoW1T6RW0Dx8UTt8XpxS+KpqhI
// SIG // 6W6vhv0/37FbHIkYUsdjnDYBKba5hpf5fNa7Bw+MOm9Q
// SIG // jsSZaX6aRA7VdtU2q2BEi7EAn5pfzNxobxmt01lsen1a
// SIG // sa+Wy3aOvU7+n0I58IJmjmjqH/V9n7nEofFI2B3h3kxS
// SIG // bok5KCq9fR6HHyQR8qy3wWD63qaqdffOGivjI8829U2/
// SIG // GrEVX9WnHwfxwo3TeROhfgS2LncG7MoRgr1zUhj8ALmn
// SIG // tKzsFE8R7hY6AQlKqMIyV1uZNCdgVUYdhthFeDd/aoe3
// SIG // HLn3F5FqHQ+EbkM/59gTLTGOXDq5aWSGfdLnM8VKEe9U
// SIG // KODIzkdRTqgJ+MOJFGkKJ7gCOYeWuYO6GRFH4Ykba2e0
// SIG // bP7bzQVDO3o=
// SIG // End signature block
