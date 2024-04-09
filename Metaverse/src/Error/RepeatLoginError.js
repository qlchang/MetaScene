import XverseError from "./XverseError.js"

export default class RepeatLoginError extends XverseError {
    constructor(e) {
        super(2017, e || "\u5F02\u5730\u767B\u5F55")            //异地登录
    }
}