import XverseError from "./XverseError.js"

export default class RoomsUpperLimitError extends XverseError {
    constructor(e) {
        super(2001, e || "\u623F\u95F4\u5230\u8FBE\u4E0A\u9650")            //房间到达上限
    }
}