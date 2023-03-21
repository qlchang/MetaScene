//const log$E = new Logger$1("Avatar")

import BillboardStatus from "./enum/BillboardStatus.js"
import {avatarLoader} from "./XAvatarLoader.js"
import XAnimationController from "./XAnimationController.js"
import XAvatarComopnent from "./XAvatarComopnent.js"
import XStateMachine from "./XStateMachine.js"
import XAvatarBillboardComponent from "./XAvatarBillboardComponent.js"

const castRayOffsetY = .01;
const castRayTeleportationOffset = 10;

export default class XAvatar {
    constructor({id, avatarType, priority, avatarManager, assets, status}) {
        this.isRender = !1,
        this.distLevel = 0,
        this.isInLoadingList = !1,
        this.isHide = !1,
        this.isSelected = !1,
        this.pendingLod = !1,
        this._previousReceivedPosition = new BABYLON.Vector3(0,1e4,0),
        this.distToCam = 1e11,
        this.enableNickname = !0,
        this.distance = 1e11,
        this.isCulling = !1,
        this.reslevel = 0,
        this.isInLoadingQueue = !1,
        this._transparent = 0,


        this.id = id,
        this._avatarManager = avatarManager,
        this._scene = this.avatarManager.scene,
        this.clothesList = assets,
        this._avatarType = avatarType,
        this.priority = priority || 0,
        
        this.controller = new XAnimationController(this),
        this.component = new XAvatarComopnent,
        this.stateMachine = new XStateMachine(this._scene),
        this.bbComponent = new XAvatarBillboardComponent(this._scene),
        this.rootNode = new BABYLON.TransformNode(id, this._avatarManager.scene),

        this._avatarScale = status.avatarScale == null ? 1 : status.avatarScale,
        this._avatarRotation = status.avatarRotation == null ? { pitch: 0, yaw: 0, roll: 0 } : status.avatarRotation,
        this._avatarPosition = status.avatarPosition == null ? { x: 0, y: 0, z: 0 } : status.avatarPosition,
        this._isRayCastEnable = avatarSetting.isRayCastEnable,
        
        this.setPosition(this._avatarPosition, !0),
        this.setRotation(this._avatarRotation),
        this.setScale(this.scale),
        this._isRayCastEnable = avatarSetting.isRayCastEnable,

        this._scene.registerBeforeRender(()=>{
            this.tick()
        })
    }

    hide = ()=>{
        this.isHide = !0
        this._hide()
        return !this.isRender
    }

    _show = ()=>{
        this.isHide || (
            this.setIsPickable(!0),
            this.bbComponent._attachmentObservers.forEach((b,k)=>{
                k.setEnabled(!0)
            }),
            this.priority == 0 && (
                this.rootNode.setEnabled(!0),
                this.isRender = !0,
                this.avatarManager._updateBillboardStatus(this, BillboardStatus.SHOW),
                this.component.accessories.forEach(b=>{
                    b.rootComponent.setEnabled(!0)
                }),
                this.controller == null || this.controller.playAnimation(this.controller.onPlay, this.controller.loop)
            ),
            this.component.accessories.forEach(b=>{
                b.rootComponent.setEnabled(!0)
            })
        )
    }

    show = ()=>{
        this.isHide = !1
        this._show()
        return !!this.isRender
    }

    setAnimations = _=>{
        this.controller.animations = _
    }
    
    attachToAvatar = ( _, b=!1, k={x:0,y:0,z:0}, j=!1, $, _e ) => {
        this.bbComponent.attachToAvatar(this, _, b, k, j, _e)
    }

    detachFromAvatar = ( _, b=!1 )=>{
        this.bbComponent.detachFromAvatar(this, _, b)
    }
    getBbox = (_={})=>{
        this.bbComponent.getBbox(this, _)
    }

    tick() {
        this.cullingTick()
    }

