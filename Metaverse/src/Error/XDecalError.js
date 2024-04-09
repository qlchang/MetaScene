import XverseError from "./XverseError.js"

export default class XDecalError extends XverseError {
    constructor(e) {
        super(5206, e || "[Engine] Decal\u6A21\u578B\u9519\u8BEF")                      //[Engine] Decal 模型错误
    }
}