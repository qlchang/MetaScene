import XverseError from "./XverseError.js"

export default class AuthenticationError extends XverseError {
    constructor(e) {
        super(1004, e || "\u9274\u6743\u5931\u8D25")                //鉴权失败
    }
}