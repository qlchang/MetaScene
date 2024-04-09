import XverseError from "./XverseError.js"

export default class UsersUpperLimitError extends XverseError {
    constructor(e) {
        super(2e3, e || "\u76F4\u64AD\u95F4\u4EBA\u6570\u5DF2\u6EE1")                       //直播间人数已满
    }
}