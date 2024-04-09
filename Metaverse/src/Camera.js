import CameraStates from "./enum/CameraStates.js"
import Person from "./enum/Person.js"
import EImageQuality from "./enum/EImageQuality.js"
import Actions from "./enum/Actions.js"
import Logger from "./Logger.js"

const logger = new Logger('camera')
export default class Camera extends EventEmitter {
    constructor(e) {
        super();
        this.initialFov = 0
        this._state = CameraStates.Normal
        this._person = Person.Third
        this._cameraFollowing = !0
        this._room = e
    }

    /*
    checkPointOnLeftOrRight(e){
        const t = ue4Position2Xverse(e);
        if (!t || this.checkPointInView(e))
        {
            return;
        }
        const activeCamera = this._room.scene.activeCamera;
        if (!activeCamera)
        {
            return;
        }
        const a = [activeCamera.target.x, activeCamera.target.y, activeCamera.target.z]
          , s = [activeCamera.position.x, activeCamera.position.y, activeCamera.position.z]
          , {x: l, y: u, z: c} = t
          , h = calNormVector(s, a)
          , f = calNormVector(s, [l, u, c]);
        return vectorCrossMulti(h, f) < 0 ? Direction.Right : Direction.Left
    }

    checkPointInView(e,t,r){
        const n = ue4Position2Xverse({
            x: e,
            y: t,
            z: r
        });
        if (!n)
            return !1;
        for (let o = 0; o < 6; o++)
            if (this._room.scene.frustumPlanes[o].dotCoordinate(n) < 0)
                return !1;
        return !0
    }

    get person() {
        return this._person
    }
    get state() {
        return this._state
    }
    get pose() {
        return this._room.currentClickingState.camera
    }
    set cameraFollowing(e) {
        logger.info("cameraFollowing setter", e),
        this.setCameraFollowing({
            isFollowHost: e
        })
    }
    get cameraFollowing() {
        return this._cameraFollowing
    }

    setCameraFollowing({isFollowHost: e}) {}
    */

    handleRenderInfo(e) {
        const {cameraStateType} = e.renderInfo;
        const sceneManager = this._room.sceneManager;

        if(cameraStateType !== this._state) {
            this._state = cameraStateType;
            logger.debug("camera._state changed to", CameraStates[cameraStateType]);
            
            if(cameraStateType === CameraStates.CGView) {
                sceneManager.cameraComponent.switchToCgCamera();
                sceneManager.staticmeshComponent.getCgMesh().show();
            } else {
                sceneManager.cameraComponent.switchToMainCamera();
                sceneManager.staticmeshComponent.getCgMesh().hide();
            }

            this.emit("stateChanged", { state: cameraStateType })
        }
        
        if(this._room.isHost) return;

        const {isFollowHost} = e.playerState;
        if(!!isFollowHost !== this._cameraFollowing) {
            this._cameraFollowing = !!isFollowHost;
            this.emit("cameraFollowingChanged", { cameraFollowing: !!isFollowHost })
        }
    }
    /*
    setCameraState({state: state}) {
        if (this._state === state) {
            logger.warn(`You are already in ${CameraStates[state]} camera state`);
            return
        }
        state === CameraStates.Normal || this._state === CameraStates.ItemView && logger.warn("CloseUp camera state can only be triggerd by room internally")
    }
    turnToFace({extra: e="", offset: t=0}) {
        const r = {
            action_type: Actions.TurnToFace,
            turn_to_face_action: {
                offset: t
            }
        };
        return this.emit("viewChanged", {
            extra: e
        }),
        this._room.actionsHandler.sendData({
            data: r
        })
    }
    isInDefaultView() {
        if (!this._room.isHost) {
            logger.warn("It is recommended to call the function on the host side");
            return
        }
        if (!this._room._currentClickingState)
        {
            logger.error("CurrentState should not be empty");
            return !1;
        }
        const {camera: camera, player: player} = this._room._currentClickingState;
        return Math.abs(player.angle.yaw - 180 - camera.angle.yaw) % 360 <= 4
    }
    
    async screenShot({name: name, autoSave: autoSave=!1}) {
        const engine = this._room.scene.getEngine()
        const activeCamera = this._room.scene.activeCamera;
        try {
            this._room.sceneManager.setImageQuality(EImageQuality.high);
            const promise = await CreateScreenshotAsync(engine, activeCamera, {
                precision: 1
            });
            this._room.sceneManager.setImageQuality(EImageQuality.low);
            autoSave === !0 && downloadFileByBase64(promise, name);
            return Promise.resolve(promise)
        } catch (error) {
            this._room.sceneManager.setImageQuality(EImageQuality.low)
            return Promise.reject(error)
        }
    }
    changeToFirstPerson(e, t, r) {
        const {camera: camera, player: player, attitude: attitude, areaName: areaName, pathName: pathName} = e;
        return this._room.actionsHandler.requestPanorama({
            camera: camera,
            player: player,
            attitude: attitude,
            areaName: areaName,
            pathName: pathName
        }, t, r).then(()=>{
            this._room.networkController.rtcp.workers.changePanoMode(!0);
            const {position: u, angle: c} = player || {};
            this._room.sceneManager.cameraComponent.changeToFirstPersonView({
                position: u,
                rotation: c
            })
        }
        )
    }
    setPerson(e, t={
        camera: this._room._currentClickingState.camera,
        player: this._room._currentClickingState.player
    }) {
        const startTime = Date.now();
        return this._setPerson(e, t).then(n=>(logger.infoAndReportMeasurement({
            tag: Person[e],
            startTime: startTime,
            metric: "setPerson"
        }),n)).catch(n=>(logger.infoAndReportMeasurement({
            tag: Person[e],
            startTime: startTime,
            metric: "setPerson",
            error: n
        }),
        Promise.reject(n)))
    }
    _setPerson(e, t={
        camera: this._room._currentClickingState.camera,
        player: this._room._currentClickingState.player
    }) {
        return e !== Person.First && e !== Person.Third ? Promise.reject("invalid person " + e) : !t.camera || !t.player ? Promise.reject(new ParamError("wrong camera or player")) : e === Person.First ? this._room.panorama.access({
            camera: t.camera,
            player: t.player,
            tag: "setPerson"
        }).then(()=>{
            var o, a;
            this._person = e,
            (o = this._room._userAvatar) == null || o.hide();
            const {position: r, angle: n} = ((a = this._room.currentClickingState) == null ? void 0 : a.camera) || {};
            !r || !n || this._room.sceneManager.cameraComponent.changeToFirstPersonView({
                position: r,
                rotation: n
            })
        }
        ) : this._room.panorama.exit({
            camera: t.camera,
            player: t.player
        }).then(()=>{
            var r, n;
            this._person = e,
            (r = this._room._userAvatar) != null && r.xAvatar && ((n = this._room._userAvatar) == null || n.xAvatar.show())
        }
        )
    }
    */
    setCameraPose(cameraPose) {
        this._room.sceneManager.cameraComponent.setCameraPose({
            position: cameraPose.position,
            rotation: cameraPose.angle
        })
    }
    // setMainCameraRotationLimit(e) {
    //     const {limitAxis: t, limitRotation: r} = e;
    //     this._room.sceneManager.cameraComponent.setMainCameraRotationLimit(t, r)
    // }
}