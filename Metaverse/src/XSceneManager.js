import XCameraComponent from "./XCameraComponent.js"
import XStaticMeshComponent from "./XStaticMeshComponent.js"
import XMaterialComponent from "./XMaterialComponent.js"
import XStats from "./XStats.js"
import XBreathPointManager from "./XBreathPointManager.js"
import XDecalManager from "./XDecalManager.js"
import XAvatarManager from "./XAvatarManager.js"
import XBillboardManager from "./XBillboardManager.js"
import XLightManager from "./XLightManager.js"
import XEngineRunTimeStats from "./XEngineRunTimeStats.js"
import EShaderMode from "./enum/EShaderMode.js"
import defaultLog from "./defaultLog.js"
import Logger from "./Logger.js"

const logger = new Logger('SceneManager')

const getAlphaWidthMap = (i,e)=>{
    const t = new BABYLON.DynamicTexture("test",3,e)
      , r = new Map;
    for (let n = 32; n < 127; n++) {
        const o = String.fromCodePoint(n)
          , a = 2 + "px " + i;
        t.drawText(o, null, null, a, "#000000", "#ffffff", !0);
        const s = t.getContext();
        s.font = a;
        const l = s.measureText(o).width;
        r.set(n, l)
    }
    return t.dispose(),
    r
}

export default class XSceneManager {
    constructor(canvas, options) {
        this.cameraParam
        this.shaderMode
        this.panoInfo
        this._forceKeepVertical = !1
        this._currentShader
        this._renderStatusCheckCount = 0
        this._renderStatusNotChecktCount = 0
        this._nonlinearCanvasResize = !1
        this._bChangeEngineSize = !0
        this._skytv
        this._mv = []
        this._backgroundImg

        this.engine = new BABYLON.Engine(canvas, !0, {
            preserveDrawingBuffer: !0,
            stencil: !0,
            disableWebGL2Support: /iphone|ipad/gi.test(window.navigator.userAgent) || options.disableWebGL2
        }, !0),
        this.scene = new BABYLON.Scene(this.engine),
        this.canvas = canvas,
        this.scene.clearColor = new BABYLON.Color4(.7,.7,.7,1),
        this.engine.getCaps().parallelShaderCompile = void 0,
        this._initEngineScaleNumber = this.engine.getHardwareScalingLevel(),
        this.engine.enableOfflineSupport = !1,
        this.engine.doNotHandleContextLost = !0,
        this.scene.clearCachedVertexData(),
        this.scene.cleanCachedTextureBuffer(),
        debugMode && this.scene.debugLayer.show({ embedMode: true, }),    // BABYLON调试工具栏

        this.urlTransformer = options.urlTransformer || (s=>Promise.resolve(s)),
        options.logger && defaultLog.setLogger(options.logger),

        this.gl = canvas.getContext("webgl2", { preserveDrawingBuffer: !0 }) 
        || canvas.getContext("webgl", { preserveDrawingBuffer: !0 }) 
        || canvas.getContext("experimental-webgl", { preserveDrawingBuffer: !0 }),
        this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 1),

        this._currentPanoId = 0,
        options.forceKeepVertical && (this._forceKeepVertical = options.forceKeepVertical),
        options.panoInfo && (this.panoInfo = options.panoInfo),
        options.shaderMode && (this.shaderMode = options.shaderMode),
        options.yuvInfo ? this._yuvInfo = options.yuvInfo : this._yuvInfo = {
            width: options.videoResOriArray[0].width,
            height: options.videoResOriArray[0].height,
            fov: 50
        },
        options.cameraParam && (this.cameraParam = options.cameraParam),
        options.nonlinearCanvasResize && (this._nonlinearCanvasResize = options.nonlinearCanvasResize),

        this._cameraManager = new XCameraComponent(this.canvas,this.scene,{
            cameraParam: this.cameraParam,
            yuvInfo: this._yuvInfo,
            forceKeepVertical: this._forceKeepVertical
        }),
        this._lowpolyManager = new XStaticMeshComponent(this),
        this._materialManager = new XMaterialComponent(this,{
            videoResOriArray: options.videoResOriArray,
            yuvInfo: this._yuvInfo,
            panoInfo: this.panoInfo,
            shaderMode: this.shaderMode
        }),
        this._statisticManager = new XStats(this),
        this._breathPointManager = new XBreathPointManager(this),
        this._decalManager = new XDecalManager(this),
        this._avatarManager = new XAvatarManager(this),
        this._billboardManager = new XBillboardManager(this),
        this.billboardComponent.loadBackGroundTexToIDB(),
        this._lightManager = new XLightManager(this),
        this.postprocessing(),
        this.initSceneManager(),
        this.engineRunTimeStats = new XEngineRunTimeStats,

