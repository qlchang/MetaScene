import XverseError from "./XverseError.js"

export default class StateSyncFailedError extends XverseError {
    constructor(e) {
        super(2010, e || "\u72B6\u6001\u540C\u6B65\u5931\u8D25")    //状态同步失败
    }
}