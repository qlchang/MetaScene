import XverseError from "./XverseError.js"

export default class DuplicateAvatarIDError extends XverseError {
    constructor(e) {
        super(5103, e || "[Engine] \u89D2\u8272id\u91CD\u590D")         //角色id重复
    }
}