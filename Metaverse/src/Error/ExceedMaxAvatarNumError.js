import XverseError from "./XverseError.js"

export default class ExceedMaxAvatarNumError extends XverseError {
    constructor(e) {
        super(5211, e || "[Engine] \u89D2\u8272\u4E2A\u6570\u8D85\u51FA\u4E0A\u9650")           //角色个数超出上限
    }
}