import XverseError from "./XverseError.js"

export default class ActionMaybeDelayError extends XverseError {
    constructor(e) {
        super(2334, e || "\u52A8\u4F5C\u53EF\u80FD\u5EF6\u8FDF\u6267\u884C")            //动作可能延迟执行
    }
}