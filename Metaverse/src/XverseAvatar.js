import util from "./util.js"
import InternalError from "./error/InternalError.js"
import EAvatarRelationRank from "./enum/EAvatarRelationRank.js"
import AvatarGroup from "./enum/AvatarGroup.js"
import MotionType from "./enum/MotionType.js"
import Queue from "./Queue.js"
import Logger from "./Logger.js"
import CoreBroadcastType from "./enum/CoreBroadcastType.js"

const logger = new Logger('4DMVS_Character')
export default class XverseAvatar extends EventEmitter {
    constructor({userId, isHost, room, avatarId, isSelf, group=AvatarGroup.Npc}) {
        super();
        this.xAvatar
        this.state = "idle"
        this.isLoading = !0
        this._isMoving = !1
        this._isRotating = !1
        this._failed = !1
        this.disconnected = !1
        this._avatarId
        this.prioritySync = !1
        this.priority = EAvatarRelationRank.Stranger
        this._avatarModel
        this._motionType = MotionType.Walk
        this._lastAnimTraceId = ""
        this.statusSyncQueue = new Queue
        this.extraInfo = {}

        this.sayTimer

        this._userId = userId,
        this._room = room,
        this.isSelf = isSelf || !1,
        this._withModel = !!avatarId,
        this._isHost = isHost || !1,
        this._avatarId = avatarId,
        this.group = group,

        this._room.modelManager.getAvatarModelList().then(list=>{
            const avatarModel = list.find(u=>u.id === avatarId);
            avatarModel && (this._avatarModel = avatarModel)
        })
    }

    setPosition = pos => {
        !this._room.signal.isUpdatedYUV || this.xAvatar == null || this.xAvatar.setPosition(positionPrecisionProtect(pos))
    }

    setRotation = rota => {
        !this._room.signal.isUpdatedYUV || this.xAvatar == null || this.xAvatar.setRotation(rotationPrecisionProtect(rota))
    }

    stopAnimation = ()=>{
        (this.xAvatar == null ? void 0 : this.xAvatar.controller) == null || this.xAvatar.controller.stopAnimation()
    }

    _playAnimation = async(animationName, isLoop=!0, r=!1)=>{
        if (!this._room.signal.isUpdatedYUV) return;

        if (this.state !== "idle" && !r)
            return logger.debug("_playAnimation", "state is not idle"),
            Promise.resolve("_playAnimation, state is not idle");

        const startTime = Date.now();
        try {
            if (!(this.xAvatar != null && this.xAvatar.controller))
                return Promise.reject(new InternalError(`[avatar: ${this.userId}] Play animation failed: ${animationName}, no controller`));
            this.isSelf && setTimeout(()=>{
                logger.infoAndReportMeasurement({
                    tag: animationName,
                    value: 0,
                    type: "playAnimationStart"
                })
            });

            const uuid = util.uuid();
            this._lastAnimTraceId = uuid,
            await this.xAvatar.controller.playAnimation(animationName, isLoop),
            uuid === this._lastAnimTraceId && !this.isMoving && !isLoop && animationName !== "Idle" && this.xAvatar.controller.playAnimation("Idle", isLoop).catch(s=>{
                logger.error(`[avatar: ${this.userId}] Play animation failed [force idle]`, s)
            }
            ),
            this.isSelf && logger.infoAndReportMeasurement({
                tag: animationName,
                extraData: {
                    loop: isLoop
                },
                type: "playAnimationEnd"
            })
        } catch (err) {
            return logger.error(`[avatar: ${this.userId}] Play animation failed: ${animationName}`, err),
            this.isSelf && logger.infoAndReportMeasurement({
                tag: animationName,
                type: "playAnimationEnd",
                error: err,
                extraData: {
                    loop: isLoop
                }
            }),
            Promise.reject(err)
        }
    }

