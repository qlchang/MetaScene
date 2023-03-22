import XverseError from "./XverseError.js"

export default class ActionResponseTimeoutError extends XverseError {
    constructor(e) {
        super(2999, e || "action\u56DE\u5305\u8D85\u65F6")          //回包超时
    }
}