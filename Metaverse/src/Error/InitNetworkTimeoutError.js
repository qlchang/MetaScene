
import XverseError from "./XverseError.js"

export default class InitNetworkTimeoutError extends XverseError {
    constructor(e) {
        super(1007, e || "\u7F51\u7EDC\u521D\u59CB\u5316\u8D85\u65F6")              //网络初始化超时
    }
}