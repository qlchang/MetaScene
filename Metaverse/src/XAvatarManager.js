import Pool from "./Pool"
import BillboardStatus from "./enum/BillboardStatus.js"
import {avatarLoader} from "./XAvatarLoader.js"
import XAvatar from "./XAvatar.js"
import Logger from "./Logger.js"
import ExceedMaxAvatarNumError from "./Error/ExceedMaxAvatarNumError"
import DuplicateAvatarIDError from "./Error/DuplicateAvatarIDError"
import AvatarAssetLoadingError from "./Error/AvatarAssetLoadingError"
import ContainerLoadingFailedError from "./Error/ContainerLoadingFailedError"
import AvatarAnimationError from "./error/AvatarAnimationError"

const logger = new Logger('CharacterManager')
export default class XAvatarManager {
    constructor(sceneManager) {
        this.characterMap = new Map
        this.curAnimList = []
        this.extraComps = new Map
        this._mainUser = null
        this._lodSettings = null
        this.maxBillBoardDist = 0
        this.maxAvatarNum = 0
        this.currentLODUsers = []
        this.bboxMeshPool = null
        this._distLevels = []
        this._maxLODUsers = []
        this._cullingDistance = 0
        this._maxDistRange = null
        this._delayTime = 100
        this._queueLength = -1
        this._queue = []
        this._processList = []
        this._process = null
        this._updateLoopObserver = null
        this._avatarInDistance = []
        this._renderedAvatar = []
        this._enableNickname = !0
        this._tickObserver = null
        this._tickInterval = null
        this._defaultAnims = null
        this._tickDispose = 0
        this._disposeTime = 100
        this.avatarLoader = avatarLoader
        this._scene = sceneManager.mainScene;
        this._sceneManager = sceneManager;
        this.initAvatarMap();
        this._initSettings();
        this._maxDistRange = this._distLevels[this._distLevels.length - 1],
        this.bboxMeshPool = new Pool(this.createBboxAsset,this.resetBboxAsset,0,this.maxAvatarNum,this._sceneManager.Scene,0,0,0),
        this._tickInterval = 250;
        let t = 0;
        this._tickObserver = this._scene.onAfterRenderObservable.add(()=>{
            t += 1,
            t == this._tickInterval && (this.tick(), t = 0)
        })
    }
    tick() {
        this.bboxMeshPool.clean(0)
    }
    createBboxAsset(e, t, r, n) {
        return BABYLON.MeshBuilder.CreateBox("avatarBbox", {
            width: t,
            height: r,
            depth: n
        }, e)
    }
    resetBboxAsset(e) {
        const t = e.data;
        return t.setEnabled(!1),
        t.isPickable = !1,
        e
    }
    _initSettings() {
        this._defaultAnims = avatarSetting.defaultIdle,
        this._lodSettings = avatarSetting.lod,
        this._distLevels = avatarSetting.lod.map(e=>e.dist),
        this._maxLODUsers = avatarSetting.lod.map(e=>e.quota),
        this.currentLODUsers = new Array(this._distLevels.length).fill(0),
        this.maxAvatarNum = avatarSetting.maxAvatarNum,
        this.maxBillBoardDist = avatarSetting.maxBillBoardDist,
        this._cullingDistance = avatarSetting.cullingDistance
    }
    maxRenderNum() {
        let e = 0;
        return this._maxLODUsers.forEach(t=>{
            e += t
        }
        ),
        e
    }
    curRenderNum() {
        let e = 0;
        return this.currentLODUsers.forEach(t=>{
            e += t
        }
        ),
        e
    }
    setLoDLevels(e) {
        this._distLevels = e
    }
    set cullingDistance(e) {
        this._cullingDistance = e
    }
    get cullingDistance() {
        return this._cullingDistance
    }
    getLoDLevels() {
        return this._distLevels
    }
    setLodUserLimits(e, t) {
        this._maxLODUsers.length > e && (this._maxLODUsers[e] = t)
    }
    setLodDist(e, t) {
        this._distLevels[e] = t
    }
    setMaxDistRange(e) {
        this._maxDistRange = e,
        this._distLevels[this._distLevels.length - 1] = e
    }
    get scene() {
        return this._scene
    }
    setMainAvatar(e) {
        var t;
        this._mainUser = (t = this.characterMap.get(0)) == null ? void 0 : t.get(e)
    }
    getMainAvatar() {
        return this._mainUser
    }
    enableAllNickname(e) {
        return this.characterMap.forEach((t,r)=>{
            r != 0 && t.forEach((n,o)=>{
                this._updateBillboardStatus(n, e ? BillboardStatus.SHOW : BillboardStatus.HIDE)
            }
            )
        }
        ),
        this._enableNickname = e
    }
    getAvatarById(e) {
        let t;
        return this.characterMap.forEach((r,n)=>{
            r.get(e) && (t = r.get(e))
        }
        ),
        t
    }
    getAvatarNums() {
        let e = 0;
        return this.characterMap.forEach((t,r)=>{
            e += t.size
        }
        ),
        e
    }
    registerAvatar(e) {
        this.characterMap.get(e.priority).set(e.id, e)
    }
    unregisterAvatar(e) {
        this.characterMap.get(e.priority).delete(e.id)
    }
    initAvatarMap() {
        this.characterMap.set(0, new Map),
        this.characterMap.set(1, new Map),
        this.characterMap.set(2, new Map),
        this.characterMap.set(3, new Map),
        this.characterMap.set(4, new Map),
        this.characterMap.set(5, new Map)
    }
    loadAvatar({id, avatarType, priority, avatarManager, assets, status}) {
        return new Promise((resolve, reject)=>{
            if (this.getAvatarById(id))
                return reject(new DuplicateAvatarIDError(`[Engine] cannot init avatar with the same id = ${e}`));
            if (this.getAvatarNums() > this.maxAvatarNum)
                // 超出角色个数上限 ${this.maxAvatarNum}
                return reject(new ExceedMaxAvatarNumError(`[Engine] \u8D85\u51FA\u6700\u5927\u89D2\u8272\u9650\u5236 ${this.maxAvatarNum}`));

            const avatar = new XAvatar({ id, avatarType, priority, avatarManager, assets, status });
            this.registerAvatar(avatar);

            if (priority == 0)
                this.setMainAvatar(avatar.id),
                this.addAvatarToScene(avatar, 0).then(c=>(
                    logger.debug(`[Engine] avatar ${avatar.id} has been added to scene`),
                    c ? (
                        this._updateBillboardStatus(c, BillboardStatus.SHOW),
                        setTimeout(()=>{ this.launchProcessLoadingLoop() }, this._delayTime),
                        resolve(c)
                    ) : (
                        avatar.removeAvatarFromScene(),
                        reject(new AvatarAssetLoadingError)
                    )
                )).catch(c=>(
                    avatar.removeAvatarFromScene(),
                    reject(new AvatarAssetLoadingError(c))
                ));
            else
                return resolve(avatar)
        })
    }
    deleteAvatar(e) {
        return e.isRender ? (e.removeAvatarFromScene(),
        this.currentLODUsers[e.distLevel]--) : e.bbComponent.disposeBillBoard(e),
        this._processList = this._processList.filter(t=>t.id !== e.id),
        this.unregisterAvatar(e),
        e.rootNode && (e.rootNode.dispose(),
        e.rootNode = void 0),
        e.bbComponent.bbox && e.bbComponent.bbox.dispose(),
        e.removeObserver(),
        e
    }
    _checkLODLevel(e) {
        if (e < this._distLevels[0])
            return 0;
        for (let t = 1; t < this._distLevels.length; ++t)
            if (e >= this._distLevels[t - 1] && e < this._distLevels[t])
                return t;
        return this._distLevels.length - 1
    }
    get sceneManager() {
        return this._sceneManager
    }
    launchProcessLoadingLoop() {
        this._updateAvatarStatus()
    }
    stopProcessLoadingLoop() {
        var e;
        this._updateLoopObserver && ((e = this._scene) == null || e.onBeforeRenderObservable.remove(this._updateLoopObserver))
    }
    _distToMain(e) {
        var n;
        const t = (n = this._mainUser) == null ? void 0 : n.position
          , r = e.position;
        if (r && t) {
            const o = this.sceneManager.cameraComponent.MainCamera.getFrontPosition(1).subtract(this.sceneManager.cameraComponent.MainCamera.position).normalize()
              , a = e.rootNode.position.subtract(this.sceneManager.cameraComponent.MainCamera.position).normalize();
            let s = 1;
            if (o && a) {
                const l = a.multiply(o);
                s = Math.acos(l.x + l.y + l.z) < this.sceneManager.cameraComponent.MainCamera.fov / 2 ? 1 : 1e11
            }
            return calcDistance3D(t, r) * s
        } else
            logger.warn("user position or camera position is not correct!");
            return 1e11
    }
    _distToCamera(e) {
        var n;
        const t = (n = this._sceneManager) == null ? void 0 : n.cameraComponent.getCameraPose().position
          , r = e.position;
        return r && t ? calcDistance3D(t, r) : (logger.warn("user position or camera position is not correct!"),
        1e11)
    }
    showAll(e) {
        this.characterMap.forEach((t,r)=>{
            e && r == 0 && t.forEach((n,o)=>{
                n.show()
            }
            ),
            r != 0 && t.forEach((n,o)=>{
                n.show()
            }
            )
        }
        )
    }
    hideAll(e) {
        this.characterMap.forEach((t,r)=>{
            e && r == 0 && t.forEach((n,o)=>{
                n.hide()
            }
            ),
            r != 0 && t.forEach((n,o)=>{
                n.hide()
            }
            )
        }
        )
    }
    _assemblyAvatar(e, t) {
        var n, o;
        const r = e.get(avatarSetting.body);
        if (r && !t.attachBody(r)) {
            t.isInLoadingList = !1,
            e.clear();
            return
        }
        for (const a of e)
            if (a[0] != avatarSetting.body && a[0] != avatarSetting.animations && !t.attachDecoration(a[1])) {
                t.isInLoadingList = !1,
                t.removeAvatarFromScene(),
                e.clear();
                return
            }
        t.isRender = !0,
        (n = t.controller) == null || n.playAnimation(t.controller.onPlay, t.controller.loop),
        (o = t.controller) == null || o.onPlayObservable.addOnce(()=>{
            var a, s;
            if (!this.getAvatarById(t.id)) {
                t.isInLoadingList = !1,
                t.removeAvatarFromScene(),
                this.currentLODUsers[t.distLevel]--;
                return
            }
            if (this.getAvatarById(t.id).rootNode.getChildMeshes().length < e.size) {
                logger.error(`this avatar does not have complete components, render failed. current list ${(a = this.getAvatarById(t.id)) == null ? void 0 : a.clothesList},avatar: ${t.id},${t.nickName}`),
                t.isInLoadingList = !1,
                t.removeAvatarFromScene(),
                this.currentLODUsers[t.distLevel]--;
                return
            }
            t.setIsPickable(!0),
            t.isInLoadingList = !1,
            t.setAvatarVisible(!0),
            (s = this._sceneManager) == null || s.lightComponent.setShadow(t),
            t.getBbox(),
            t.nameBoard && t.nickName.length > 0 && t.setNickName(t.nickName, t.nameBoard.DEFAULT_CONFIGS),
            t.bubble && t.words.length > 0 && t.say(t.words, t.bubble.DEFAULT_CONFIGS),
            logger.debug(`[Engine] avatar ${t.id} has been added to scene, current number of users : ${this.currentLODUsers}`)
        }
        )
    }
    _disposeUnusedAssets() {
        this._tickDispose++,
        this._tickDispose > this._disposeTime && (avatarLoader.disposeContainer(),
        this._tickDispose = 0)
    }
    _addResourcesToList(e, t) {
        return e.clothesList.forEach(r=>{
            r.lod = t,
            this._queue.push(r)
        }
        ),
        this._queue.push({
            type: avatarSetting.animations,
            id: this._defaultAnims
        }),
        this._queue.push({
            type: avatarSetting.body,
            id: e.avatarType,
            lod: t
        }),
        !0
    }
    _updateBillboardStatus(e, t) {
        e.bbComponent.updateBillboardStatus(e, t)
    }
    _processLayer(e) {
        const t = this.characterMap.get(e)
          , r = [];
        for (t == null || t.forEach(n=>{
            n.distToCam = this._distToCamera(n);
            const o = n.distToCam < this._cullingDistance;
            if (n.isRender && (!n.isHide && o ? n._hide_culling() : n._show_culling()),
            n.priority != 0) {
                n.distance = this._distToMain(n);
                let a = BillboardStatus.SHOW;
                n.distance < this._maxDistRange && (o ? a = BillboardStatus.HIDE : n._show_culling(),
                this._updateBillboardStatus(n, a)),
                n.isHide || (n.isInLoadingList ? this.currentLODUsers[n.distLevel]++ : r.push(n))
            }
        }
        ),
        r.sort((n,o)=>o.distance - n.distance); r.length > 0 && this.curRenderNum() < this.maxRenderNum(); ) {
            const n = r.pop();
            let o = this._checkLODLevel(n.distance)
              , a = !1;
            for (let s = 0; s < this._maxLODUsers.length; ++s)
                if (this.currentLODUsers[s] < this._maxLODUsers[s]) {
                    o = s,
                    a = !0;
                    break
                }
            if (!a || n.distance > this._maxDistRange) {
                if (n.isRender) {
                    n._removeAvatarFromScene();
                    let s = BillboardStatus.HIDE;
                    n.distance < this._maxDistRange && (s = BillboardStatus.SHOW),
                    this._updateBillboardStatus(n, s)
                }
                break
            }
            o != n.distLevel ? (n.isRender && (n.pendingLod = !0),
            n.distLevel = o,
            this._processList.push(n),
            n.isInLoadingList = !0) : n.isRender || (this._processList.push(n),
            n.isInLoadingList = !0),
            this.currentLODUsers[o]++
        }
        return this.curRenderNum() >= this.maxRenderNum() && r.forEach(n=>{
            if (n.isRender) {
                n._removeAvatarFromScene();
                let o = BillboardStatus.HIDE;
                n.distance < this._maxDistRange && (o = BillboardStatus.SHOW),
                this._updateBillboardStatus(n, o)
            }
        }
        ),
        this.curRenderNum() < this.maxRenderNum()
    }
    _updateAvatar() {
        this.currentLODUsers = [0, 0, 0];
        const e = [5, 4, 3, 2, 1, 0];
        for (; e.length > 0; ) {
            const t = e.pop();
            if (!this._processLayer(t)) {
                e.forEach(n=>{
                    var o;
                    (o = this.characterMap.get(n)) == null || o.forEach(a=>{
                        a.distance = this._distToMain(a);
                        let s = BillboardStatus.HIDE;
                        a.distToCam < this._maxDistRange && (s = BillboardStatus.SHOW,
                        a.isRender && a._removeAvatarFromScene()),
                        this._updateBillboardStatus(a, s)
                    }
                    )
                }
                );
                break
            }
        }
    }
    _updateAvatarStatus() {
        const e = new Map;
        this._updateLoopObserver = this.scene.onBeforeRenderObservable.add(()=>{
            var t;
            if (this._disposeUnusedAssets(),
            !(this.getAvatarNums() <= 0)) {
                if (!this._process && this._processList.length == 0 && this._updateAvatar(),
                !this._process && this._processList.length > 0) {
                    const r = this._processList.shift();
                    r != this._process && !r.isCulling ? this._addResourcesToList(r, r.distLevel) ? (this._process = r,
                    this._queueLength = this._queue.length) : (this._process = void 0,
                    this._queue = [],
                    r.isInLoadingList = !1) : r.isInLoadingList = !1
                }
                if (e.size === this._queueLength && this._process) {
                    this._process.pendingLod && (this._process.pendingLod = !1,
                    this._process._removeAvatarFromScene());
                    const r = Date.now();
                    this._assemblyAvatar(e, this._process),
                    (t = this._sceneManager) == null || t.engineRunTimeStats.timeArray_addAvatarToScene.add(Date.now() - r),
                    this._updateBillboardStatus(this._process, BillboardStatus.SHOW),
                    e.clear(),
                    this._queue = [],
                    this._process.isInLoadingList = !1,
                    this._process = void 0,
                    this._disposeUnusedAssets()
                }
                this._loadResByList(e)
            }
        }
        )
    }
    _loadResByList(e) {
        let t = 0;
        const r = 5;
        if (!this._process) {
            e.clear();
            return
        }
        for (; t < r && this._queue.length > 0; ) {
            const n = Date.now()
              , o = this._queue.pop();
            setTimeout(()=>{
                o ? o.type === avatarSetting.body ? this.loadBody(o.type, o.id, o.lod).then(a=>{
                    a && e.set(avatarSetting.body, a),
                    t += Date.now() - n
                }
                ).catch(a=>{
                    this._process && (this._process.isHide = !0,
                    this.currentLODUsers[this._process.distLevel]--,
                    e.clear(),
                    this._queue = [],
                    this._process.isInLoadingList = !1,
                    this._process = void 0,
                    t += 100),
                    logger.warn(`[Engine] body ${o.id} uri error, type ${o.type}, avatar has been hided` + a)
                }
                ) : o.type === avatarSetting.animations ? this.loadAnimation(this._process.avatarType, o.id).then(a=>{
                    a && e.set(avatarSetting.animations, a),
                    t += Date.now() - n
                }
                ).catch(a=>{
                    this._process && (this._process.isHide = !0,
                    this.currentLODUsers[this._process.distLevel]--,
                    e.clear(),
                    this._queue = [],
                    this._process.isInLoadingList = !1,
                    this._process = void 0,
                    t += 100),
                    logger.warn(`animation  ${o.id} uri error, type ${o.type}, avatar has been hided` + a)
                }
                ) : this.loadDecoration(o.type, o.id, o.lod).then(a=>{
                    a && e.set(a.type, a),
                    t += Date.now() - n
                }
                ).catch(a=>{
                    this._process && (this._process.isHide = !0,
                    this.currentLODUsers[this._process.distLevel]--,
                    e.clear(),
                    this._queue = [],
                    this._process.isInLoadingList = !1,
                    this._process = void 0,
                    t += 100),
                    logger.warn(`component ${o.id} uri error, type ${o.type}, avatar has been hided` + a)
                }
                ) : t += 100
            }
            , 0)
        }
    }
    _validateContainer(e) {
        return !e.meshes || e.meshes.length <= 1 ? (logger.warn("import container has no valid meshes"),
        !1) : !e.skeletons || e.skeletons.length == 0 ? (logger.warn("import container has no valid skeletons"),
        !1) : !0
    }
    _getAssetContainer(e, t) {
        return new Promise((r,n)=>{
            const o = this._getSourceKey(e, t || 0)
              , a = avatarLoader.containers.get(o);
            if (a)
                return r(a);
            avatarLoader.load(this.sceneManager, e, t).then(s=>s ? this._validateContainer(s) ? (avatarLoader.containers.set(o, s),
            r(s)) : n(new ContainerLoadingFailedError(`[Engine] :: cannot load body type ${e}.`)) : n(new ContainerLoadingFailedError(`[Engine] container load failed cannot load body type ${e}.`))).catch(s=>n(new ContainerLoadingFailedError(`[Engine] ${s} :: cannot load body type ${e}.`)))
        }
        )
    }
    _clipContainerRes(e) {
        e.transformNodes.forEach(t=>{
            t.dispose()
        }
        ),
        e.transformNodes = [],
        e.skeletons.forEach(t=>{
            t.dispose()
        }
        ),
        e.skeletons = []
    }
    loadBody(e, t, r) {
        return new Promise((n,o)=>avatarLoader.load(this.sceneManager, t, r).then(a=>{
            if (a) {
                const s = a.instantiateModelsToScene();
                // zeg 此时body_man缩放已经0.01
                s.rootNodes[0]._children[0]._scaling.setAll(0.014)
                console.log("body_man缩放", s.rootNodes[0]._children[0]._scaling)
                a.xReferenceCount++;
                const l = {
                    isRender: !1,
                    uId: Math.random(),
                    root: s.rootNodes[0],
                    skeletonType: e,
                    name: t,
                    animations: s.animationGroups,
                    skeleton: s.skeletons[0],
                    lod: r
                };
                return s.rootNodes[0]._parentContainer = a,
                s.rootNodes[0].setEnabled(!1),
                n(l)
            } else
                return o(new ContainerLoadingFailedError("[Engine] container failed instanciates failed"))
        }
        ).catch(()=>o(new ContainerLoadingFailedError(`[Engine] body type ${e} instanciates failed`))))
    }
    updateAnimationLists(e, t) {
        return new Promise((r,n)=>(avatarLoader.avaliableAnimation.set(t, e),
        r()))
    }
    loadAnimation(avatarType, animationName) {
        return new Promise((resolve, reject)=>
            avatarLoader.loadAnimRes(this.sceneManager, animationName, avatarType).then(o=>{
                if (o) {
                    let group;
                    const avatarAnimations = this.avatarLoader.animations;
                    return o.animationGroups.forEach(animationGroup=>{
                        animationGroup.stop(),
                        animationGroup.name === animationName && (
                            group = animationGroup,
                            group.pContainer = o
                        ),
                        avatarAnimations.set(getAnimationKey(animationGroup.name, avatarType), animationGroup)
                    }),
                    this._clipContainerRes(o),
                    o.xReferenceCount++,
                    resolve(group)
                } else
                    return reject(new ContainerLoadingFailedError("[Engine] container failed instanciates failed"))
            }
        ))
    }
    loadDecoration(e, t, r) {
        return new Promise((n,o)=>avatarLoader.load(this.sceneManager, t, r).then(a=>{
            if (a) {
                this._clipContainerRes(a);
                const s = a.meshes[1].clone(a.meshes[1].name, null);
                if (!s) {
                    logger.warn("[Engine] decoration does not exist!"),
                    n(null);
                    return
                }
                // zeg 装饰模型scale矫正
                s.scaling = new BABYLON.Vector3(-0.01, 0.01, -0.01)
                // 改变头发和衣服的贴图
                s.name != "head" && s.material.albedoTexture.updateURL("./assets/111.jpeg")
                s.name.indexOf("hair") > -1 && s.material.albedoTexture.updateURL("./assets/000.jpeg")
                const l = {
                    isRender: !1,
                    uId: Math.random(),
                    root: s,
                    type: e,
                    name: t,
                    isSelected: !1,
                    lod: r
                };
                a.xReferenceCount++
                s._parentContainer = a
                if (a.meshes.length > 1)
                    for (let u = 2; u < a.meshes.length; u++)
                        s.addChild(a.meshes[u].clone(a.meshes[u].name, null));
                s.setEnabled(!1)
                l.isSelected = !0
                n(l)
            } else
                return o(new ContainerLoadingFailedError("[Engine] container failed, instanciates failed."))
        }
        ).catch(() => {
            o(new ContainerLoadingFailedError(`[Engine] body type ${e} instanciates failed.`))
        }))
    }
    _getSourceKey(e, t) {
        return t && avatarSetting.lod[t] ? e + avatarSetting.lod[t].fileName.split(".")[0] : e
    }
    addAvatarToScene(xavatar, t) {
        const startTime = Date.now();
        return new Promise((resolve, reject)=>{
            this.loadBody(xavatar.avatarType, xavatar.avatarType, t).then(modelData => {
                if (!modelData) {
                    xavatar.isInLoadingList = !1
                    return reject(new ContainerLoadingFailedError(`[Engine] avatar ${xavatar.id} instanciates failed`));
                }

                xavatar.attachBody(modelData)
                if (modelData.animations.length > 0) {
                    modelData.animations.forEach(l=>{
                        l.stop()
                    })
                    xavatar.setAnimations(modelData.animations)
                    xavatar.controller == null || xavatar.controller.playAnimation(xavatar.controller.onPlay, !0)
                    xavatar.isRender = !0
                    xavatar.isInLoadingList = !1
                    xavatar.setAvatarVisible(!0)
                    return resolve(xavatar);
                }

                this.loadAnimation(xavatar.avatarType, this._defaultAnims).then(l => {
                    if (!l) {
                        xavatar.removeAvatarFromScene()
                        xavatar.isInLoadingList = !1
                        return reject(new AvatarAnimationError);
                    }
                    const u = [];
                    xavatar.clothesList.length > 0 && xavatar.clothesList.forEach(c => {
                        u.push(this.loadDecoration(c.type, c.id, t))
                    }),
                    Promise.all(u).then(c => {
                        c.forEach(v=>{
                            if (v && !v.isRender) {
                                xavatar.attachDecoration(v);
                            } else {
                                xavatar.isInLoadingList = !1,
                                xavatar.removeAvatarFromScene()
                                return reject(new AvatarAssetLoadingError)
                            }
                        }),
                        xavatar.isRender = !0,
                        xavatar.controller == null || xavatar.controller.playAnimation(xavatar.controller.onPlay, xavatar.controller.loop),
                        xavatar.setAvatarVisible(!0);
                        const h = avatarLoader.mshPath.get("meshes/ygb.glb")
                          , f = avatarLoader.matPath.get(avatarResources.ygb.mesh);
                        if(h && f) {
                            this.loadExtra(f, h).then(v => {
                                xavatar.isRender = !0,
                                xavatar.isInLoadingList = !1,
                                xavatar.distLevel = t,
                                this._sceneManager == null || this._sceneManager.engineRunTimeStats.timeArray_addAvatarToScene.add(Date.now() - startTime),
                                resolve(xavatar)
                            })
                        } else {
                            xavatar.isRender = !0,
                            xavatar.isInLoadingList = !1,
                            xavatar.distLevel = t,
                            this._sceneManager == null || this._sceneManager.engineRunTimeStats.timeArray_addAvatarToScene.add(Date.now() - startTime),
                            resolve(xavatar)
                        }
                        this._sceneManager == null || this._sceneManager.lightComponent.setShadow(xavatar),
                        xavatar.isInLoadingList = !1,
                        xavatar.distLevel = t,
                        this._sceneManager == null || this._sceneManager.engineRunTimeStats.timeArray_addAvatarToScene.add(Date.now() - startTime),
                        // 去掉首屏loading
                        document.querySelector(".loading").style.zIndex = -9999,                    
                        resolve(xavatar)
                    }
                    ).catch(()=>reject(new AvatarAssetLoadingError(`[Engine] avatar ${xavatar.id} instanciates failed.`)))
                }
                ).catch(()=>reject(new AvatarAssetLoadingError(`[Engine] avatar ${xavatar.id} instanciates failed.`)))
            }
            ).catch(()=>reject(new AvatarAssetLoadingError(`[Engine] avatar ${xavatar.id} instanciates failed.`)))
        })
    }
    loadExtra(e, t) {
        const r = avatarResources.ygb.name;
        return new Promise((n,o)=>{
            var a;
            (a = this.sceneManager) == null || a.urlTransformer(e).then(s=>{
                BABYLON.SceneLoader.LoadAssetContainerAsync("", s, this.scene, null, avatarSetting.fileType).then(l=>{
                    var c;
                    this.extraComps.set(r, l.meshes[0]);
                    const u = new NodeMaterial(`material_${r}`,this._scene,{
                        emitComments: !1
                    });
                    (c = this.sceneManager) == null || c.urlTransformer(t).then(h=>{
                        u.loadAsync(h).then(()=>{
                            l.meshes[2].material.dispose(!0, !0),
                            u.build(!1),
                            l.meshes[2].material = u,
                            n(l.meshes[2])
                        }
                        )
                    }
                    )
                }
                )
            }
            )
        }
        )
    }
    getAvatarList() {
        const e = [];
        return this.characterMap.forEach((t,r)=>{
            t.forEach((n,o)=>{
                e.push(n)
            }
            )
        }
        ),
        e
    }
    _debug_avatar() {
        var t, r;
        console.error("===>currentLODUsers", this.currentLODUsers),
        console.error("===>maxLODUsers", this._maxLODUsers),
        console.error("===>Loddist", this.getLoDLevels()),
        console.error("===> main character loc", (r = (t = this._mainUser) == null ? void 0 : t.rootNode) == null ? void 0 : r.position);
        let e = 0;
        this.getAvatarList().forEach(n=>{
            n.isRender && (console.error(`avatar id : ${n.id},lod ${n.distLevel},is Hide ${n.isHide}, distance ${n.distance}, is pending ${n.isInLoadingList}`),
            e++)
        }
        ),
        console.error("========= avatar num", e),
        console.error("loop:", this._updateLoopObserver ? "on" : "false", "=> process", this._process, "===> comp", this._processList),
        console.error("===>maxLODUsers", this._maxLODUsers)
    }
}