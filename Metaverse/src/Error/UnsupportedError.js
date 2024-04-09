import XverseError from "./XverseError.js"

export default class UnsupportedError extends XverseError {
    constructor(e) {
        super(1006, e || "\u624B\u673A\u7CFB\u7EDF\u4E0D\u652F\u6301XVerse")     //手机系统不支持 XVerse
    }
}