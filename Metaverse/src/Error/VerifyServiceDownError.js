import XverseError from "./XverseError.js"

export default class VerifyServiceDownError extends XverseError {
    constructor(e) {
        super(2005, e || "\u9274\u6743\u670D\u52A1\u5F02\u5E38")            //鉴权服务异常
    }
}