        /iphone/gi.test(window.navigator.userAgent) 
        && window.devicePixelRatio 
        && window.devicePixelRatio === 3 
        && window.screen.width === 375 
        && window.screen.height === 812 
        ? this.engine.setHardwareScalingLevel(this._initEngineScaleNumber * 2) 
        : this.engine.setHardwareScalingLevel(this._initEngineScaleNumber * 1.8),
        
        this.scene.registerBeforeRender(()=>{
            this._nonlinearCanvasResize && this._bChangeEngineSize && (this.setEngineSize(this._yuvInfo),
            this._bChangeEngineSize = !1)
        }),
        this.scene.registerAfterRender(()=>{
            this._nonlinearCanvasResize || this.registerAfterRender()
        }),
        window.addEventListener("resize", ()=>{
            this._nonlinearCanvasResize ? this._bChangeEngineSize = !0 : this.engine.resize()
        }),
        XBillboardManager.alphaWidthMap = getAlphaWidthMap("Arial", this.scene),
        this.uploadHardwareSystemInfo()
    }

    uploadHardwareSystemInfo = ()=>{
        const e = this.statisticComponent.getHardwareRenderInfo()
            , t = this.statisticComponent.getSystemInfo()
            , r = {
            driver: t.driver,
            vender: t.vender,
            webgl: t.version,
            os: t.os
        };
        logger.warn(JSON.parse(JSON.stringify(e))),
        logger.warn(JSON.parse(JSON.stringify(r)))
    }

    addNewLowPolyMesh = async(e,t)=>(
        this._currentShader == null && await this.initSceneManager(),
        this._lowpolyManager.addNewLowPolyMesh(e, t, this._currentShader)
    )

    initSceneManager = async()=>(await this._materialManager.initMaterial(),this.applyShader())

    registerAfterRender = ()=>{
        var e;
        if (this._forceKeepVertical) {
            const t = this.canvas.width
                , r = this.canvas.height;
            let n = 0
                , o = [[0, 0, 0, 0], [0, 0, 0, 0]];
            if (((e = this._cameraManager.MainCamera) == null ? void 0 : e.fovMode) === BABYLON.Camera.FOVMODE_HORIZONTAL_FIXED ? (n = Math.ceil((r - this._yuvInfo.height * t / this._yuvInfo.width) / 2),
            o = [[0, 0, t, n], [0, r - n, t, n]]) : (n = Math.ceil((t - this._yuvInfo.width * r / this._yuvInfo.height) / 2),
            o = [[0, 0, n, r], [t - n, 0, n, r]]),
            n > 0) {
                this.gl.enable(this.gl.SCISSOR_TEST);
                for (let a = 0; a < o.length; ++a)
                    this.gl.scissor(o[a][0], o[a][1], o[a][2], o[a][3]),
                    this.gl.clearColor(0, 0, 0, 1),
                    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
                this.gl.disable(this.gl.SCISSOR_TEST)
            }
        }
    }

    resetRender = ()=>{
        this.scene.environmentTexture && (
            this.scene.environmentTexture._texture ? this.lightComponent.setIBL(this.scene.environmentTexture._texture.url) 
            : this.scene.environmentTexture.url && this.lightComponent.setIBL(this.scene.environmentTexture.url)
        )
    }

    get yuvInfo() {
        return this.getCurrentShaderMode() == 1 ? this._yuvInfo : {
            width: -1,
            height: -1,
            fov: -1
        }
    }
    set yuvInfo(e) {
        this.getCurrentShaderMode() == 1 && (this._yuvInfo = e,
        this._cameraManager.cameraFovChange(e))
    }
    get mainScene() {
        return this.scene
    }
    get cameraComponent() {
        return this._cameraManager
    }
    get staticmeshComponent() {
        return this._lowpolyManager
    }
    get materialComponent() {
        return this._materialManager
    }
    get statisticComponent() {
        return this._statisticManager
    }
    get avatarComponent() {
        return this._avatarManager
    }
    get lightComponent() {
        return this._lightManager
    }
    get Engine() {
        return this.engine
    }
    get Scene() {
        return this.scene
    }
    get billboardComponent() {
        return this._billboardManager
    }
    get breathPointComponent() {
        return this._breathPointManager
    }
    get skytvComponent() {
        return this._skytv
    }
    get mvComponent() {
        return this._mv
    }
    get decalComponent() {
        return this._decalManager
    }
    get currentShader() {
        return this._currentShader
    }
    get initEngineScaleNumber() {
        return this._initEngineScaleNumber
    }
    setImageQuality(e) {
        e == 0 ? (this.engine.setHardwareScalingLevel(this._initEngineScaleNumber * 1.8),
        logger.info("[Engine] change image quality to low, [" + this._initEngineScaleNumber * 1.8 + "]")) : e == 1 ? (this.engine.setHardwareScalingLevel(this._initEngineScaleNumber * 1.5),
        logger.info("[Engine] change image quality to mid, [" + this._initEngineScaleNumber * 1.5 + "]")) : e == 2 && (this.engine.setHardwareScalingLevel(this._initEngineScaleNumber * 1),
        logger.info("[Engine] change image quality to high, [" + this._initEngineScaleNumber * 1 + "]"))
    }
    setNonlinearCanvasResize(e) {
        this._nonlinearCanvasResize = e,
        this._bChangeEngineSize = e,
        e || this.engine.resize()
    }
    setBackgroundColor(e) {
        this.scene.clearColor = new Color4(e.r,e.g,e.b,e.a)
    }
    setBackgroundImg(e) {
        return this._backgroundImg != null && this._backgroundImg.url == e ? Promise.resolve(!0) : new Promise((t,r)=>{
            this.urlTransformer(e).then(n=>{
                this._backgroundImg == null ? this._backgroundImg = {
                    layer: new Layer("tex_background_" + Date.now(),n,this.Scene,!0),
                    url: e
                } : this._backgroundImg.url != e && this._backgroundImg.layer != null && this._backgroundImg.layer.texture != null && (this._backgroundImg.layer.texture.updateURL(n),
                this._backgroundImg.layer.name = "tex_background_" + Date.now(),
                this._backgroundImg.url = e),
                t(!0)
            }
            ).catch(n=>{
                logger.error(`[Engine] set background image Error: ${n}`),
                r(`[Engine] set background image Error: ${n}`)
            }
            )
        }
        )
    }
    cleanTheWholeScene() {
        const e = this.scene.getFrameId();
        this.scene.onBeforeRenderObservable.clear(),
        this.scene.onAfterRenderObservable.clear(),
        this.scene.clearCachedVertexData(),
        this.scene.cleanCachedTextureBuffer(),
        this.scene.registerBeforeRender(()=>{
            this.scene.getFrameId() - e > 5 && this.scene.dispose()
        }
        )
    }
    getAreaAvatar(e, t) {
        const r = [];
        return this._avatarManager.getAvatarList().forEach(n=>{
            const o = e
              , a = n.position;
            a && o && calcDistance3D(o, a) < t && r.push(n.id)
        }
        ),
        r
    }
    setEngineSize(e) {
        const t = e.width
          , r = e.height
          , n = this.canvas.width;
        this.canvas.height,
        this.engine.setSize(Math.round(n), Math.round(n * (r / t)))
    }
    getCurrentShaderMode() {
        return this._currentShader === this._materialManager.getDefaultShader() ? 0 : this._currentShader === this._materialManager.getPureVideoShader() ? 1 : 2
    }
    addSkyTV(e, t) {
        return this._skytv = new XTelevision(this.scene,e,this,t),
        this._skytv
    }
    addMv(e, t) {
        this._mv.push(new XTelevision(this.scene,e,this,t))
    }
    addMeshInfo(e) {
        this._lowpolyManager.setMeshInfo(e)
    }
    applyShader() {
        return new Promise((e,t)=>{
            this.shaderMode == EShaderMode.videoAndPano || this.shaderMode == EShaderMode.video ? this.changeVideoShaderForLowModel() : this.shaderMode == EShaderMode.default && this.changeDefaultShaderForLowModel(),
            e(!0)
        }
        )
    }
    changeHardwareScaling(e) {
        e < 1 ? e = 1 : e > 2.5 && (e = 2.5),
        this._bChangeEngineSize = !0,
        this.engine.setHardwareScalingLevel(this._initEngineScaleNumber * e)
    }
    getCurrentUsedPanoId() {
        return this._currentPanoId
    }
    render() {
        try {
            this.scene.render()
        } catch (e) {
            throw logger.error(`[Engine] Render Error: ${e}`),
            e
        }
    }
    isReadyToRender(e) {
        const {checkMesh: t=!0, checkEffect: r=!1, checkPostProgress: n=!1, checkParticle: o=!1, checkAnimation: a=!1, materialNameWhiteLists: s=[]} = e;
        if (this.scene._isDisposed)
            return logger.error("[Engine] this.scene._isDisposed== false "),
            !1;
        let l;
        const u = this.scene.getEngine();
        if (r && !u.areAllEffectsReady())
            return logger.error("[Engine] engine.areAllEffectsReady == false"),
            !1;
        if (a && this.scene._pendingData.length > 0)
            return logger.error("[Engine] scene._pendingData.length > 0 && animation error"),
            !1;
        if (t) {
            for (l = 0; l < this.scene.meshes.length; l++) {
                const c = this.scene.meshes[l];
                if (!c.isEnabled() || !c.subMeshes || c.subMeshes.length === 0 || c != null && c.material != null && !(c.material.name.startsWith("Pure") || c.material.name.startsWith("Pano")))
                    continue;
                if (!c.isReady(!0))
                    return logger.error(`[Engine] scene. mesh isReady == false, mesh name:${c.name}, mesh xtype: ${c == null ? void 0 : c.xtype}, mesh xgroup: ${c == null ? void 0 : c.xgroup}, mesh xskinInfo: ${c == null ? void 0 : c.xskinInfo}`),
                    !1;
                const h = c.hasThinInstances || c.getClassName() === "InstancedMesh" || c.getClassName() === "InstancedLinesMesh" || u.getCaps().instancedArrays && c.instances.length > 0;
                for (const f of this.scene._isReadyForMeshStage)
                    if (!f.action(c, h))
                        return logger.error(`[Engine] scene._isReadyForMeshStage == false, mesh name:${c.name}, mesh xtype: ${c == null ? void 0 : c.xtype}, mesh xgroup: ${c == null ? void 0 : c.xgroup}, mesh xskinInfo: ${c == null ? void 0 : c.xskinInfo}`),
                        !1
            }
            for (l = 0; l < this.scene.geometries.length; l++)
                if (this.scene.geometries[l].delayLoadState === 2)
                    return logger.error("[Engine] geometry.delayLoadState === 2"),
                    !1
        }
        if (n) {
            if (this.scene.activeCameras && this.scene.activeCameras.length > 0) {
                for (const c of this.scene.activeCameras)
                    if (!c.isReady(!0))
                        return logger.error("[Engine] camera not ready === false, ", c.name),
                        !1
            } else if (this.scene.activeCamera && !this.scene.activeCamera.isReady(!0))
                return logger.error("[Engine] activeCamera ready === false, ", this.scene.activeCamera.name),
                !1
        }
        if (o) {
            for (const c of this.scene.particleSystems)
                if (!c.isReady())
                    return logger.error("[Engine] particleSystem ready === false, ", c.name),
                    !1
        }
        return !0
    }
    changePanoShaderForLowModel(e) {
        return logger.info(`[Engine] changePanoShaderForLowModel: ${e}`),
        this._materialManager.allowYUVUpdate(),
        new Promise((t,r)=>{
            this._materialManager._isInDynamicRange(e) == !1 && r(!1),
            this._currentPanoId = e,
            this._currentShader = this._materialManager.getDynamicShader(e),
            this.changeShaderForLowModel().then(()=>{
                t(!0)
            }
            )
        }
        )
    }
    changeVideoShaderForLowModel() {
        return logger.info("[Engine] changeVideoShaderForLowModel"),
        this._currentShader = this._materialManager.getPureVideoShader(),
        this._materialManager.allowYUVUpdate(),
        this.changeShaderForLowModel()
    }
    changeDefaultShaderForLowModel() {
        return logger.info("[Engine] changeDefaultShaderForLowModel"),
        this._currentShader = this._materialManager.getDefaultShader(),
        this._materialManager.stopYUVUpdate(),
        this.changeShaderForLowModel()
    }
    changeShaderForLowModel() {
        return new Promise((e,t)=>{
            this._lowpolyManager.getMeshes().forEach(r=>{
                r.setMaterial(this._currentShader)
            }
            ),
            this._lowpolyManager.getCgMesh().mesh.material = this._currentShader,
            e(!0)
        }
        )
    }
    setIBL(e) {
        this._lightManager.setIBL(e)
    }
    // 后处理bloom
    postprocessing() {
        const e = new BABYLON.DefaultRenderingPipeline("default",!0,this.scene);
        e.imageProcessingEnabled = !1,
        // e.bloomEnabled = !0,
        e.bloomThreshold = 1,
        e.bloomWeight = 1,
        e.bloomKernel = 64,
        e.bloomScale = .1
    }
    // 查询name中包含SM_Stage和以ground开头的meshes
    getGround() {
        const t = this._lowpolyManager.getMeshes()
          , r = [];
        return t.forEach(n=>{
            n.mesh.name.indexOf("SM_Stage") >= 0 && r.push(n.mesh)
        }),
        t.forEach(n=>{
            n.mesh.name.indexOf("Level _L01") >= 0 && r.push(n.mesh)
        }),
        t.forEach(n=>{
            n.mesh.name.indexOf("pSphere2") >= 0 && r.push(n.mesh)
        }),
        this.Scene.meshes.forEach(n=>{
            n.name.split("_")[0] === "ground" && r.push(n)
        }),
        r
    }
}