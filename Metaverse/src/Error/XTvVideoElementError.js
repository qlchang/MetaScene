import XverseError from "./XverseError.js"

export default class XTvVideoElementError extends XverseError {
    constructor(e) {
        super(5202, e || "[Engine] \u4F20\u5165video DOM\u9519\u8BEF")                      //[Engine] 传入video DOM错误
    }
}