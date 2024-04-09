import MessageHandleType from "./enum/MessageHandleType.js"
import Logger from "./Logger.js"

const logger = new Logger('Broadcast')

export default class Broadcast{
    constructor(xverseRoom, t) {
        this.room = xverseRoom;
        this.handlers = []
        this.init(t)
    }

    init(t){
        this.handlers.push(t)
    }

    async handleBroadcast(e) {
        let t = null;
        try {
            t = JSON.parse(e.broadcastAction.data)
        } catch (r) {
            logger.error(r);
            return
        }
    }
    broadcast(e) {
        const {data: t, msgType: r=MessageHandleType.MHT_FollowListMulticast, targetUserIds: n} = e;
        return this.room.actionsHandler.broadcast({
            data: t,
            msgType: r,
            targetUserIds: n
        })
    }
}
;