    cullingTick() {
        this.isCulling && (this.rootNode == null || this.rootNode.getChildMeshes().forEach(i=>{
            this.distToCam < 50 ? i.visibility = 0 : i.visibility = this._transparent
        }))
    }

    setTransParentThresh(e) {
        this._transparent = e
    }

    get isNameVisible() {
        return this.bbComponent.isNameVisible
    }

    get isBubbleVisible() {
        return this.bbComponent.isBubbleVisible
    }

    get isGiftButtonsVisible() {
        return this.bbComponent.isGiftButtonsVisible
    }

    get words() {
        return this.bbComponent.words
    }

    get nickName() {
        return this.bbComponent.nickName
    }

    get giftButtons() {
        return this.bbComponent.giftButtons
    }

    get bubble() {
        return this.bbComponent.bubble
    }

    get nameBoard() {
        return this.bbComponent.nameBoard
    }

    get avatarManager() {
        return this._avatarManager
    }

    set withinVisibleRange(e) {
        this.bbComponent.withinVisualRange = e
    }

    setNicknameStatus(e) {
        return this.bbComponent.setNicknameStatus(e)
    }

    setBubbleStatus(e) {
        return this.bbComponent.setBubbleStatus(e)
    }

    setButtonsStatus(e) {
        return this.bbComponent.setBubbleStatus(e)
    }

    setGiftButtonsVisible(e) {
        return this.bbComponent.setGiftButtonsVisible(e)
    }

    get avatarType() {
        return this._avatarType
    }

    attachBody(e) {
        return this.component.addBodyComp(this, e)
    }

    attachDecoration(e) {
        return this.component.addClothesComp(this, e)
    }
    
    detachDecoration(e) {
        return this.component.clearClothesComp(e)
    }

    detachDecorationAll() {
        return this.component.clearAllClothesComps()
    }

    get skeleton() {
        return this.component.skeleton
    }

    get position() {
        return this._avatarPosition
    }

    get rotation() {
        return this._avatarRotation
    }

    get scale() {
        return this._avatarScale
    }

    _hide_culling() {
        this.bbComponent.updateBillboardStatus(this, BillboardStatus.HIDE),
        this.isCulling = !0
    }

    _show_culling() {
        this.isCulling && (this.rootNode && this.rootNode.getChildMeshes().forEach(e=>{
            e.visibility = 1
        }),
        this.bbComponent.updateBillboardStatus(this, BillboardStatus.SHOW),
        this.isCulling = !1)
    }

    _hide() {
        !this.isHide || (this.setIsPickable(!1),
        this.bbComponent._attachmentObservers.forEach((e,i)=>{
            i.setEnabled(!1)
        }
        ),
        this.priority == 0 ? (this.rootNode.setEnabled(!1),
        this.isRender = !1,
        this.bbComponent.updateBillboardStatus(this, BillboardStatus.HIDE),
        this.component.accessories.forEach(e=>{
            e.rootComponent.setEnabled(!1)
        }
        )) : this.isRender && (this.avatarManager.currentLODUsers[this.distLevel]--,
        this.removeAvatarFromScene()),
        this.component.accessories.forEach(e=>{
            e.rootComponent.setEnabled(!1)
        }))
    }

    rotate(e, i, o) {
        return this.stateMachine.roll(this, e, i, o)
    }

    set isRayCastEnable(e) {
        this._isRayCastEnable = e
    }

    get isRayCastEnable() {
        return this._isRayCastEnable
    }

    getAvatarId() {
        return this.id
    }

    getAvaliableAnimations() {
        const e = avatarLoader.avaliableAnimation.get(this.avatarType);
        return e || []
    }

