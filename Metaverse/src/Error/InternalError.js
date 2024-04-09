import XverseError from "./XverseError.js"

export default class InternalError extends XverseError {
    constructor(e) {
        super(1002, e || "\u5185\u90E8\u9519\u8BEF")            //内部错误
    }
}