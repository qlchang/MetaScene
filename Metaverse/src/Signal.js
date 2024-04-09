import Codes from "./enum/Codes.js"
import {eventsManager} from "./EventsManager.js"
import ECurrentShaderMode from "./enum/ECurrentShaderMode.js"
import Actions from "./enum/Actions.js"
import PointType from "./enum/PointType.js"
import Logger from "./Logger.js"
import SecondArray from "./SecondArray.js"

const logger = new Logger('signal')
export default class Signal {
    constructor(e) {
        this.signalHandleActived = !0
        this.isUpdatedYUV = !0
        this._room = e
        this.handleSignalSecondArray = new SecondArray
        this.handleSignalPartialArray2 = new SecondArray
        this.handleSignalPartialArray3 = new SecondArray
        this.handleSignalPartialArray4 = new SecondArray
        this.handleSignalPartialArray5 = new SecondArray
        this.handleSignalPartialArray6 = new SecondArray
        this.handleSignalPartialArray7 = new SecondArray
    }
    getSignalStat() {
        const e = this.handleSignalSecondArray.getStat(),
            i = this.handleSignalPartialArray2.getStat().max,
            o = this.handleSignalPartialArray3.getStat().max,
            s = this.handleSignalPartialArray4.getStat().max,
            c = this.handleSignalPartialArray5.getStat().max,
            d = this.handleSignalPartialArray6.getStat().max,
            _ = this.handleSignalPartialArray7.getStat().max,
            b = http.secondArray.getStat();
        return {
            sdkAvg: e.avg,
            sdkMax: e.max,
            blobSum: b.sum,
            blobMax: b.max,
            partialMax: [i, o, s, c, d, _]
        }
    }
    