    // todo i用于控制是否接触地面。目前设默认为true，实时检测模型地面高度
    setPosition(e, i=!0) {
        this._avatarPosition = e;
        if (this.rootNode) {
            const o = ue4Position2Xverse(this._avatarPosition);
            let s = !1;
            if(this.avatarManager.getMainAvatar() ){
                if(this.id == this.avatarManager.getMainAvatar().id){
                    Math.abs(o.y - this._previousReceivedPosition.y) > castRayOffsetY && (s = !0);
                    o.subtract(this._previousReceivedPosition).length() > castRayTeleportationOffset && (s = !0)
                }
            }
            if(this._isRayCastEnable) 
                if(s || i) {
                    // 检测模型地面高度
                    this._castRay(e).then(c=>{
                        this.rootNode.position = o;
                        this.rootNode.position.y -= c;
                    }
                    ).catch(c=>{
                        Promise.reject(c)
                    }) 
                } else {
                    // 保持人物高度不变
                    this.rootNode.position.x = o.x
                    this.rootNode.position.z = o.z
                }
            else this.rootNode.position = o
            this._previousReceivedPosition = o.clone()
        }
        return Promise.resolve(e)
    }

    setRotation(e) {
        if (this._avatarRotation = e,
        this.rootNode) {
            const i = {
                pitch: e.pitch,
                yaw: e.yaw + 180,
                roll: e.roll
            }
              , o = ue4Rotation2Xverse(i);
            this.rootNode.rotation = o
        }
    }

    setAvatarVisible(e) {
        this.rootNode && (this.rootNode.setEnabled(e),
        this.rootNode.getChildMeshes().forEach(i=>{
            i.setEnabled(e)
        }
        ))
    }

    setScale(e) {
        this._avatarScale = e,
        this.rootNode && (this.rootNode.scaling = new BABYLON.Vector3(e,e,e)),
        this.bbComponent.bbox && this.getBbox()
    }

    _removeAvatarFromScene() {
        var e, i;
        this.isRender = !1,
        (e = this.controller) == null || e.detachAnimation(),
        this.component.dispose(this),
        (i = this.avatarManager.sceneManager) == null || i.lightComponent.removeShadow(this),
        this.component.accessories.forEach(o=>{
            o.rootComponent.setEnabled(!1)
        })
    }

    removeAvatarFromScene() {
        this._removeAvatarFromScene(),
        this._disposeBillBoard()
    }

    _disposeBillBoard() {
        this.bbComponent.disposeBillBoard(this)
    }

    addComponent(e, i, o, s) {
        return i === "pendant" ? this.component.attachPendant(this, e) : this.component.changeClothesComp(this, e, i, o, s)
    }

    removeComponent(e, i) {
        if (e === "pendant")
            i ? this.component.detachPendant(i) : this.component.accessories.forEach((o,s)=>{
                this.component.detachPendant(s)
            }
            );
        else {
            const o = this.component.resourceIdList.find(s=>s.type == e);
            o && (this.detachDecoration(o),
            this.clothesList = this.clothesList.filter(s=>s.type != e))
        }
    }

    getComponentByType(e, i) {
        if (e === "pendant")
            if (i) {
                const o = this.component.accessories.get(i);
                return o || []
            } else
                return Array.from(this.component.accessories).map(o=>o[1]);
        else
            return this.component.resourceIdList.find(o=>o.type == e)
    }

    _castRay(e) {
        return new Promise((i,o)=>{
            var et;
            const s = ue4Position2Xverse(e)
              , c = new BABYLON.Vector3(0,-1,0)
              , d = 1.5 * this.scale
              , _ = 100 * d
              , b = d
              , k = new BABYLON.Vector3(s.x,s.y + b,+s.z)
              , j = new BABYLON.Ray(k,c,_)
              , $ = (et = this.avatarManager.sceneManager) == null ? void 0 : et.getGround(e);
              
            if (!$ || $.length <= 0)
            //角色  id= ${this.id}  找不到地面，当前高度为下发高度
                //return console.warn(`\u89D2\u8272 id= ${this.id} \u627E\u4E0D\u5230\u5730\u9762\uFF0C\u5F53\u524D\u9AD8\u5EA6\u4E3A\u4E0B\u53D1\u9AD8\u5EA6`),
                //i(0);
                return i(0);
            let _e = j.intersectsMeshes($);
            if (_e.length > 0)
                return i(_e[0].distance - b);
            if (c.y = 1,
            _e = j.intersectsMeshes($),
            _e.length > 0)
                return i(-(_e[0].distance - b))
        })
    }

