import XverseError from "./XverseError.js"

export default class ContainerLoadingFailedError extends XverseError {
    constructor(e) {
        super(5104, e || "[Engine] \u89D2\u8272\u8D44\u4EA7\u62C9\u53D6\u9519\u8BEF")           //角色资产拉取错误
    }
}