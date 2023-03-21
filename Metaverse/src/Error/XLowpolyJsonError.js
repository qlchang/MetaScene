import XverseError from "./XverseError.js"

export default class XLowpolyJsonError extends XverseError {
    constructor(e) {
        super(5205, e || "[Engine] \u4F20\u5165\u6A21\u578Bjson\u9519\u8BEF")                       //[Engine] 传入模型json错误
    }
}