import Actions from "./enum/Actions.js"
import {eventsManager} from "./EventsManager.js"
import util from "./util.js"
import Person from "./enum/Person.js"
import ClickType from "./enum/ClickType.js"
import Logger from "./Logger.js"
import MessageHandleType from "./enum/MessageHandleType.js"
import FrequencyLimitError from "./error/FrequencyLimitError.js"
import ParamError from "./error/ParamError.js"

const logger = new Logger('Action')
const QueueActions = [Actions.Transfer, Actions.ChangeSkin, Actions.GetOnVehicle, Actions.GetOffVehicle];

export default class ActionsHandler {
    constructor(room) {
        this.currentActiveAction = null
        this.room = room
    }

    // 在_handleAvatar时调用
    async avatarComponentsSync(avatarComponents) {
        this.sendData({
            data: {
                action_type: Actions.SetPlayerState,
                set_player_state_action: {
                    player_state: {
                        avatar_components: JSON.stringify(avatarComponents)
                    }
                }
            }
        })
    }

    async sendData(actionData) 
    {
        // console.error("[Action]", Actions[actionData.data.action_type])

        //console.log('发送数据：'+JSON.stringify(actionData))

        await this.beforeSend(actionData);
        const traceId = util.uuid();
        // 向后端发送action_type信息，获取signal和stream
        this.room.networkController.sendRtcData(le(oe({}, actionData.data), {
            trace_id: traceId,
            user_id: this.room.options.userId
        }));

        if (actionData.track === !1) {
            return Promise.resolve(null);
        }
        
        const { sampleRate=1, timeout=2e3, tag, data, special } = actionData;
        return eventsManager.track({
            timeout,
            traceId,
            event: data.action_type,
            tag,
            extra: data
        }, {
            special,
            sampleRate,
            noReport: this.room.viewMode === "serverless" || this.room.options.viewMode === "serverless"
        }).finally(()=>{
            QueueActions.includes(actionData.data.action_type) && (this.currentActiveAction = void 0)
        })
    }

    async beforeSend(e) 
    {
        var o;
        const t = (o = this.room._userAvatar) == null ? void 0 : o.isMoving
          , r = e.data.action_type;
        if (QueueActions.includes(r)) {
            if (this.currentActiveAction)
                return logger.error(`${Actions[this.currentActiveAction]} still pending, reject ${Actions[r]}`),
                Promise.reject(new FrequencyLimitError(`${Actions[r]} action request frequency limit`));
            this.currentActiveAction = r
        }
        if (t && QueueActions.includes(e.data.action_type))
            try {
                await this.stopMoving()
            } catch (a) {
                this.currentActiveAction = void 0,
                logger.error("before action stopMoving failed", a)
            }
    }

    // 点击行走至某一点时执行
    async moveTo({point, extra="", motionType}) 
    {
        return this.sendData({
            data: {
                action_type: Actions.Clicking,
                clicking_action: {
                    clicking_point: point,
                    clicking_type: ClickType.IgnoreView,
                    extra: encodeURIComponent(extra),
                    attitude: motionType
                },
                clicking_state: this.room._currentClickingState
            }
        })
    }

    transfer({renderType, player, camera, areaName, attitude, pathName, person:personType, noMedia, timeout, tag, special}) 
    {
        return this.sendData({
            data: {
                action_type: Actions.Transfer,
                transfer_action: {
                    render_type: renderType,
                    player,
                    camera,
                    areaName,
                    attitude,
                    pathName,
                    person: {
                        type: personType
                    },
                    noMedia,
                    tiles: [0, 1, 2, 4]
                }
            },
            special,
            timeout: timeout || 4e3,
            tag
        }).then(_ => (
            typeof personType != "undefined" && this.room.updateCurrentNetworkOptions({
                person: personType,
                rotationRenderType: renderType
            }),
            _
        ))
    }

    // 用于Panorama.exit()
    changeRotationRenderType({renderType, player, camera, areaName, attitude, pathName}) 
    {
        return this.transfer({
            renderType,
            player,
            camera,
            areaName,
            attitude,
            pathName,
            tag: "changeToRotationVideo"
        })
    }

    // 用于请求第一人称视角下的pano数据
    requestPanorama({camera, player, areaName, attitude, pathName, tag}, noMedia, timeout) 
    {
        return this.transfer({
            renderType: RenderType.ClientRotationPano,
            player,
            camera,
            person: Person.First,
            areaName,
            attitude,
            pathName,
            noMedia: noMedia,
            timeout: timeout,
            tag: tag || "requestPanorama",
            special: !noMedia
        })
    }

    // 用于XverseAvatar.setMotionType()。方法未执行
    setMotionType(type) 
    {
        return this.transfer({
            attitude: type,
            tag: "setMotionType"
        })
    }

    // 设置角色昵称。用于XverseAvatar.setNickname()
    setNickName(nickname) 
    {
        return this.sendData({
            data: {
                action_type: Actions.ChangeNickname,
                change_nickname_action: {
                    nickname
                }
            }
        })
    }

