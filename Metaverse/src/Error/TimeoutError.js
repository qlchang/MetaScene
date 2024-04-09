import XverseError from "./XverseError.js"

export default class TimeoutError extends XverseError {
    constructor(e) {
        super(1003, e || "\u8D85\u65F6")            //超时
    }
}