    setPickBoxScale(e) {
        return this.bbComponent.setPickBoxScale(e)
    }

    setIsPickable(e) {
        return this.bbComponent.setIsPickable(this, e)
    }

    createPickBoundingbox(e) {
        return this.bbComponent.createPickBoundingbox(this, e)
    }

    scaleBbox(e) {
        this.bbComponent.bbox && this.bbComponent.bbox.scale(e)
    }

    rotateTo(e, i, o) {
        return this.stateMachine.rotateTo(this, e, i, o)
    }

    faceTo(e, i) {
        return this.stateMachine.lookAt(this, e, i)
    }

    removeObserver() {
        this.stateMachine.disposeObsever()
    }

    moveHermite(e, i, o, s, c, d) {
        return this.stateMachine.moveToHermite(this, e, i, o, s, c, d)
    }

    moveCardinal(e, i, o, s, c, d, _=!1) {
        return this.stateMachine.moveToCardinal(this, e, i, o, s, c, d, _)
    }

    move(e, i, o, s, c, d=!1) {
        return this.stateMachine.moveTo(this, e, i, o, s, c, d)
    }

    initNameboard(e=1) {
        return this.bbComponent.initNameboard(this, e)
    }

    initBubble(e=1) {
        return this.bbComponent.initBubble(this, e)
    }

    say(e, {
        id, isUser, background, 
        font="Arial", fontsize=38, fontcolor="#ffffff", fontstyle="bold", linesize=22, linelimit, 
        offsets={x: 0, y: 0, z: 40}, scale=this._avatarScale, compensationZ=11.2, reregistAnyway=!0
    }) {
        return this.bbComponent.say(this, e, {
            id, isUser, background, 
            font, fontsize, fontcolor, fontstyle, linesize, linelimit,
            offsets, scale, compensationZ, reregistAnyway
        })
    }
    
    silent() {
        return this.bbComponent.silent()
    }
    
    setNickName(e, {
        id, isUser, background, 
        font="Arial", fontsize=40, fontcolor="#ffffff", fontstyle="bold", linesize=22, linelimit, 
        offsets={x: 0, y: 0, z: 15}, scale=this._avatarScale, compensationZ=0, reregistAnyway=!1
    }) {
        return this.bbComponent.setNickName(this, e, {
            id, isUser, background,
            font, fontsize, fontcolor, fontstyle, linesize, linelimit,
            offsets, scale, compensationZ, reregistAnyway
        })
    }

    generateButtons(e=null, i=this._avatarScale, o=85) {
        return this.bbComponent.generateButtons(this, e, i, o)
    }

    clearButtons() {
        return this.bbComponent.clearButtons()
    }

    attachExtraProp(e, i, o, s) {
        return this.component.addDecoComp(this, e, i, o, s)
    }
    
    showExtra(e) {
        return this.component.showExtra(e)
    }

    hideExtra(e) {
        return this.component.hideExtra(e)
    }

    disposeExtra() {
        return this.component.disposeExtra()
    }

    getSkeletonPositionByName(e) {
        var i;
        if (this.skeleton) {
            const o = this.skeleton.bones.find(s=>s.name.replace("Clone of ", "") == e);
            if (o && o.getTransformNode() && ((i = o.getTransformNode()) == null ? void 0 : i.position)) {
                const s = o.getTransformNode().position;
                return xversePosition2Ue4({
                    x: s.x,
                    y: s.y,
                    z: s.z
                })
            }
        }
    }

    shootTo(e, i, o=2, s=10, c={
        x: 0,
        y: 0,
        z: 150
    }) {
        return this.stateMachine.sendObjectTo(this, e, i, o, s, c)
    }
}