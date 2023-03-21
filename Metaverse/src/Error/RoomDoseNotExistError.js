import XverseError from "./XverseError.js"

export default class RoomDoseNotExistError extends XverseError {
    constructor(e) {
        super(2018, e || "\u6307\u5B9A\u623F\u95F4\u4E0D\u5B58\u5728")              //指定房间不存在
    }
}