    handleSignal(data, reject) {
        if (!this.signalHandleActived) return;

        //console.log('metadata:'+JSON.stringify(data));

        const time1 = Date.now()
        const { signal, alreadyUpdateYUV } = data;
        this.handleActionResponses(signal), this._room.handleSignalHook(signal);

        const time2 = Date.now();
        this.handleSignalPartialArray2.add(time2 - time1);
        if (!alreadyUpdateYUV) 
        {
            // 断流时，人物停止移动
            const mainUserState = signal.newUserStates && signal.newUserStates.find(state => state.userId === this._room.userId);
            if ((mainUserState && mainUserState.renderInfo) && (this._room._userAvatar && this._room._userAvatar.isMoving)) 
            {
                logger.debug("stream stoped, make avatar to stop");
                const { isMoving, isRotating } = mainUserState.renderInfo;
                this._room.avatarManager._updateAvatarMovingStatus({
                    id: mainUserState.userId,
                    isMoving: isMoving,
                    isRotating: !!isRotating
                })
            }
            return
        }

        // 数据过滤
        this.isUpdatedYUV = alreadyUpdateYUV;
        if (!signal) {
            logger.warn("metadata signal is empty");
            return
        }
        if (signal.actionType === Actions.GetNewUserState) {
            eventsManager.remove(signal.traceId, signal.code, signal);
            return
        }
        if (signal.code === Codes.RepeatLogin) {
            this._room.handleRepetLogin();
            return
        }
        if (
            signal.code !== void 0 && 
            signal.code !== Codes.Success && 
            signal.code !== Codes.ActionMaybeDelay && 
            signal.code !== Codes.DoActionBlocked && 
            signal.code !== Codes.GetOnVehicle
        ) {
            if (signal.code === Codes.UnReachable) {
                logger.debug("signal errcode: ", signal.code);
                this._room.proxyEvents("unreachable");
            } else {
                if (!this._room.joined) {
                    const CodeError = getErrorByCode(signal.code),
                        error = new CodeError(signal.msg);
                    reject(error)
                }
                logger.error("signal errcode: ", signal);
                this._room.emit("error", signal);
            } 
        }
        
        const time3 = Date.now();
        this.handleSignalPartialArray3.add(time3 - time2);
        const mainUserState = signal.newUserStates && signal.newUserStates.find(state => state.userId === this._room.userId);
        // Broadcast相关 暂时用不到
        if (signal.broadcastAction) try {
            const nt = JSON.parse(signal.broadcastAction.data);
            Broadcast.handlers.forEach(ot => ot(nt))
        } catch (nt) {
            logger.error(nt)
        }

        const time4 = Date.now();
        this.handleSignalPartialArray4.add(time4 - time3);
        // 更新人物数据
        signal.newUserStates && signal.newUserStates.length > 0 && this._room.avatarManager.handleAvatar(signal);

        const time5 = Date.now();
        this.handleSignalPartialArray5.add(time5 - time4);
        if (mainUserState != null && mainUserState.playerState) {
            this._room._currentClickingState = mainUserState.playerState;
            const { pathName, attitude, areaName, skinId } = mainUserState.playerState;
            if (
                pathName && (this._room.pathManager.currentPathName = pathName, this._room.updateCurrentState({ pathName })), 
                areaName && this._room.updateCurrentState({ areaName }), 
                attitude
            ) {
                const route = this._room.skin.routeList.find(lt => lt.areaName === this._room.currentState.areaName),
                    speed = ((route == null ? void 0 : route.step) || 7.5) * 30;
                this._room.updateCurrentState({ speed, attitude }), 
                this._room.pathManager.currentAttitude = attitude, 
                this._room._userAvatar && (this._room._userAvatar.motionType = attitude)
            }
            // 更新相机数据(只更新position和angle，cameraCenter不使用）
            this._room.sceneManager.getCurrentShaderMode() !== ECurrentShaderMode.pano 
            && !this._room.isPano 
            && mainUserState.playerState.camera 
            && !this._room.panorama.isLoading 
            && this._room.camera.setCameraPose(mainUserState.playerState.camera)
        }
        // 切换相机 main/cg
        mainUserState != null && mainUserState.renderInfo && this._room.camera.handleRenderInfo(mainUserState);

        const time6 = Date.now();
        this.handleSignalPartialArray6.add(time6 - time5);
        if (signal.actionType !== void 0) {
            const { actionType, code, echoMsg, traceId } = signal;
            // 移除暂存的traceId
            actionType === Actions.Echo 
            && code === Codes.Success 
            && this._room.networkController.rtcp.heartbeat.pong(echoMsg, traceId)
            , code !== Codes.Success ? eventsManager.remove(traceId, code) : [
                    Actions.GetReserveStatus, Actions.Broadcast, Actions.ChangeNickname, Actions.ConfirmEvent, 
                    Actions.ReserveSeat, Actions.Rotation, Actions.TurnTo, Actions.RotateTo, Actions.SetPlayerState, 
                    Actions.GetNeighborPoints, Actions.TurnToFace, Actions.AudienceChangeToVisitor, Actions.RemoveVisitor, 
                    Actions.GetUserWithAvatar, Actions.GetNewUserState, Actions.SetSyncPolicy
                ].includes(actionType)
            && eventsManager.remove(traceId, code, signal)
        }

        const time7 = Date.now();
        this.handleSignalSecondArray.add(time7 - time1), 
        this.handleSignalPartialArray7.add(time7 - time6)
    }

    handleActionResponses(e) {
        !(e != null && e.actionResponses) || e.actionResponses.length === 0 || e.actionResponses.forEach(i => {
            if (i.actionType == null) return;
            const {
                pointType: o,
                extra: s,
                actionType: c,
                traceId: d,
                code: _,
                msg: b
            } = i;
            c === Actions.GetNeighborPoints ? eventsManager.remove(d, _, i.nps) : c === Actions.GetUserWithAvatar ? eventsManager.remove(d, _, i.userWithAvatarList) : eventsManager.remove(d, _, b), o === PointType.Path && c === Actions.Clicking && (this._room.moveToExtra = decodeURIComponent(s))
        })
    }
}