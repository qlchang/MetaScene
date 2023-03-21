import XverseError from "./XverseError.js"

export default class LoginFailedError extends XverseError {
    constructor(e) {
        super(2004, e || "\u8FDB\u5165\u623F\u95F4\u5931\u8D25")            //进入房间失败
    }
}