    // 方法未执行
    getReserveSeat({routeId, name}) 
    {
        return this.sendData({
            data: {
                action_type: Actions.ReserveSeat,
                reserve_seat_action: {
                    route_id: routeId,
                    name
                }
            }
        })
    }

    // 方法未执行
    getReserveStatus({routeId, name, need_detail}) 
    {
        return this.sendData({
            data: {
                action_type: Actions.GetReserveStatus,
                get_reserve_status_action: {
                    route_id: routeId,
                    name,
                    need_detail
                }
            },
            timeout: 2e3
        }).then(o=>o.reserveDetail)
    }

    // 停止移动。在playAnimation时调用
    stopMoving() 
    {
        return this.sendData({
            data: {
                action_type: Actions.StopMoving,
                stop_move_action: {}
            }
        })
    }

    // 方法未执行
    getOnVehicle({routeId, name, camera}) 
    {
        return this.sendData({
            data: {
                action_type: Actions.GetOnVehicle,
                get_on_vehicle_action: {
                    route_id: routeId,
                    name,
                    camera
                }
            }
        })
    }

    // 方法未执行
    getOffVehicle({renderType, player, camera}) 
    {
        return this.sendData({
            data: {
                action_type: Actions.GetOffVehicle,
                get_off_vehicle_action: {
                    render_type: renderType,
                    player,
                    camera
                }
            }
        })
    }

    // 在_handleAvatar时调用
    confirmEvent(id) 
    {
        return this.sendData({
            data: {
                action_type: Actions.ConfirmEvent,
                confirm_event_action: {
                    id
                }
            },
            track: !1
        })
    }

    // 心跳
    echo(echoMsg) 
    {
        return this.sendData({
            data: {
                action_type: Actions.Echo,
                echo_msg: {
                    echoMsg
                }
            },
            track: !1
        })
    }

    // 方法未执行
    async changeSkin(skinData) 
    {
        const { skinId, mode, landingType=LandingType.Stay, landingPoint, landingCamera, renderType, areaName, attitude, pathName, person, noMedia, timeout, 
            roomTypeId="", special } = skinData

        const newSkin = this.room.skinList.filter(skin => skin.id === skinId)[0];
        if (!newSkin) {
            const y = `skin ${skinId} is invalid`;
            return logger.error(y),
            Promise.reject(new ParamError(y))
        }

        return this.sendData({
            data: {
                action_type: Actions.ChangeSkin,
                change_skin_action: {
                    skinID: skinId,
                    mode: mode === ChangeMode.Preview ? ChangeMode.Preview : ChangeMode.Confirm,
                    skin_data_version: skinId + newSkin.versionId,
                    landing_type: landingType,
                    landing_point: landingPoint,
                    landing_camera: landingCamera,
                    render_wrapper: {
                        render_type: renderType
                    },
                    areaName,
                    attitude,
                    noMedia,
                    person,
                    pathName,
                    roomTypeId
                }
            },
            timeout: timeout || 6e3,
            special: special === void 0 ? renderType === RenderType.ClientRotationPano : special
        })
        .then(async y=>{
            if (renderType === RenderType.ClientRotationPano && y) {
                const route = await this.room.modelManager.findRoute(skinId, pathName)
                  , {camera} = util.getRandomItem(route.birthPointList) || {};
                await this.room.panorama.handleReceivePanorama(y, camera)
            }
            return this.handleChangeSkin(skinData)
        })
        .catch(e => noMedia ? this.handleChangeSkin(skinData) : Promise.reject(e))
    }

    handleChangeSkin({skinId, mode, renderType, areaName, attitude, pathName}) 
    {
        return this.room.sceneManager.staticmeshComponent.getCgMesh().show(),
        this.room.sceneManager.cameraComponent.switchToCgCamera(),
        this.room.engineProxy._updateSkinAssets(skinId).then(()=>{
            this.room.sceneManager.staticmeshComponent.getCgMesh().hide(),
            this.room.sceneManager.cameraComponent.switchToMainCamera(),
            this.room.pathManager.currentArea = areaName,
            logger.info("changeSkin _updateSkinAssets susccss"),
            this.room.updateCurrentNetworkOptions({ pathName, attitude, areaName }),
            this.room.skinChangedHook(),
            this.room.emit("skinChanged", { skin: { id: skinId }, mode }),
            renderType === RenderType.ClientRotationPano && this.room.sceneManager.cameraComponent.allowMainCameraController()
        })
    }

    // 相机旋转
    rotate({pitch, yaw}) 
    {
        if (
            this.room.disableRotate || 
            this.room.isPano || 
            (this.room._userAvatar && this.room._userAvatar._isChangingComponentsMode)
        ) return;
        
        this.sendData({
            data: {
                action_type: Actions.Rotation,
                rotation_action: {
                    vertical_move: pitch,
                    horizontal_move: -yaw
                },
                sampleRate: .02
            },
            sampleRate: .02
        })
    }

