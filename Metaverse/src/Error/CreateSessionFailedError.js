import XverseError from "./XverseError.js"

export default class CreateSessionFailedError extends XverseError {
    constructor(e) {
        super(2006, e || "\u521B\u5EFA session \u5931\u8D25")           //创建 session 失败
    }
}