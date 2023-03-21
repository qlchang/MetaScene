import XverseError from "./XverseError.js"

export default class InitConfigTimeoutError extends XverseError {
    constructor(e) {
        super(1009, e || "\u914D\u7F6E\u521D\u59CB\u5316\u8D85\u65F6")          //配置初始化超时
    }
}