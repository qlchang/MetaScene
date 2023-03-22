import CoreBroadcastType from "./enum/CoreBroadcastType.js"
import AvatarGroup from "./enum/AvatarGroup.js"
import Broadcast from "./Broadcast.js"
import {avatarLoader} from "./XAvatarLoader.js"
import SyncEventType from "./enum/SyncEventType.js"
import GetStateTypes from "./enum/GetStateTypes.js"
import EAvatarRelationRank from "./enum/EAvatarRelationRank.js"
import Person from "./enum/Person.js"
import XverseAvatar from "./XverseAvatar.js"
import MotionType from "./enum/MotionType.js"
import TimeoutError from "./error/TimeoutError.js"
import Logger from "./Logger.js"
import QueueType from "./enum/QueueType.js"

const logger = new Logger('4DMVS_CharacterManager')
export default class XverseAvatarManager extends EventEmitter {
    constructor(room) {
        super();
        this.xAvatarManager = null
        this.avatars = new Map
        this.syncAvatarsLength = 0
        this._room = room;
        this._usersStatistics();
        this.broadcast = this.setupBroadcast();
        room.on("skinChanged", ()=>{
            this.avatars.forEach(t=>{
                avatar.disconnected && this.removeAvatar(avatar.userId, !0)
            })
        })
    }
    setupBroadcast() {
        return new Broadcast(this._room,async e=>{
            const {broadcastType: t, info: r} = e;
            if (t !== CoreBroadcastType.PlayAnimation)
                return;
            const {userId: n, animation: o, extra: a, loop: s=!1} = r
              , l = this.avatars.get(n);
            l && !l.isSelf && (l.emit("animationStart", {
                animationName: o,
                extra: decodeURIComponent(a)
            }),
            await (l == null ? void 0 : l._playAnimation(o, s)),
            l.emit("animationEnd", {
                animationName: o,
                extra: decodeURIComponent(a)
            }))
        }
        )
    }
    hideAll(e=!0) {
        this.xAvatarManager.hideAll(e)
    }
    showAll(e=!0) {
        this.xAvatarManager.showAll(e)
    }

    async init() {
        this.xAvatarManager = this._room.sceneManager.avatarComponent;
        try {
            const configList = await this._room.modelManager.getApplicationConfig()
              , {avatars} = configList;
            if (avatars) {
                await avatarLoader.parse(this._room.sceneManager, avatars);
                return
            }
            return Promise.reject("cannot find avatar config list")
        } catch (e) {
            return logger.error(e),
            Promise.reject("avatar mananger init error!")
        }
    }

    async handleAvatar(signal) {
        if (this._room.viewMode === "simple" || !this._room.joined || !signal.newUserStates)
            return;

        let newUserStates = signal.newUserStates;
        let userAvatar = this._room._userAvatar;
        if ((userAvatar == null ? void 0 : userAvatar.isMoving) && userAvatar.motionType === MotionType.Run) 
        {
            const mainStates = newUserStates.filter(state => state.userId === this._room.userId)
              , o = newUserStates.filter(state => state.userId !== this._room.userId).slice(0, 2);
              newUserStates = mainStates.concat(o)
        }

        if (signal.getStateType === GetStateTypes.Event) 
        {
            this.syncAvatarsLength = (newUserStates || []).length;
            const n = this._room.avatars.filter(avatar => avatar.group == AvatarGroup.User);
            n.filter(avatar => 
                !(newUserStates != null && newUserStates.find(state => state.userId == avatar.userId))
            ).forEach(avatar=>{
                this.removeAvatar(avatar.userId)
            });
            const a = newUserStates.filter(state => !n.find(avatar => avatar.userId == state.userId));
            this._handleAvatar(a)
        }
        this._handleAvatar(newUserStates)
    }

