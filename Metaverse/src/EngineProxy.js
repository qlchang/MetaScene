import CircularArray from "./CircularArray.js"
import AssetTypeName from "./enum/AssetTypeName.js"
import AssetClassName from "./enum/AssetClassName.js"
import LoggerLevels from "./enum/LoggerLevels.js"
import EShaderMode from "./enum/EShaderMode.js"
import EFitMode from "./enum/EFitMode.js"
import Http from "./Http.js"
import XSceneManager from "./XSceneManager.js"
import XBillboardManager from "./XBillboardManager.js"
import ModelManager from "./ModelManager.js"
import InitEngineTimeoutError from "./error/InitEngineTimeoutError.js"
import Logger from "./Logger.js"
import TV from "./TV.js"

const logger = new Logger('Bus')
const http = new Http
const blobToDataURI = async i=>new Promise((resolve,reject)=>{
    const fileReader = new FileReader;
    fileReader.readAsDataURL(i),
    fileReader.onload = function(n) {
        var o;
        resolve((o = n.target) == null ? void 0 : o.result)
    }
    ,
    fileReader.onerror = function(n) {
        reject(n)
    }
}
)

const urlMap = new Map
  , urlTransformer = async(i,e=!1)=>typeof i != "string" ? (console.warn("url transformer error", i),
i) : i.startsWith("blob:") ? i : e ? http.get({
    url: i,
    useIndexedDb: !0,
    key: "url",
    isOutPutObjectURL: !1
}) : urlMap.has(i) ? urlMap.get(i) : http.get({
    url: i,
    useIndexedDb: !0,
    key: "url"
}).then(t=>(urlMap.set(i, t),
t));

let sceneManager;
function getSceneManager(i, e) {
    return sceneManager || (sceneManager = new XSceneManager(i,e)),
    sceneManager
}

export default class EngineProxy{
    constructor(xverseRoom) {
        this._tvs = []
        this.isRenderFirstFrame = !1
        this._idleTime = 0
        this.renderTimer
        this.lightManager
        this._checkSceneNotReadyCount = 0
        this._checkSceneDurationFrameNum = 0
        this._checkSceneFrameCount = 0
        this.timeoutCircularArray = new CircularArray(120, !1, [])
        this.frameCircularArray = new CircularArray(120, !1, [])
        this.interFrameCircularArray = new CircularArray(120, !1, [])
        this.drawCallCntCircularArray = new CircularArray(120, !1, [])
        this.activeFacesCircularArray = new CircularArray(120, !1, [])
        this.renderTimeCircularArray = new CircularArray(120, !1, [])
        this.drawCallTimeCircularArray = new CircularArray(120, !1, [])
        this.animationCircularArray = new CircularArray(120, !1, [])
        this.meshSelectCircularArray = new CircularArray(120, !1, [])
        this.renderTargetCircularArray = new CircularArray(120, !1, [])
        this.regBeforeRenderCircularArray = new CircularArray(120, !1, [])
        this.regAfterRenderCircularArray = new CircularArray(120, !1, [])
        this.renderCnt = 0
        this.renderErrorCount = 0
        this.engineSloppyCnt = 0
        this.systemStuckCnt = 0
        this.frameRenderNumber = 0

        this.room = xverseRoom

        this.updateStats = ()=>{
            this.room.stats && this.room.stats.assign({
                renderFrameTime: this.renderTimeCircularArray.getAvg(),
                maxRenderFrameTime: this.renderTimeCircularArray.getMax(),
                interFrameTime: this.interFrameCircularArray.getAvg(),
                animationTime: this.animationCircularArray.getAvg(),
                meshSelectTime: this.meshSelectCircularArray.getAvg(),
                drawcallTime: this.drawCallTimeCircularArray.getAvg(),
                idleTime: this._idleTime,
                registerBeforeRenderTime: this.regBeforeRenderCircularArray.getAvg(),
                registerAfterRenderTime: this.regAfterRenderCircularArray.getAvg(),
                renderTargetRenderTime: this.renderTargetCircularArray.getAvg(),
                fps: (1e3 / (this.renderTimeCircularArray.getAvg() + this.interFrameCircularArray.getAvg())).toFixed(2),
                drawcall: this.drawCallCntCircularArray.getAvg(),
                engineSloppyCnt: this.engineSloppyCnt,
                maxInterFrameTime: this.interFrameCircularArray.getMax(),
                maxDrawcallTime: this.drawCallTimeCircularArray.getMax(),
                maxMeshSelectTime: this.meshSelectCircularArray.getMax(),
                maxAnimationTime: this.animationCircularArray.getMax(),
                maxRegisterBeforeRenderTime: this.regBeforeRenderCircularArray.getMax(),
                maxRegisterAfterRenderTime: this.regAfterRenderCircularArray.getMax(),
                maxRenderTargetRenderTime: this.renderTargetCircularArray.getMax(),
                avgFrameTime: this.frameCircularArray.getAvg(),
                avgTimeoutTime: this.timeoutCircularArray.getAvg(),
                maxFrameTime: this.frameCircularArray.getMax(),
                maxTimeoutTime: this.timeoutCircularArray.getMax()
            })
        }
    }

