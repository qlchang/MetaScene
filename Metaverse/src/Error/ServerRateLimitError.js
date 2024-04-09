import XverseError from "./XverseError.js"

export default class ServerRateLimitError extends XverseError {
    constructor(e) {
        super(2020, e || "\u670D\u52A1\u7AEF\u9891\u7387\u9650\u5236")   //服务端频率限制
    }
}