    async _handleAvatar(newUserStates) {

        newUserStates && newUserStates.forEach(state=>{

            const isMainAvatar = this._room.userId === state.userId;

            if (state.event && state.event.type === SyncEventType.ET_RemoveVisitor) 
            {
                const removeVisitorEvent = state.event.removeVisitorEvent
                const event =  removeVisitorEvent && removeVisitorEvent.removeVisitorEvent
                  , extraInfo = JSON.parse(safeDecodeURIComponent((removeVisitorEvent && removeVisitorEvent.extraInfo) || ""))
                  , { code, msg } = extraInfo;

                  event === RemoveVisitorType.RVT_ChangeToObserver 
                    ? this._room.audienceViewModeHook() 
                    : event === RemoveVisitorType.RVT_MoveOutOfTheRoom && this._room.leave()      // 这里会触发Actions.Exit

                this._room.emit("visitorStatusChanged", { code, msg })
            }

            if (state.event && [SyncEventType.Appear, SyncEventType.Reset].includes(state.event.type) || !state.event) {

                let avatar = this.avatars.get(state.userId);
                if(state.playerState.avatarId && avatar && avatar.avatarId !== state.playerState.avatarId) {
                    avatar = void 0
                    this.removeAvatar(state.userId)
                }

                if (avatar) {
                    avatar.disconnected && avatar.setConnectionStatus(!1)
                    state.event && state.event.id && this._room.actionsHandler.confirmEvent(state.event.id)    // 这里会触发Actions.ConfirmEvent
                    state.playerState.nickName && (avatar && avatar._setNickname(state.playerState.nickName))

                    if (state.playerState.avatarComponents && !avatar.isSelf && avatar.xAvatar) {
                        const avatarComponents = safeParseComponents(state.playerState.avatarComponents);
                        // 这里会触发Actions.SetPlayerState
                        avatar._changeComponents({
                            avatarComponents,
                            mode: ChangeComponentsMode.Preview
                        })
                    }
                } else {
                    const {position, angle} = state.playerState.player
                      , avatarId = state.playerState.avatarId
                      , prioritySync = state.playerState.prioritySync
                      , extraInfo = safelyJsonParse(state.playerState.extra);
                    if (!avatarId) return;

                    const avatarComponents = safeParseComponents(state.playerState.avatarComponents)
                      , nickname = safeDecodeURIComponent(state.playerState.nickName)
                      , priority = this.calculatePriority(state.userId, extraInfo);
                      
                    this.addAvatar({
                        userId: state.userId,
                        isHost: state.playerState.isHost,
                        nickname,
                        avatarPosition: position,
                        avatarRotation: angle,
                        avatarScale: state.playerState.avatarSize,
                        avatarId,
                        avatarComponents: state.playerState.person === Person.First ? [] : avatarComponents,
                        priority,
                        group: AvatarGroup.User,
                        prioritySync,
                        extraInfo
                    }).then(()=>{
                        state.event && state.event.id && this._room.actionsHandler.confirmEvent(state.event.id),    // 这里会触发Actions.ConfirmEvent
                        this.updateAvatarPositionAndRotation(state),
                        isMainAvatar && (
                            this.xAvatarManager.setMainAvatar(state.userId),
                            this._room.emit("userAvatarLoaded"),
                            logger.info("userAvatarLoaded")
                        )
                    }).catch(e=>{
                        isMainAvatar && (
                            this.xAvatarManager.setMainAvatar(state.userId),
                            this._room.emit("userAvatarFailed", {error: e}),
                            logger.error("userAvatarFailed", e)
                        )
                    })
                }
            }

            if(state.event && SyncEventType.Disappear === state.event.type) { 
                state.event.id && this._room.actionsHandler.confirmEvent(state.event.id)    // 这里会触发Actions.ConfirmEvent
                this.removeAvatar(state.userId)
            }

            if (state.event && [SyncEventType.Move, SyncEventType.ChangeRenderInfo].includes(state.event.type) || !state.event) {
                state.event && state.event.id && this._room.actionsHandler.confirmEvent(state.event.id);    // 这里会触发Actions.ConfirmEvent
                const avatar = this.avatars.get(state.userId);
                avatar && avatar.withModel && !avatar.isLoading && this.updateAvatarPositionAndRotation(state)
            }

            if (!isMainAvatar && state.event && state.event.type === SyncEventType.Rotate) {
                const avatar = this.avatars.get(state.userId);
                avatar.statusSyncQueue.append({
                    type: QueueType.Rotate,
                    action: () => avatar.statusSync(state)
                })
            }
        })
    }

    calculatePriority(e, t) {
        var n;
        return e === this._room.userId ? EAvatarRelationRank.Self : (n = this._room.options.firends) != null && n.includes(e) ? EAvatarRelationRank.Friend : EAvatarRelationRank.Stranger
    }

    updateAvatarPositionAndRotation(userState) 
    {
        if (userState.playerState && userState.playerState.player) 
        {
            let {position, angle} = userState.playerState.player;
            const avatar = this.avatars.get(userState.userId);
            if (!avatar) return;

            position = positionPrecisionProtect(position)
            angle = rotationPrecisionProtect(angle)
            avatar.isSelf && !this._room.networkController.rtcp.workers.inPanoMode && (avatar.setPosition(position), avatar.setRotation(angle))
            userState.event && (userState.event.points.length || 0) > 1 && !avatar.isSelf && avatar.statusSyncQueue.append({
                type: QueueType.Move,
                action: () => avatar.statusSync(userState)
            })

            if (userState.renderInfo && avatar.isSelf) {
                const {isMoving, isRotating} = userState.renderInfo;
                this._updateAvatarMovingStatus({
                    id: userState.userId,
                    isMoving: isMoving,
                    isRotating: !!isRotating
                })
            }
        }
    }

