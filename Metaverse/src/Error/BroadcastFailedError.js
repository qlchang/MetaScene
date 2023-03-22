import XverseError from "./XverseError.js"

export default class BroadcastFailedError extends XverseError {
    constructor(e) {
        super(2011, e || "\u5E7F\u64AD\u63A5\u53E3\u63A5\u53E3\u5F02\u5E38")            //广播接口接口异常
    }
}