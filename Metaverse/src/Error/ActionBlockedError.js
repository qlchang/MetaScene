import XverseError from "./XverseError.js"

export default class ActionBlockedError extends XverseError {
    constructor(e) {
        super(1012, e || "\u52A8\u4F5C\u88AB\u5C4F\u853D")  //动作被屏蔽
    }
}