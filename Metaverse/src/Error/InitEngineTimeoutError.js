import XverseError from "./XverseError.js"

export default class InitEngineTimeoutError extends XverseError {
    constructor(e) {
        super(1010, e || "\u5F15\u64CE\u521D\u59CB\u5316\u8D85\u65F6")          //引擎初始化超时
    }
}