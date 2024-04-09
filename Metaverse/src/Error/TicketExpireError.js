import XverseError from "./XverseError.js"

export default class TicketExpireError extends XverseError {
    constructor(e) {
        super(2019, e || "\u7968\u636E\u8FC7\u671F")        //票据过期
    }
}