import XverseError from "./XverseError.js"

export default class ServerParamError extends XverseError {
    constructor(e) {
        super(2002, e || "\u670D\u52A1\u5668\u53C2\u6570\u9519\u8BEF")   //服务器参数错误
    }
}