import XverseError from "./XverseError.js"

export default class AvatarAnimationError extends XverseError {
    constructor(e) {
        super(5101, e || "[Engine] \u89D2\u8272\u52A8\u753B\u64AD\u653E\u5931\u8D25")   //角色动画播放失败
    }
}