    changeComponents = async data => {
        const {mode, endAnimation=""} = data || {}
          , avatarComponents = JSON.parse(JSON.stringify(data.avatarComponents));

        let o = avatarComponentsValidate(avatarComponents, this._avatarModel);
        !ChangeComponentsMode[mode] && !o && (o = new ParamError(`changeComponents failed, mode: ${mode} is invalid`))

        return o ? (logger.error(o), Promise.reject(o)) 
        : this._changeComponents({ avatarComponents, mode, endAnimation }).then(()=>{
            this.isSelf && mode !== ChangeComponentsMode.Preview && this.avatarComponentsSync(this.avatarComponents)
        })
    }

    _changeComponents = async data=>{
        const {avatarComponents=[], mode} = data || {}
          , startTime = Date.now();

        try {
            if (!this.xAvatar) return Promise.reject(new InternalError("changeComponents failed, without instance: xAvatar"));

            const a = await avatarComponentsModify(this._avatarModel, avatarComponents)
              , s = []
              , l = await avatarComponentsParser(this._avatarModel, a, this.avatarComponents);

            if (l.length === 0) return this.avatarComponents;

            await this.beforeChangeComponentsHook(data);
            for (const u of l) {
                const {id, type, url, suitComb} = u;
                s.push(this.xAvatar == null ? void 0 : this.xAvatar.addComponent(id, type, url, suitComb))
            }

            await Promise.all(s)
            this.emit("componentsChanged", {
                components: this.avatarComponents,
                mode
            })
            this.isSelf && logger.infoAndReportMeasurement({
                tag: "changeComponents",
                type: "changeComponents",
                extraData: {
                    inputComponents: avatarComponents,
                    finalComponents: this.avatarComponents,
                    mode: ChangeComponentsMode[mode]
                }
            })
            return this.avatarComponents

        } catch (error) {
            this.isSelf && logger.infoAndReportMeasurement({
                tag: "changeComponents",
                type: "changeComponents",
                error,
                extraData: {
                    inputComponents: avatarComponents,
                    finalComponents: this.avatarComponents,
                    mode: ChangeComponentsMode[mode]
                }
            })
            return Promise.reject(error)
        }
    }

    avatarComponentsSync = e=>{
        e = e.map(t=>({
            type: t.type,
            id: t.id
        })),
        this._room.actionsHandler.avatarComponentsSync(e)
    }

    hide = ()=>{
        var e;
        if ((e = this.xAvatar) != null && e.hide())
            return Promise.resolve(`avatar: ${this.userId} hide success`);
        {
            const t = `avatar: ${this.userId} hide failed ${!this.xAvatar && "without instance: xAvatar"}`;
            return logger.warn(t),
            Promise.reject(t)
        }
    }

    show = ()=>{
        var e;
        if ((e = this.xAvatar) != null && e.show())
            return Promise.resolve(`avatar: ${this.userId} show success`);
        {
            const t = `avatar: ${this.userId} show failed ${!this.xAvatar && "without instance: xAvatar"}`;
            return logger.warn(t),
            Promise.reject(t)
        }
    }

    get avatarId() {
        return this._avatarId
    }

    get isRender() {
        var e;
        return !!((e = this.xAvatar) != null && e.isRender)
    }

    get isHidden() {
        var e;
        return !!((e = this.xAvatar) != null && e.isHide)
    }

    get motionType() {
        return this._motionType
    }

    set motionType(e) {
        this._motionType = e
    }
    get nickname() {
        var e;
        return (e = this.xAvatar) == null ? void 0 : e.nickName
    }

    get words() {
        var e;
        return (e = this.xAvatar) == null ? void 0 : e.words
    }

    get isHost() {
        return this._isHost
    }

    get failed() {
        return this._failed
    }

    get scale() {
        var e;
        return (e = this.xAvatar) == null ? void 0 : e.scale
    }

    get animations() {
        var e;
        return !this.xAvatar || !this.xAvatar.controller ? [] : ((e = this.xAvatar) == null ? void 0 : e.getAvaliableAnimations()) || []
    }

