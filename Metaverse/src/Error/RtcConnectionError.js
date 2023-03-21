import XverseError from "./XverseError.js"

export default class RtcConnectionError extends XverseError {
    constructor(e) {
        super(2008, e || "RTC\u5EFA\u8054\u5931\u8D25")   //RTC建联失败
    }
}