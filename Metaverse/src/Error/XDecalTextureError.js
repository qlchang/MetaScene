import XverseError from "./XverseError.js"

export default class XDecalTextureError extends XverseError {
    constructor(e) {
        super(5207, e || "[Engine] decal\u7EB9\u7406\u9519\u8BEF")      //[Engine] decal纹理错误
    }
}