import XverseError from "./XverseError.js"

export default class XMaterialError extends XverseError {
    constructor(e) {
        super(5210, e || "[Engine] Material\u9519\u8BEF")                   //[Engine] Material错误
    }
}