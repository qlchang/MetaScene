import XverseError from "./XverseError.js"

export default class XTvMediaUrlError extends XverseError {
    constructor(e) {
        super(5201, e || "[Engine] \u4F20\u5165Url\u9519\u8BEF")                //[Engine] 传入Url错误
    }
}