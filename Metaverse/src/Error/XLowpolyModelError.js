import XverseError from "./XverseError.js"

export default class XLowpolyModelError extends XverseError {
    constructor(e) {
        super(5204, e || "[Engine] \u4F20\u5165\u6A21\u578Burl\u9519\u8BEF")            //[Engine] 传入模型url错误
    }
}