    _setFPS(sceneManager, fps=25) {
        logger.info("Set fps to", fps);
        const protectFps = fps > 60 ? 60 : fps < 24 ? 24 : fps;
        const mspf = 1e3 / protectFps; //毫秒每帧
        let o = Date.now()
            , a = Date.now()
            , lastGap = mspf
            , ratio = 1;
        
        sceneManager.Engine.stopRenderLoop();

        const updatePerGap = ()=>{
            const c = Date.now()
                , h = c - o
                , f = c - a;

            a = c
            this.frameCircularArray.add(f)
            h - lastGap > mspf && (this.systemStuckCnt += 1)

            const d = h / lastGap;
            ratio = .9 * ratio + .1 * d;
            const _ = Date.now();
            let cpuRenderTime = 0, cpuUpdateYUVTime = 0;
            
            if (this.room.isUpdatedRawYUVData || this.room.isPano) {
                this.isRenderFirstFrame = !0
                if (this._checkSceneDurationFrameNum > 0)
                {
                    this._checkSceneFrameCount++,
                    this.room.sceneManager.isReadyToRender({}) && this._checkSceneDurationFrameNum--,
                    this._checkSceneFrameCount > EngineProxy._CHECK_DURATION && 
                    (
                        this._checkSceneDurationFrameNum = EngineProxy._CHECK_DURATION,
                        this._checkSceneFrameCount = 0,
                        
                        this._checkSceneNotReadyCount++,
                        (this._checkSceneNotReadyCount == 1 || this._checkSceneNotReadyCount % 100 == 0) 
                            && logger.error(`[SDK] Scene not ready, skip render. loop: ${this._checkSceneNotReadyCount}`),

                        this._checkSceneNotReadyCount > 10 && (
                            logger.error("[SDK] Scene not ready, reload later"),
                            this.room.proxyEvents("renderError", {
                                error: new Error("[SDK] Scene not ready, skip render and reload.")
                            })
                        ),

                        this.room.stats.assign({
                            renderErrorCount: this._checkSceneNotReadyCount
                        }),

                        logger.infoAndReportMeasurement({
                            value: 0,
                            type: "renderError",
                            error: new Error("[SDK] Scene not ready, skip render and reload."),
                            options: {
                                sampleRate: .1
                            }
                        })
                    );
                } else {
                    try {
                        sceneManager.render()
                    } 
                    catch (error) {
                        this.renderErrorCount++,
                        this.renderErrorCount > 10 && this.room.proxyEvents("renderError", { error }),
                        this.room.stats.assign({
                            renderErrorCount: this.renderErrorCount
                        }),
                        logger.infoAndReportMeasurement({
                            value: 0,
                            type: "renderError",
                            error,
                            options: {
                                sampleRate: .1
                            }
                        })
                    }
                }
                cpuRenderTime = Date.now() - _,
                this.frameRenderNumber < 1e3 && this.frameRenderNumber++,
                this.room.networkController.rtcp.workers.UpdateYUV(),
                cpuUpdateYUVTime = Date.now() - _ - cpuRenderTime
            }
            
            this.isRenderFirstFrame || this.room.networkController.rtcp.workers.UpdateYUV();

            const usedTimeMs = Date.now() - _;
            o = c + usedTimeMs,
            lastGap = Math.min(Math.max((mspf - usedTimeMs) / ratio, 5), 200),
            usedTimeMs > mspf && (
                lastGap = 10,
                this.engineSloppyCnt += 1
            ),
            this._idleTime = lastGap;

            lastGap > 150 && console.log("lastGap is ", lastGap, ", ratio is ", ratio, ", usedTimeMs is ", usedTimeMs, 
                ", cpuRenderTime is ", cpuRenderTime, ", cpuUpdateYUVTime is ", cpuUpdateYUVTime)

            const b = lastGap;
            this.timeoutCircularArray.add(b)
            
            if (this.renderCnt % 25 == 0) {
                this.room.stats && this.room.stats.assign({
                    avgFrameTime: this.frameCircularArray.getAvg(),
                    avgTimeoutTime: this.frameCircularArray.getMax(),
                    maxFrameTime: this.frameCircularArray.getMax(),
                    maxTimeoutTime: this.timeoutCircularArray.getMax(),
                    systemStuckCnt: this.systemStuckCnt
                })
            }
            this.renderTimer = window.setTimeout(updatePerGap, lastGap)
        }
        this.renderTimer = window.setTimeout(updatePerGap, mspf / ratio)
    }

