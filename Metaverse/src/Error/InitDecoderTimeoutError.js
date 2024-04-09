import XverseError from "./XverseError.js"

export default class InitDecoderTimeoutError extends XverseError {
    constructor(e) {
        super(1008, e || "Decoder \u521D\u59CB\u5316\u8D85\u65F6")          //初始化超时
    }
}