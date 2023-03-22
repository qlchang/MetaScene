import XverseError from "./XverseError.js"

export default class PreloadCanceledError extends XverseError {
    constructor(e) {
        super(1013, e || "\u9884\u52A0\u8F7D\u88AB\u53D6\u6D88")            //预加载被取消
    }
}