    async initEngine(e) {
        await this.updateBillboard();
        logger.info("engine version:", VERSION$1);
        logger.setLevel(LoggerLevels.Warn);
        const videoPanoInfo = {
            videoResOriArray: [{
                width: 720,
                height: 1280
            }, {
                width: 1280,
                height: 720
            }, {
                width: 480,
                height: 654
            }, {
                width: 654,
                height: 480
            }, {
                width: 1920,
                height: 1080
            }, {
                width: 1080,
                height: 1920
            }, {
                width: 414,
                height: 896
            }],
            forceKeepVertical: this.room.options.objectFit !== "cover",
            panoInfo: {
                dynamicRange: 1,
                width: 4096,
                height: 2048
            },
            shaderMode: EShaderMode.videoAndPano,
            yuvInfo: {
                width: 1280,
                height: 720,
                fov: e.fov || DEFAULT_MAIN_CAMERA_FOV
            },
            cameraParam: {
                maxZ: 1e4
            },
            urlTransformer,
            logger: logger,
            disableWebGL2: this.room.options.disableWebGL2 || !1
        };
        const resolution = this.room.options.resolution;
        if(resolution){
            videoPanoInfo.videoResOriArray.some(l=>l.width === resolution.width && l.height === resolution.height) || 
            videoPanoInfo.videoResOriArray.push(resolution)
        }
        const sceneManager = this.room.sceneManager = getSceneManager(this.room.canvas, videoPanoInfo);
        this.room.setPictureQualityLevel(this.room.options.pictureQualityLevel || "high");
        this.room.sceneManager.staticmeshComponent.setRegionLodRule([2, 2, -1, -1, -1]);
        this.room.scene = sceneManager.Scene;
        this.room.breathPointManager = sceneManager.breathPointComponent;
        this.lightManager = sceneManager.lightComponent;
        this.registerStats();
        this.setEnv(e);
        await this.room.avatarManager.init();
        const a = this._createAssetList(e);
        await this.loadAssets(a, "");
        this._setFPS(sceneManager);
    }
    pause() {
        clearTimeout(this.renderTimer),
        logger.info("Invoke room.pause to pause render");
        const e = {
            roomId: this.room.id,
            effects: [],
            lowPolyModels: [],
            breathPointsConfig: [],
            skinId: this.room.skinId
        };
        return this.loadAssets(e, this.room.skinId)
    }
    async resume() {
        this._setFPS(this.room.sceneManager),
        this.room.sceneManager.cameraComponent.cameraFovChange(this.room.sceneManager.yuvInfo),
        logger.info("Invoke room.resume to render");
        const e = this._createAssetList(this.room.skin);
        await this.loadAssets(e, "")
    }
    setEnv(e) {
        var r;
        this.lightManager || (this.lightManager = this.room.sceneManager.lightComponent),
        e = e || this.room.skin;
        const t = ModelManager.findModel(e.models, AssetTypeName.Config, AssetClassName.Env);
        return t ? (r = this.lightManager) == null ? void 0 : r.setIBL(t.modelUrl) : (logger.error("env file not found"),
        Promise.resolve())
    }
    async _parseModelsAndLoad(e, t, r) {
        logger.info("Invoke _parseModelsAndLoad start", t);
        const n = ["airship", "balloon", "default", "ground_feiting", "ground_reqiqiu"]
          , o = new Map;
        r == null && (r = "xxxx");
        let a = !0;
        for (let u = 0; u < e.length; ++u) {
            a = !0;
            for (let c = 0; c < n.length; ++c)
                if (e[u].modelUrl.toLowerCase().indexOf(n[c]) >= 0) {
                    const h = o.get(n[c]);
                    h ? (h.push(e[u]),
                    o.set(n[c], h)) : o.set(n[c], [e[u]]),
                    a = !1;
                    break
                }
            if (a) {
                const c = o.get("default");
                c ? (c.push(e[u]),
                o.set("default", c)) : o.set("default", [e[u]])
            }
        }
        let s = o.get(t) || [];
        if (this.room.viewMode === "simple" && (s = s.filter(u=>!u.modelUrl.endsWith("zip"))),
        !s)
            return Promise.reject(`no invalid scene model with group name: ${t}`);
        const l = [];
        for (let u = 0; u < s.length; ++u) {
            const c = s[u];
            if (c.modelUrl.toLowerCase().endsWith("zip"))
                c.modelUrl.toLowerCase().endsWith("zip") && l.push(this.room.sceneManager.addNewLowPolyMesh({
                    url: c.modelUrl,
                    skinInfo: r
                }));
            else {
                const h = t;
                l.push(this.room.sceneManager.addNewLowPolyMesh({
                    url: c.modelUrl,
                    group: h,
                    pick: !0,
                    skinInfo: r
                }))
            }
        }
        return Promise.all(l)
    }
    async _deleteAssetsLowpolyModel(e) {
        this.room.sceneManager.staticmeshComponent.deleteMeshesBySkinInfo(e),
        this.room.sceneManager.breathPointComponent.clearBreathPointsBySkinInfo(e),
        this.room.sceneManager.decalComponent.deleteDecalBySkinInfo(e);
        const t = [];
        this.room.sceneManager.Scene.meshes.forEach(r=>{
            r.xskinInfo == e && t.push(r)
        }
        ),
        t.forEach(r=>{
            r.dispose(!1, !1)
        }
        )
    }
    async loadLandAssets() {
        const e = this._createAssetList(this.room.skin);
        return this.loadAssets(e, this.room.skinId).catch(()=>this.loadAssets(e, this.room.skinId))
    }
    async loadAssets(e, t="", r=8e3) {
        const startTime = Date.now();
        return this._loadAssets(e, t)._timeout(r, new InitEngineTimeoutError(`loadAssets timeout(${r}ms)`)).then(o=>(logger.infoAndReportMeasurement({
            tag: "loadAssets",
            type: "loadAssets"
        }),o)).catch(err=>(logger.infoAndReportMeasurement({
            tag: "loadAssets",
            type: "loadAssets",
            error: err
        }),
        Promise.reject(err)))
    }
    async _loadAssets(e, t="") {
        try {
            const r = [];
            r.push(this._loadAssetsLowpolyModel(e, t));
            await Promise.all(r);
            await this.setEnv();
            this._checkSceneDurationFrameNum = EngineProxy._CHECK_DURATION;
            this._checkSceneNotReadyCount = 0;
            this._checkSceneFrameCount = 0;
            this.updateAnimationList();
            this.room.loadAssetsHook();
        } catch (r) {
            return Promise.reject(r)
        }
    }
    updateAnimationList() {
        if (this.room.avatarManager && this.room.avatarManager.xAvatarManager) {
            const animationList = this.room.skin.animationList;
            if (!animationList)
            {
                return;
            }
            animationList.forEach(t=>{
                this.room.avatarManager.xAvatarManager.updateAnimationLists(t.animations, t.avatarId)
            })
        }
    }
    async _loadAssetsLowpolyModel(e, t="") {
        const r = []
          , n = []
          , o = [];
        e.lowPolyModels.forEach(f=>{
            f.group === "TV" ? n.push({
                id: "",
                name: "",
                thumbnailUrl: "",
                typeName: AssetTypeName.Model,
                className: AssetClassName.Tv,
                modelUrl: f.url
            }) : f.group === "\u544A\u767D\u5899" ? o.push({     //告白墙
                id: "",
                name: "",
                thumbnailUrl: "",
                typeName: AssetTypeName.Model,
                className: AssetClassName.Lpm,
                modelUrl: f.url
            }) : r.push({
                id: "",
                name: "",
                thumbnailUrl: "",
                typeName: AssetTypeName.Model,
                className: AssetClassName.Lpm,
                modelUrl: f.url
            })
        });

        t != "" && t != null && this._deleteAssetsLowpolyModel(t);
        const skinId = e.skinId;
        logger.info("====> from ", t, "  to  ", skinId),
        this._tvs.forEach(f=>f.clean()),
        this._tvs = [];
        let s = EFitMode.cover;
        skinId == "10048" && (s = EFitMode.contain)
        Array.isArray(n) && n.forEach((f,d)=>{
            this._tvs.push(new TV("squareTv"+d, f.modelUrl, this.room, {
                fitMode: s
            }))
        }
        ),
        e.breathPointsConfig.forEach(async breathPoint=>{
            let d;
            try {
                d = await urlTransformer(breathPoint.imageUrl)
            } catch (_) {
                d = breathPoint.imageUrl,
                logger.error("urlTransformer error", _)
            }
            this.room.breathPointManager.addBreathPoint({
                id: breathPoint.id,
                position: breathPoint.position,
                spriteSheet: d,
                rotation: breathPoint.rotation || {
                    pitch: 0,
                    yaw: 270,
                    roll: 0
                },
                billboardMode: !0,
                type: breathPoint.type || "no_type",
                spriteWidthNumber: breathPoint.spriteWidthNum || 1,
                spriteHeightNumber: breathPoint.spriteHeightNum || 1,
                maxVisibleRegion: breathPoint.maxVisibleRegion || 150,
                width: breathPoint.width,
                height: breathPoint.height,
                skinInfo: breathPoint.skinId
            })
        }
        ),
        o.forEach(f=>{
            this.room.sceneManager.decalComponent.addDecal({
                id: f.id || "gbq",
                meshPath: f.modelUrl,
                skinInfo: skinId
            })
        }
        );
        const u = this.room.sceneManager.staticmeshComponent.lowModel_group
          , c = Array.from(u.keys()).filter(f=>!f.startsWith("region_"))
          , h = ["airship", "balloon", "ground_feiting", "ground_reqiqiu", "default"];
        return new Promise((f,d)=>{
            Promise.all(h.map(_=>this._parseModelsAndLoad(r, _, skinId))).then(()=>{
                let _ = !1;
                r.forEach(v=>{
                    v.modelUrl.endsWith("zip") && (_ = !0)
                }
                ),
                _ == !1 && this.room.sceneManager.staticmeshComponent.deleteLastRegionMesh(),
                this.room.sceneManager.staticmeshComponent.lowModel_group;
                const g = Array.from(u.keys()).filter(v=>!v.startsWith("region_"))
                  , m = c.filter(v=>g.indexOf(v) < 0);
                m.length > 0 && m.forEach(v=>{
                    this.room.sceneManager.staticmeshComponent.deleteMeshesByGroup(v)
                }
                ),
                f(!0)
            }
            ).catch(_=>{
                d(_)
            }
            )
        }
        )
    }
    async _updateSkinAssets(e) {
        const t = this.room.lastSkinId
          , r = await this.room.getSkin(e)
          , n = this._createAssetList(r);
        try {
            await this.loadAssets(n, t),
            this.room.updateCurrentState({
                versionId: r.versionId,
                skinId: r.id,
                skin: r
            })
        } catch {
            await this.loadAssets(n, t),
            this.room.updateCurrentState({
                versionId: r.versionId,
                skinId: r.id,
                skin: r
            })
        }
        this.setEnv(r)
    }
    _createAssetList(e) {
        const t = []
          , r = []
          , n = [];
        let o = e.models;
        const a = this.room.modelManager.config.preload;
        return this.room.viewMode === "simple" ? a && (o = a.baseUrls.map(l=>(l.modelUrl = l.url,
        l))) : this.room.viewMode,
        ModelManager.findModels(o, AssetTypeName.Effects, AssetClassName.Effects).forEach(l=>{
            t.push({
                url: l.modelUrl,
                group: l.className,
                name: l.name
            })
        }
        ),
        ModelManager.findModels(o, AssetTypeName.Model, AssetClassName.Lpm).forEach(l=>{
            r.push({
                url: l.modelUrl,
                group: l.className
            })
        }
        ),
        ModelManager.findModels(o, AssetTypeName.Model, AssetClassName.Gbq).forEach(l=>{
            r.push({
                url: l.modelUrl,
                group: l.className
            })
        }
        ),
        ModelManager.findModels(o, AssetTypeName.Model, AssetClassName.Tv).forEach(l=>{
            r.push({
                url: l.modelUrl,
                group: l.className
            })
        }
        ),
        [].forEach(l=>{
            l.skinId == e.id && n.push(l)
        }
        ),
        {
            roomId: this.room.id,
            effects: t,
            lowPolyModels: r,
            breathPointsConfig: n,
            skinId: e.id
        }
    }
    //sceneManager.statisticComponent是XStats对象
    registerStats() {
        const sceneManager = this.room.sceneManager;
        this.room.scene.registerAfterRender(()=>{
            const interFrameTimeCounterCurrent = sceneManager.statisticComponent.getInterFrameTimeCounter()
            const drawCallsCounterCurrent = sceneManager.statisticComponent.getDrawCall()
            const activeTriangle = sceneManager.statisticComponent.getActiveFaces()
            const frameTimeCounterCurrent = sceneManager.statisticComponent.getFrameTimeCounter()
            const renderTimeCounterCurrent = sceneManager.statisticComponent.getDrawCallTime()
            const animationsTimeCounterCurrent = sceneManager.statisticComponent.getAnimationTime()
            const activeMeshesEvaluationTimeCounterCurrent = sceneManager.statisticComponent.getActiveMeshEvaluationTime()
            const renderTargetRenderTime = sceneManager.statisticComponent.getRenderTargetRenderTime()
            const registerBeforeTimeCounterCurrent = sceneManager.statisticComponent.getRegisterBeforeRenderTime()
            const registerAfterTimeCounterCurrent = sceneManager.statisticComponent.getRegisterAfterRenderTime()
            const _activeParticlesCurrent = sceneManager.statisticComponent.getActiveParticles()
            const _activeBonesCurrent = sceneManager.statisticComponent.getActiveBones()
            const activeAnimatablesLength = sceneManager.Scene._activeAnimatables.length
            const rootNodesLength = sceneManager.statisticComponent.getTotalRootNodes()
            const geometriesLength = sceneManager.Scene.geometries.length
            const beforeRenderObservableLength = sceneManager.Scene.onBeforeRenderObservable.observers.length
            const afterRenderObservableLength = sceneManager.Scene.onAfterRenderObservable.observers.length
            const meshesLength = sceneManager.statisticComponent.getTotalMeshes()
            const texturesLength = sceneManager.statisticComponent.getTotalTextures()
            const materialsLength = sceneManager.statisticComponent.getTotalMaterials()
            const systemInfo = sceneManager.statisticComponent.getSystemInfo()
            const resolution = systemInfo.resolution
            const driver = systemInfo.driver;
            systemInfo.vender;
            const version = systemInfo.version
            const hardwareScalingLevel = systemInfo.hardwareScalingLevel
            const hardwareInfo = resolution + "_" + driver + "_" + version + "_" + hardwareScalingLevel;
            this.interFrameCircularArray.add(interFrameTimeCounterCurrent);
            this.renderTimeCircularArray.add(frameTimeCounterCurrent);
            this.animationCircularArray.add(animationsTimeCounterCurrent);
            this.meshSelectCircularArray.add(activeMeshesEvaluationTimeCounterCurrent);
            this.drawCallTimeCircularArray.add(renderTimeCounterCurrent);
            this.regAfterRenderCircularArray.add(registerAfterTimeCounterCurrent);
            this.regBeforeRenderCircularArray.add(registerBeforeTimeCounterCurrent);
            this.renderTargetCircularArray.add(renderTargetRenderTime);
            this.drawCallCntCircularArray.add(drawCallsCounterCurrent);
            this.renderCnt += 1;
            if(this.renderCnt % 25 == 0){
                let stats = this.room.stats
                if(stats != null){
                    stats.assign({
                        renderFrameTime: this.renderTimeCircularArray.getAvg(),
                        maxRenderFrameTime: this.renderTimeCircularArray.getMax(),
                        interFrameTime: this.interFrameCircularArray.getAvg(),
                        animationTime: this.animationCircularArray.getAvg(),
                        meshSelectTime: this.meshSelectCircularArray.getAvg(),
                        drawcallTime: this.drawCallTimeCircularArray.getAvg(),
                        idleTime: this._idleTime,
                        registerBeforeRenderTime: this.regBeforeRenderCircularArray.getAvg(),
                        registerAfterRenderTime: this.regAfterRenderCircularArray.getAvg(),
                        renderTargetRenderTime: this.renderTargetCircularArray.getAvg(),
                        fps: (1e3 / (this.renderTimeCircularArray.getAvg() + this.interFrameCircularArray.getAvg())).toFixed(2),
                        drawcall: this.drawCallCntCircularArray.getAvg(),
                        triangle: activeTriangle.toString(),
                        engineSloppyCnt: this.engineSloppyCnt,
                        maxInterFrameTime: this.interFrameCircularArray.getMax(),
                        maxDrawcallTime: this.drawCallTimeCircularArray.getMax(),
                        maxMeshSelectTime: this.meshSelectCircularArray.getMax(),
                        maxAnimationTime: this.animationCircularArray.getMax(),
                        maxRegisterBeforeRenderTime: this.regBeforeRenderCircularArray.getMax(),
                        maxRegisterAfterRenderTime: this.regAfterRenderCircularArray.getMax(),
                        maxRenderTargetRenderTime: this.renderTargetCircularArray.getMax(),
                        activeParticles: _activeParticlesCurrent,
                        activeBones: _activeBonesCurrent,
                        activeAnimation: activeAnimatablesLength,
                        totalMeshes: meshesLength,
                        totalRootNodes: rootNodesLength,
                        totalGeometries: geometriesLength,
                        totalTextures: texturesLength,
                        totalMaterials: materialsLength,
                        registerBeforeCount: beforeRenderObservableLength,
                        registerAfterCount: afterRenderObservableLength,
                        hardwareInfo: hardwareInfo
                    })
                }
            }
        }
        )
    }
    async updateBillboard() {
        const {options: {skinId: skinId}} = this.room
          , r = (await this.room.modelManager.findAssetList(skinId)).filter(a=>a.typeName === AssetTypeName.Textures && a.className === AssetClassName.SayBubble)
          , n = ["bubble01", "bubble02", "bubble03"]
          , o = ["bubble01_npc", "bubble02_npc", "bubble03_npc"];
        if (r.length) {
            const a = r.filter(l=>n.includes(l.name)).map(l=>l.url)
              , s = r.filter(l=>o.includes(l.name)).map(l=>l.url);
            a.length && (XBillboardManager.userBubbleUrls = a),
            s.length && (XBillboardManager.npcBubbleUrls = s)
        }
    }
}
;