    // 用于XverseAvatar.turnTo()。方法未执行
    turnTo({point, timeout=2e3, offset=8} = {}) 
    {
        return this.sendData({
            data: {
                action_type: Actions.TurnTo,
                turn_to_action: {
                    turn_to_point: point,
                    offset
                }
            },
            timeout
        })
    }

    // 用于XverseAvatar.rotateTo()。方法未执行
    rotateTo({point, offset=0, speed=3} = {}) 
    {
        return this.sendData({
            data: {
                action_type: Actions.RotateTo,
                rotate_to_action: {
                    rotate_to_point: point,
                    offset,
                    speed
                }
            }
        })
    }

    broadcast({data, msgType=MessageHandleType.MHT_FollowListMulticast, targetUserIds}) 
    {
        if (msgType === MessageHandleType.MHT_CustomTargetSync && !Array.isArray(targetUserIds))
            return Promise.reject(new ParamError(`param targetUserIds is required  when msgType is ${MessageHandleType[msgType]}`));

        let sendData = {
            action_type: Actions.Broadcast,
            broadcast_action: {
                data: JSON.stringify(data),
                user_id: this.room.options.userId,
                msgType
            }
        }
        if (msgType === MessageHandleType.MHT_CustomTargetSync && Array.isArray(targetUserIds)) {
            sendData.broadcast_action.target_user_ids = targetUserIds
        }

        return this.room.actionsHandler.sendData({
            data: sendData,
            tag: data.broadcastType
        })
    }

    // 显示呼吸点。用于Debug.getPointsAndRender()
    getNeighborPoints({point, containSelf=!1, searchRange=500}) 
    {
        return this.sendData({
            data: {
                action_type: Actions.GetNeighborPoints,
                get_neighbor_points_action: {
                    point,
                    level: 1,
                    containSelf,
                    searchRange
                }
            }
        }).then(a=>a.nps)
    }

    // 方法未执行
    playCG(cgName) 
    {
        return this.sendData({
            data: {
                action_type: Actions.PlayCG,
                play_cg_action: {
                    cg_name: cgName
                }
            }
        })
    }

    // 方法未执行
    audienceToVisitor({avatarId, avatarComponents, player, camera}) 
    {
        return logger.debug("send data: audience to visitor"),
        this.sendData({
            data: {
                action_type: Actions.AudienceChangeToVisitor,
                audienceChangeToVisitorAction: {
                    avatarID: avatarId,
                    avatarComponents,
                    player,
                    camera
                }
            }
        })
    }

    // 方法未执行
    visitorToAudience({renderType, player, camera, areaName, attitude, pathName, person:personType, noMedia}) 
    {
        return logger.debug("send data: visitor to audience"),
        this.sendData({
            data: {
                action_type: Actions.VisitorChangeToAudience,
                visitorChangeToAudienceAction: {
                    transferAction: {
                        render_type: renderType,
                        player,
                        camera,
                        areaName,
                        attitude,
                        pathName,
                        person: {
                            type: personType
                        },
                        noMedia,
                        tiles: [0, 1, 2, 4]
                    }
                }
            }
        })
    }

    // 方法未执行
    removeVisitor({removeType, userIDList, extraInfo=""}) 
    {
        return logger.debug("send data: remove visitor"),
        this.sendData({
            data: {
                action_type: Actions.RemoveVisitor,
                removeVisitorAction: {
                    removeVisitorEvent: removeType,
                    userIDList,
                    extraInfo: encodeURIComponent(extraInfo)
                }
            }
        })
    }

    // 方法未执行
    getUserWithAvatar(userType, roomID) 
    {
        return logger.debug("send data: get user with avatar"),
        this.sendData({
            data: {
                action_type: Actions.GetUserWithAvatar,
                getUserWithAvatarAction: {
                    userType,
                    roomID
                }
            }
        }).then(n=>n.userWithAvatarList)
    }

    // 每2秒获取一次新数据。在Xverse_Room.afterJoinRoom()中调用
    getNewUserState(userType) 
    {
        return this.sendData({
            data: {
                action_type: Actions.GetNewUserState,
                getNewUserStateAction: {
                    userType
                }
            },
            sampleRate: 0
        }).then(o => o)
    }

    // 方法未执行
    setSyncPolicy({syncPolicy}) 
    {
        return this.sendData({
            data: {
                action_type: Actions.SetSyncPolicy,
                setSyncPolicyAction: {
                    syncPolicy
                }
            }
        })
    }

    // 拖动手柄
    joystick({degree, level=1}) 
    {
        const uuid = util.uuid();
        let angle = -degree + 90 + 360;
        angle >= 360 && (angle -= 360);

        return this.sendData({
            data: {
                action_type: Actions.Joystick,
                dir_action: {
                    move_angle: angle,
                    speed_level: level
                },
                trace_id: uuid,
                user_id: this.room.options.userId,
                packet_id: uuid
            },
            track: !1
        })
    }
}