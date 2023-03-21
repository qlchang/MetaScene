import Codes from "../enum/Codes.js"

export default class XverseError extends Error {
    constructor(e, t) {
        super(t);
        this.code = e
    }
    toJSON() {
        return {
            code: this.code,
            message: this.message
        }
    }
    toString() {
        if (Object(this) !== this)
            throw new TypeError;
        let t = this.name;
        t = t === void 0 ? "Error" : String(t);
        let r = this.message;
        r = r === void 0 ? "" : String(r);
        const n = this.code;
        return r = n === void 0 ? r : n + "," + r,
        t === "" ? r : r === "" ? t : t + ": " + r
    }
}













































