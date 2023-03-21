import XverseError from "./XverseError.js"

export default class FrequencyLimitError extends XverseError {
    constructor(e) {
        super(1014, e || "\u9891\u7387\u9650\u5236")            //频率限制
    }
}