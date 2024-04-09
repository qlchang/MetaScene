import XverseError from "./XverseError.js"

export default class XTvModelError extends XverseError {
    constructor(e) {
        super(5203, e || "[Engine] \u4F20\u5165TV\u6A21\u578Burl\u9519\u8BEF")              //[Engine] 传入TV模型url错误
    }
}