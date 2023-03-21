import XverseError from "./XverseError.js"

export default class DoActionFailedError extends XverseError {
    constructor(e) {
        super(2009, e || "\u52A8\u4F5C\u6267\u884C\u5931\u8D25")        //动作执行失败
    }
}