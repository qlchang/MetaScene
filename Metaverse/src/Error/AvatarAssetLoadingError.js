import XverseError from "./XverseError.js"

export default class AvatarAssetLoadingError extends XverseError {
    constructor(e) {
        super(5100, e || "[Engine] \u89D2\u8272\u8D44\u4EA7\u52A0\u8F7D\u5931\u8D25")           //角色资产加载失败
    }
}