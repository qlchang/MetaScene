import Logger from "./Logger.js"

const logger = new Logger('heartbeat')

export default class Heartbeat {
    constructor(e) {
        E(this, "_interval", null);
        E(this, "ping", ()=>{
            const e = Date.now().toString();
            this.handler.ping(e)
        }
        );
        this.handler = e
    }
    ping(){
        const e = Date.now().toString();
        this.handler.ping(e)
    }
    start() {
        this.stop(),
        logger.debug(`Setting ping interval to ${PING_INTERVAL_MS}ms`),
        this._interval = window.setInterval(this.ping, PING_INTERVAL_MS)
    }
    stop() {
        logger.debug("stop heartbeat"),
        this._interval && window.clearInterval(this._interval)
    }
    pong(e, t) {
        !e || typeof e == "string" && this.handler.pong(Date.now() - Number(e), t)
    }
}