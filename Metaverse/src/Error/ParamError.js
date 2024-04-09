import XverseError from "./XverseError.js"

export default class ParamError extends XverseError {
    constructor(e) {
        super(1001, e || "\u53C2\u6570\u9519\u8BEF")            //参数错误
    }
}