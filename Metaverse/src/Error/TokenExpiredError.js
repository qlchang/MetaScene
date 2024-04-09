import XverseError from "./XverseError.js"

export default class TokenExpiredError extends XverseError {
    constructor(e) {
        super(1005, e || "Token \u5DF2\u8FC7\u671F")       //Token 已过期
    }
}