import XverseError from "./XverseError.js"

export default class InitEngineError extends XverseError {
    constructor(e) {
        super(1011, e || "\u5F15\u64CE\u521D\u59CB\u5316\u9519\u8BEF")              //引擎初始化错误
    }
}