    get position() {
        var e;
        return (e = this.xAvatar) == null ? void 0 : e.position
    }

    get rotation() {
        var e;
        return (e = this.xAvatar) == null ? void 0 : e.rotation
    }

    get pose() {
        return {
            position: this.position,
            angle: this.rotation
        }
    }

    get id() {
        return this.userId
    }

    get isMoving() {
        return this._isMoving
    }

    set isMoving(e) {
        this._isMoving = e,
        this.state = e ? "moving" : "idle"
    }

    get isRotating() {
        return this._isRotating
    }

    set isRotating(e) {
        this._isRotating = e,
        this.state = e ? "rotating" : "idle"
    }

    get withModel() {
        return this._withModel
    }

    get avatarComponents() {
        var e;
        return JSON.parse(JSON.stringify(((e = this.xAvatar) == null ? void 0 : e.clothesList) || []))
    }

    get userId() {
        return this._userId
    }

    get removeWhenDisconnected() {
        return this.extraInfo && this.extraInfo.removeWhenDisconnected !== void 0 ? this.extraInfo.removeWhenDisconnected : !0
    }

    setConnectionStatus(e) {
        this.disconnected !== e && (this.disconnected = e,
        e ? this.emit("disconnected") : this.emit("reconnected"),
        logger.warn(`avatar ${this.userId} status changed, disconnected:`, e))
    }

    setScale(scaleNum) {
        this.xAvatar == null || this.xAvatar.setScale(scaleNum > 0 ? scaleNum : 1)
    }

    async playAnimation(aniData) {
        const {animationName, loop: isLoop, extra} = aniData || {};
        if (this.isSelf) {
            if (this.isMoving)
                try {
                    await this.stopMoving()
                } catch (err) {
                    return logger.error(`stopMoving error before playAnimation ${animationName}`, err),
                    Promise.reject(`stopMoving error before playAnimation ${animationName}`)
                }
            const data = {
                info: {
                    userId: this.userId,
                    animation: animationName,
                    loop: isLoop,
                    extra: encodeURIComponent(extra || "")
                },
                broadcastType: CoreBroadcastType.PlayAnimation
            };
            this._room.avatarManager.broadcast.broadcast({ data })
        }
        return this.emit("animationStart", {
            animationName,
            extra: safeDecodeURIComponent(extra || "")
        }),
        this._playAnimation(animationName, isLoop).then(()=>{
            this.emit("animationEnd", {
                animationName,
                extra: safeDecodeURIComponent(extra || "")
            })
        })
    }

    async beforeChangeComponentsHook(e) {}

    turnTo(e) {
        if (this._room.viewMode === "observer") {
            this._room.sceneManager.cameraComponent.MainCamera.setTarget(ue4Position2Xverse(e.point));
            return
        }
        return this._room.actionsHandler.turnTo(e).then(()=>{
            this.emit("viewChanged", {
                extra: (e == null ? void 0 : e.extra) || ""
            })
        })
    }

    async moveTo(e) {
        const {point: t, extra: r=""} = e || {};
        if (!this.position)
            return Promise.reject(new ParamError("avatar position is empty"));
        if (typeof r != "string" || typeof r == "string" && r.length > 64) {
            const a = "extra shoud be string which length less than 64";
            return logger.warn(a),
            Promise.reject(new ParamError(a))
        }
        const o = util.getDistance(this.position, t) / 100 > 100 ? MotionType.Run : MotionType.Walk;
        return this._room.actionsHandler.moveTo({
            point: t,
            motionType: o,
            extra: r
        })
    }

    async stopMoving() {
        return this._room.actionsHandler.stopMoving()
    }

    rotateTo(e) {
        return this._room.actionsHandler.rotateTo(e)
    }

    setRayCast(e) {
        this.xAvatar && (this.xAvatar.isRayCastEnable = e)
    }

