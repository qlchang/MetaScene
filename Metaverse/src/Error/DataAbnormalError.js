import XverseError from "./XverseError.js"

export default class DataAbnormalError extends XverseError {
    constructor(e) {
        super(2012, e || "\u6570\u636E\u5F02\u5E38")     //数据异常
    }
}