    async addAvatar({
        userId, isHost, avatarPosition, avatarId, avatarRotation, nickname, avatarComponents=[], priority, group=AvatarGroup.Npc, 
        avatarScale=DEFAULT_AVATAR_SCALE, extraInfo, prioritySync
    }) {
        const isSelf = userId === this._room.userId;
        let avatar = this.avatars.get(userId);
        if (avatar) return Promise.resolve(avatar);

        avatar = new XverseAvatarManager.subAvatar({
            userId,
            isHost,
            isSelf,
            room: this._room,
            avatarComponents,
            avatarId,
            nickname,
            group
        });
        this.avatars.set(userId, avatar);

        if (!avatar.withModel) {
            avatar.isLoading = !1
            avatar.avatarLoadedHook()
            this._room.emit("avatarChanged", { avatars: this._room.avatars })
            return avatar;
        }

        const avatarData = (await this._room.modelManager.getAvatarModelList()).find(data => data.id === avatarId)
          , startTime = Date.now();
        if (!avatarData) {
            this._room.emit("avatarChanged", { avatars: this._room.avatars })
            this.avatars.delete(userId)
            return Promise.reject(`no such avatar model with id: ${avatarId}`);
        }

        try {
            let b = await avatarComponentsModify(avatarData, avatarComponents);
            b = b.filter(A=>A.type != "pendant");
            
            const assets = await avatarComponentsParser(avatarData, b)
              , xAvatar = await this.xAvatarManager.loadAvatar({
                id: userId,
                avatarType: avatarId,
                priority,
                avatarManager: this.xAvatarManager,
                assets,
                status: {
                    avatarPosition,
                    avatarRotation,
                    avatarScale
                }
            })._timeout(8e3, new TimeoutError("loadAvatar timeout(8s)"));
            xAvatar.setPickBoxScale(userId === this._room.userId ? 0 : 1);

            avatar.xAvatar = xAvatar
            avatar.setScale(avatarScale)
            avatar.extraInfo = extraInfo
            avatar.priority = priority
            avatar.isLoading = !1
            avatar.prioritySync = !!prioritySync
            avatar._playAnimation("Idle", !0, !0)
            avatar.avatarLoadedHook()
            this._room.emit("avatarChanged", { avatars: this._room.avatars })
            nickname && avatar._setNickname(nickname)

            userId === this._room.userId && (
                logger.infoAndReportMeasurement({
                    type: "avatarLoadDuration",
                    group: "costs"
                }),
                logger.infoAndReportMeasurement({
                    type: "avatarLoadAt",
                    group: "costs"
                })
            )
            
            return avatar
        } catch (e) {
            return avatar.isLoading = !1,
            this._room.emit("avatarChanged", { avatars: this._room.avatars }),
            logger.error(e),
            Promise.reject(e)
        }
    }

    removeAvatar(userId, t=!1) {
        const avatar = this.avatars.get(userId);
        if (!!avatar) {
            if (avatar.removeWhenDisconnected || t) {
                avatar.xAvatar && this.xAvatarManager.deleteAvatar(avatar.xAvatar),
                this.avatars.delete(userId),
                this._room.emit("avatarChanged", {
                    avatars: this._room.avatars
                });
                return
            }
            avatar.setConnectionStatus(!0)
        }
    }

    clearOtherUsers() {
        this.avatars.forEach(e=>{
            !e.isSelf && e.group === AvatarGroup.User && this.removeAvatar(e.userId)
        }
        )
    }

    async _updateAvatarMovingStatus(e) {
        const {id: t, isMoving: r, isRotating: n} = e
          , o = this.avatars.get(t);
        if (!!o) {
            if (o.isRotating !== n) {
                o.isRotating = n;
                let a = "Idle";
                n && (a = "Walking",
                o.motionType === MotionType.Run && (a = "Running")),
                o._playAnimation(a, !0, !0),
                logger.infoAndReportMeasurement({
                    value: 0,
                    type: n ? "userAvatarStartRotating" : "userAvatarStopRotating",
                    extraData: {
                        motionType: o.motionType,
                        moveToExtra: this._room.moveToExtra
                    }
                })
            }
            if (o.isMoving !== r) {
                // 根据isMoving，判断是walk还是run
                if(r == 1) o.motionType = MotionType.Walk
                if(r == 2) o.motionType = MotionType.Run

                o.isMoving = r;
                let a = "Idle";
                r && (a = "Walking",
                o.motionType === MotionType.Run && (a = "Running")),
                r ? (o.avatarStartMovingHook(),
                o.emit("startMoving", {
                    target: o,
                    extra: this._room.moveToExtra
                })) : (o.avatarStopMovingHook(),
                o.emit("stopMoving", {
                    target: o,
                    extra: this._room.moveToExtra
                })),
                o._playAnimation(a, !0, !0),
                logger.infoAndReportMeasurement({
                    value: 0,
                    type: r ? "userAvatarStartMoving" : "userAvatarStopMoving",
                    extraData: {
                        motionType: o.motionType,
                        moveToExtra: this._room.moveToExtra
                    }
                })
            }
        }
    }
    _usersStatistics() {
        this.on("userAvatarLoaded", ()=>{
            window.setInterval(()=>{
                const e = this._room.avatars.filter(r=>r.group === AvatarGroup.User).length || 0
                  , t = this._room.avatars.filter(r=>r.group === AvatarGroup.User && r.isRender).length || 0;
                this._room.stats.assign({
                    userNum: e,
                    syncUserNum: this.syncAvatarsLength,
                    renderedUserNum: t
                })
            }
            , 3e3)
        }
        )
    }
};

E(XverseAvatarManager, "subAvatar", XverseAvatar);