    say(e, t) {
        if (this.sayTimer && window.clearTimeout(this.sayTimer),
        !this.xAvatar) {
            logger.error("say failed, without instance: xAvatar");
            return
        }
        this.xAvatar.say(e, {
            scale: this.xAvatar.scale,
            isUser: this.group === AvatarGroup.User
        }),
        !(t === void 0 || t <= 0) && (this.sayTimer = window.setTimeout(()=>{
            this.silent()
        }
        , t))
    }

    silent() {
        var e;
        if (!this.xAvatar) {
            logger.error("silent failed, without instance: xAvatar");
            return
        }
        (e = this.xAvatar) == null || e.silent()
    }

    setMotionType({type: e=MotionType.Walk}) {
        return this.motionType === e ? Promise.resolve() : this._room.actionsHandler.setMotionType(e).then(()=>{
            this._motionType = e
        }
        )
    }

    setNickname(e) {
        return this._room.actionsHandler.setNickName(encodeURIComponent(e))
    }

    _setNickname(e) {
        var r, n;
        if (!e)
            return;
        const t = safeDecodeURIComponent(e);
        ((r = this.xAvatar) == null ? void 0 : r.nickName) !== t && (this.isSelf && (this._room.updateCurrentNetworkOptions({
            nickname: t
        }),
        this._room.options.nickname = t),
        (n = this.xAvatar) == null || n.setNickName(t, {
            scale: this.xAvatar.scale
        }))
    }

    _move(e) {
        var s;
        const {start: t, end: r, walkSpeed: n, moveAnimation: o="Walking", inter: a=[]} = e || {};
        return (s = this.xAvatar) == null ? void 0 : s.move(t, r, n, o, a)
    }

    setPickBoxScale(e=1) {
        return this.xAvatar ? (this.xAvatar.setPickBoxScale(e),
        !0) : (logger.error("setPickBoxScale failed, without instance: xAvatar"),
        !1)
    }

    transfer(e) {
        const {player: t, camera: r, areaName: n, attitude: o, pathName: a} = e;
        return this._room.actionsHandler.transfer({
            renderType: RenderType.RotationVideo,
            player: t,
            camera: r,
            areaName: n,
            attitude: o,
            pathName: a,
            tag: "transfer"
        })
    }

    avatarLoadedHook() {}
    avatarStartMovingHook() {}
    avatarStopMovingHook() {}

    // 用于更新非MainAvatar的其他角色
    async statusSync(userState) {
        try {
            // 旋转
            if (userState.event && userState.event.rotateEvent) 
            {
                const { angle, speed } = userState.event.rotateEvent
                  , moveAnimation = this.motionType === MotionType.Run ? "Running" : "Walking";

                this.rotation && (
                    this.rotation.yaw = this.rotation.yaw % 360,
                    angle.yaw - this.rotation.yaw > 180 && (angle.yaw = 180 - angle.yaw),
                    this.isRotating = true,

                    await this.xAvatar.rotateTo(angle, this.rotation, moveAnimation).then(()=>{
                        this._playAnimation("Idle", true),
                        this.isRotating = false
                    })
                )
            }

            // 行走
            if (userState.event && ((userState.event.points && userState.event.points.length) || 0) > 1 && !this.isSelf)
            {
                this.isMoving = true,
                userState.playerState.attitude && (this._motionType = userState.playerState.attitude);

                const moveAnimation = this.motionType === MotionType.Run ? "Running" : "Walking"
                  , skinRoute = this._room.skin.routeList.find(l => l.areaName === this._room.currentState.areaName)
                  , walkSpeed = ((skinRoute == null ? void 0 : skinRoute.step) || 7.5) * 30 * (25 / 30);

                this.position && (
                    await this._move({
                        start: this.position,
                        end: userState.event.points[userState.event.points.length - 1],
                        walkSpeed,
                        moveAnimation: moveAnimation,
                        inter: userState.event && userState.event.points.slice(0, -1)
                    }).then(()=>{
                        this.isMoving = false
                    })
                )
            }
        } catch {
            return
        }
    }
}