import InternalError from "./error/InternalError.js"
import Logger from "./Logger.js"

const logger = new Logger('stream')
export default class Stream {
    constructor(e) {
        this.el = null
        this._streamPlayTimer = null
        if (!e) {
            this.el = this.createVideoElement();
            return
        }
        this.el = e
    }

    play(){
        return new Promise((e,t)=>{
            this._streamPlayTimer = new Timeout(()=>{
                t(new InternalError("Stream play timeout"))
            }
            ,5e3),
            this.el && this.el.play().then(()=>{
                var r;
                e(),
                logger.info("Media can autoplay"),
                (r = this._streamPlayTimer) == null || r.clear()
            }
            ).catch(r=>{
                var n;
                logger.error("Media Failed to autoplay"),
                logger.error(r),
                t(new InternalError("Media Failed to autoplay")),
                (n = this._streamPlayTimer) == null || n.clear()
            }
            )
        }
        )
    }

    createVideoElement() {
        const e = document.createElement("video");
        return e.muted = !0,
        e.autoplay = !1,
        e.playsInline = !0,
        e.setAttribute("autostart", "false"),
        e.setAttribute("controls", "controls"),
        e.setAttribute("muted", "true"),
        e.setAttribute("preload", "auto"),
        e.setAttribute("hidden", "hidden"),
        document.body.appendChild(e),
        e
    }
}