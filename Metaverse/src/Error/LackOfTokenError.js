import XverseError from "./XverseError.js"

export default class LackOfTokenError extends XverseError {
    constructor(e) {
        super(2003, e || "\u7F3A\u5C11 Token")          //缺少
    }
}