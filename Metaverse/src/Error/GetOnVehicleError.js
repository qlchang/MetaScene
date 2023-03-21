import XverseError from "./XverseError.js"

export default class GetOnVehicleError extends XverseError {
    constructor(e) {
        super(2015, e || "\u4E0A\u8F7D\u5177\u5931\u8D25\u9700\u8981\u9884\u7EA6")          //上载具失败需要预约
    }
}