import XverseError from "./XverseError.js"

export default class XBreathPointError extends XverseError {
    constructor(e) {
        super(5208, e || "[Engine] \u547C\u5438\u70B9\u9519\u8BEF")             //[Engine] 呼吸点错误
    }
}