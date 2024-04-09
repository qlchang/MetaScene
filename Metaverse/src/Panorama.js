import Codes from "./enum/Codes.js"
import {eventsManager} from "./EventsManager.js"
import util from "./util.js"
import Logger from "./Logger.js"

const logger = new Logger('panorama')
export default class Panorama {
    constructor(e) {
        E(this, "_actived", !1);
        E(this, "handleReceivePanorama", async(e,t)=>{
            logger.warn("handle panorama", e.uuid, e.pos, e.finished);
            const r = {
                data: e.data,
                pose: {
                    position: e.pos
                }
            }
              , n = this.room.sceneManager;
            if (this.room.networkController.rtcp.workers.changePanoMode(!0),
            await n.materialComponent.changePanoImg(0, r),
            !!e.finished)
                if (await n.changePanoShaderForLowModel(0),
                this.room.isPano = !0,
                this._actived = !0,
                t)
                    this.room.sceneManager.cameraComponent.changeToFirstPersonView({
                        position: t.position,
                        rotation: t.angle
                    });
                else {
                    const {skinId: o, pathName: a} = this.room.currentState;
                    if (!o || !a)
                        return;
                    const s = await this.room.modelManager.findRoute(o, a)
                      , {camera: l} = util.getRandomItem(s.birthPointList) || {};
                    l && this.room.sceneManager.cameraComponent.changeToFirstPersonView(le(oe({}, l), {
                        rotation: l.angle
                    }))
                }
        }
        );
        this.room = e
    }
    get actived() {
        return this._actived
    }
    bindListener(e) {
        this.room.networkController.rtcp.workers.registerFunction("panorama", r=>{
            logger.warn("receive panorama", r.uuid, r.pos),
            r.uuid && eventsManager.remove(r.uuid, Codes.Success, r, !0),
            this.room.isFirstDataUsed || (this.room.isFirstDataUsed = !0,
            this.handleReceivePanorama(r, this.room.options.camera).then(e))
        }
        )
    }
    access(e, t, r) {
        const {camera: n, player: o, attitude: a, areaName: s, pathName: l, tag: u} = e;
        return this.room.actionsHandler.requestPanorama({
            camera: n,
            player: o,
            attitude: a,
            areaName: s,
            pathName: l,
            tag: u
        }, t, r).then(c=>this.handleReceivePanorama(c, o))
    }
    exit(e) {
        const {camera: t, player: r, attitude: n, areaName: o, pathName: a} = e;
        return this.room.networkController.rtcp.workers.changePanoMode(!1),
        this.room.actionsHandler.changeRotationRenderType({
            renderType: RenderType.RotationVideo,
            player: r,
            camera: t,
            attitude: n,
            areaName: o,
            pathName: a
        }).then(()=>this.handleExitPanorama()).catch(s=>(this.room.networkController.rtcp.workers.changePanoMode(!0),
        Promise.reject(s)))
    }
    handleExitPanorama() {
        var e, t, r, n, o, a;
        this.room.isPano = !1,
        this._actived = !1,
        (n = (e = this.room.sceneManager) == null ? void 0 : e.cameraComponent) == null || n.forceChangeSavedCameraPose({
            position: (t = this.room._currentClickingState) == null ? void 0 : t.camera.position,
            rotation: (r = this.room._currentClickingState) == null ? void 0 : r.camera.angle
        }),
        this.room.sceneManager.changeVideoShaderForLowModel(),
        (a = (o = this.room.sceneManager) == null ? void 0 : o.cameraComponent) == null || a.changeToThirdPersonView()
    }
}