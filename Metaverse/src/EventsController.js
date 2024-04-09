import {eventsManager} from "./EventsManager.js"
import StaticMeshEvent from "./StaticMeshEvent.js"
import RotationEvent from "./RotationEvent.js"
import Logger from "./Logger.js"

const logger = new Logger('eventsController')

export default class EventsController {
    constructor(e) {
        E(this, "staticmeshEvent");
        E(this, "rotationEvent");
        E(this, "resize", ()=>{
            this.room.sceneManager.cameraComponent.cameraFovChange(this.room.sceneManager.yuvInfo)
        }
        );
        E(this, "clickEvent", e=>{
            const {point: t, name: r, type: n, id: o} = e;
            logger.debug("pointEvent", e),
            this.room.proxyEvents("pointTap", {
                point: t,
                meshName: r,
                type: n,
                id: o
            }),
            this.room.proxyEvents("_coreClick", e)
        }
        );
        E(this, "longPressEvent", e=>{
            this.room.proxyEvents("_corePress", e)
        }
        );
        E(this, "handleActionResponseTimeout", ({error: e, event: t})=>{
            this.room.proxyEvents("actionResponseTimeout", {
                error: e,
                event: t
            })
        }
        );
        E(this, "handleNetworkStateChange", e=>{
            const {state: t, count: r} = e;
            t == "reconnecting" ? this.room.proxyEvents("reconnecting", {
                count: r || 1
            }) : t === "reconnected" ? (this.room.networkController.rtcp.workers.reset(),
            this.room.proxyEvents("reconnected"),
            this.room.afterReconnected()) : t === "disconnected" && this.room.proxyEvents("disconnected")
        }
        );
        this.room = e,
        this.staticmeshEvent = new StaticMeshEvent(this.room.sceneManager),
        this.rotationEvent = new RotationEvent(e)
    }
    bindEvents() {
        window.addEventListener("orientationchange"in window ? "orientationchange" : "resize", this.resize),
        this.staticmeshEvent.on("pointTap", this.clickEvent),
        this.staticmeshEvent.on("longPress", this.longPressEvent),
        this.rotationEvent.init(),
        eventsManager.on("actionResponseTimeout", this.handleActionResponseTimeout),
        this.room.networkController.on("stateChanged", this.handleNetworkStateChange)
    }
    clearEvents() {
        window.removeEventListener("orientationchange"in window ? "orientationchange" : "resize", this.resize),
        this.staticmeshEvent.off("pointTap", this.clickEvent),
        this.staticmeshEvent.off("longPress", this.longPressEvent),
        eventsManager.off("actionResponseTimeout", this.handleActionResponseTimeout),
        this.room.networkController.off("stateChanged", this.handleNetworkStateChange),
        this.rotationEvent.clear()
    }
}