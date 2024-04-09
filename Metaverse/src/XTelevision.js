import XStaticMesh from "./XStaticMesh.js"
import EMeshType from "./enum/EMeshType.js"
import Logger from "./Logger.js"
import Stream from "./Stream.js";

const logger = new Logger('Television')
export default class XTelevision {
    constructor(scene, meshUrl, scenemanager, option) {
        E(this, "videoElement");
        E(this, "meshPath");
        E(this, "scene");
        E(this, "tvMeshs", []);
        E(this, "vAng");
        E(this, "videoMat");
        E(this, "videoTexture");
        E(this, "widthHeightScale");
        E(this, "fitMode");
        E(this, "_scenemanager");

        this.scene = scene
        this.meshPath = meshUrl
        this._scenemanager = scenemanager
        if (option != null) {
            const {vAng=0, widthHeightScale=-1, fitMode="fill"} = option;
            this.vAng = vAng,
            this.widthHeightScale = widthHeightScale,
            this.fitMode = fitMode
        }
    }
    set tvWidthHeightscale(e) {
        this.widthHeightScale = e
    }
    get tvWidthHeightscale() {
        return this.widthHeightScale
    }
    get tvFitMode() {
        return this.fitMode
    }
    set tvFitMode(e) {
        this.fitMode = e
    }
    setPlaySpeed(e) {
        this.videoElement != null && (this.videoElement.playbackRate = e)
    }
    getMesh() {
        return this.tvMeshs
    }
    createElement(e, t=!1) {
        const n = new Stream().el;
        return n.loop = t,
        n.autoplay = !0,
        n.src = e,
        n
    }
    async setUrl(e) {
        const {url, isLive: r=!1, poster: n=null, bLoop: o=!1, bMuted: a=!0} = e || {};

        if (typeof url != "string")
            return logger.error("[Engine] Tv setUrl Error, url must be string: ", url),
            Promise.reject(new XTvMediaUrlError("[Engine] url must be string"));

        if (this.videoElement) {
            this.videoElement.src = url,
            n != null && n.length > 0 && (this.videoElement.poster = n);
            const l = this.play();
            return "bMuted"in e && l !== void 0 && l.then(()=>{
                this.videoElement.muted = a
            }),
            this.videoElement.addEventListener("loadedmetadata", u=>{
                this.videoElement.videoWidth > 0 
                ? this.videoMat.setFloat("mvWidthHeightScale", this.videoElement.videoWidth / this.videoElement.videoHeight) 
                : this.videoMat.setFloat("mvWidthHeightScale", 16 / 9)
            }),
            Promise.resolve(this)
        }

        const s = this.createElement(url, o);
        n != null && n.length > 0 && (s.poster = n)
        return this.setVideo(s, r).then(()=>{
            const l = this.videoElement && this.videoElement.play();
            "bMuted"in e && l !== void 0 && l.then(()=>{
                this.videoElement.muted = a
            })
        }).catch(l=>{
            logger.error("[Engine] setUrl  error! " + l),
            new XTvMediaUrlError("[Engine] setUrl  error! " + l)
        })
    }
    setCurrentTime(e) {
        if (!this.videoElement) {
            logger.warn("[Engine] The television is not been initialize succesfully");
            return
        }
        const {currentTime: t} = e;
        if (typeof t != "number") {
            logger.warn("[Engine] video currentTime must be number");
            return
        }
        this.videoElement.currentTime = t / 1e3
    }
    getCurrentTime() {
        return this.videoElement ? this.videoElement.currentTime * 1e3 : -1
    }
    play() {
        return logger.info("[Engine] Play television"),
        this.toggle(!0),
        this.videoElement ? this.videoElement.play() : Promise.resolve()
    }
    pause() {
        var e;
        return logger.info("[Engine] Pause television"),
        (e = this.videoElement) == null ? void 0 : e.pause()
    }
    stop() {
        logger.info("[Engine] Stop television"),
        this.pause(),
        setTimeout(()=>{
            this.setCurrentTime({
                currentTime: 0
            })
        }
        ),
        this.toggle(!1)
    }
    toggle(e) {
        logger.info(`[Engine] Set Tv visibility = ${e}`);
        for (let t = 0; t < this.tvMeshs.length; ++t)
            e == !0 ? this.tvMeshs[t].show() : this.tvMeshs[t].hide()
    }
    getVideoMat() {
        return this.videoMat
    }
    changeTvFitMode() {
        this.fitMode == "contain" ? (this.widthHeightScale < 0 && (this.widthHeightScale = 2.4),
        this.videoMat.setFloat("tvWidthHeightScale", this.widthHeightScale),
        this.videoMat.setFloat("bforceforceKeepContent", 1)) : this.fitMode == "cover" ? (this.widthHeightScale < 0 && (this.widthHeightScale = this.calWidthHeightScale()),
        this.videoMat.setFloat("tvWidthHeightScale", this.widthHeightScale),
        this.videoMat.setFloat("bforceforceKeepContent", -1)) : this.videoMat.setFloat("tvWidthHeightScale", -1)
    }
    async setVideo(e, t=!1, r=!0) 
    {
        return this.tvMeshs.length != 0 ? (
            logger.warn(`[Engine] Set Video. length!=0, mesh: ${this.meshPath}, src: ${e.src}`),

            new Promise((n,o)=>
            {
                if (!(e instanceof HTMLVideoElement))
                    return logger.error("[Engine] Error, param of setVideo must be a HTMLVideoElement"),
                    o(new XTvVideoElementError("[Engine] param of setVideo must be a HTMLVideoElement"));

                this.videoElement = e,
                
                r == !1 
                && (t == !1 || checkOS().isIOS) 
                && e.crossOrigin !== "anonymous" 
                && (e.crossOrigin = "anonymous", e.load()),

                this.videoElement.addEventListener("loadedmetadata", a=>{
                    this.videoElement.videoWidth > 0 ? this.videoMat.setFloat("mvWidthHeightScale", this.videoElement.videoWidth / this.videoElement.videoHeight) : this.videoMat.setFloat("mvWidthHeightScale", 16 / 9)
                }),
                this.videoTexture.updateURL(this.videoElement.src),

                n(this)
            })
        ) : (
            logger.warn(`[Engine] Set Video. length==0, mesh: ${this.meshPath}, src: ${e.src}`),

            this.meshPath == "" 
            ? (
                logger.error("[Engine] Error, television meshPath is empty."),
                Promise.reject(new XTvVideoElementError("[Engine] Error, television meshPath is empty."))
            ) 
            : this._scenemanager.urlTransformer(this.meshPath).then(n => new Promise((o,a) =>
                e instanceof HTMLVideoElement 
                ? (
                    this.videoElement = e,

                    r == !1 
                    && (t == !1 || checkOS().isIOS) 
                    && e.crossOrigin !== "anonymous"
                    && (e.crossOrigin = "anonymous", e.load()),

                    BABYLON.SceneLoader.LoadAssetContainerAsync("", n, this.scene, null, ".glb").then(s=>{
                        for (let u = s.materials.length - 1; u >= 0; --u) s.materials[u].dispose();

                        this.videoTexture = new BABYLON.VideoTexture("videoTex_" + Date.now(),e,this.scene,!1,!0,void 0,{
                            autoPlay: !0,
                            autoUpdateTexture: !0,
                            muted: !0
                        }),
                        this.videoTexture.vAng = this.vAng,
                        this.videoMat = new BABYLON.ShaderMaterial("videoMat_" + Date.now(),this.scene,{
                            vertexSource: tvVertex,
                            fragmentSource: tvFragment
                        },{
                            attributes: ["uv", "position"],
                            uniforms: ["view", "projection", "worldViewProjection", "world"]
                        }),
                        this.videoMat.setTexture("texture_video", this.videoTexture),
                        this.videoMat.setFloat("tvWidthHeightScale", -1),
                        this.videoMat.setFloat("mvWidthHeightScale", 16 / 9),
                        this.videoMat.setFloat("bforceforceKeepContent", -1),
                        this.videoMat.backFaceCulling = !1,
                        this.videoMat.sideOrientation = BABYLON.Mesh.FRONTSIDE,

                        this.videoElement.addEventListener("loadedmetadata", u=>{
                            this.videoElement.videoWidth > 0 
                            ? this.videoMat.setFloat("mvWidthHeightScale", this.videoElement.videoWidth / this.videoElement.videoHeight) 
                            : this.videoMat.setFloat("mvWidthHeightScale", 16 / 9)
                        });

                        const tvMeshs = [];
                        for (let u = 0; u < s.meshes.length; ++u)
                            s.meshes[u].visibility = 1,
                            s.meshes[u].isPickable = !0,
                            s.meshes[u].checkCollisions = !1,
                            s.meshes[u].material = this.videoMat,
                            "hasVertexAlpha"in s.meshes[u] && (s.meshes[u].hasVertexAlpha = !1),
                            this.scene.addMesh(s.meshes[u]),
                            tvMeshs.push(new XStaticMesh({
                                id: s.meshes[u].id,
                                mesh: s.meshes[u],
                                xtype: EMeshType.Tv
                            }));

                        this.changeTvFitMode(),
                        this.tvMeshs = tvMeshs,
                        this.toggle(!0),
                        o(this)
                    }).catch(s=>{
                        logger.error("[Engine] setVideo: create Tv by input mesh error! " + s),
                        a(new XTvModelError("[Engine] setVideo: create Tv by input mesh error! " + s))
                    })
                )
                : a(new XTvVideoElementError("[Engine] param of setVideo must be a HTMLVideoElement"))
            ))
        )
    }
    async setSameVideo(e, t="") {
        return e == null || e == null ? (logger.error("[Engine] setSameVideo: input material is null or undefined "),
        Promise.reject(new XTvModelError("[Engine] setSameVideo input material is null or undefined !"))) : this.tvMeshs.length != 0 && t == "" ? (logger.warn(`[Engine] Set mirror video. length!=0, mesh: ${this.meshPath}`),
        new Promise((r,n)=>{
            try {
                this.videoMat = e,
                this.tvMeshs.forEach(o=>{
                    o.setMaterial(e)
                }
                ),
                this.changeTvFitMode(),
                r(this)
            } catch (o) {
                logger.error("[Engine] setSameVideo: create Tv by input mesh error! " + o),
                n(new XTvModelError("[Engine] create Tv by input mesh error! " + o))
            }
        }
        )) : (t != "" && (this.meshPath = t,
        this.widthHeightScale = -1),
        this.meshPath == "" ? (logger.error("[Engine] Error, setSameVideo television meshPath is empty."),
        Promise.reject(new XTvVideoElementError("[Engine] Error, setSameVideo television meshPath is empty."))) : (logger.warn(`[Engine] Set mirror video. length==0, mesh: ${this.meshPath}`),
        this._scenemanager.urlTransformer(this.meshPath).then(r=>new Promise((n,o)=>(this.videoMat = e,
        e != null && e.getActiveTextures()[0] && (this.videoElement = e == null ? void 0 : e.getActiveTextures()[0].video),
        BABYLON.SceneLoader.LoadAssetContainerAsync("", r, this.scene, null, ".glb").then(a=>{
            for (let l = a.materials.length - 1; l >= 0; --l)
                a.materials[l].dispose();
            const s = [];
            for (let l = 0; l < a.meshes.length; ++l)
                a.meshes[l].visibility = 0,
                a.meshes[l].isPickable = !0,
                a.meshes[l].checkCollisions = !1,
                a.meshes[l].material = this.videoMat,
                "hasVertexAlpha"in a.meshes[l] && (a.meshes[l].hasVertexAlpha = !1),
                this.scene.addMesh(a.meshes[l]),
                s.push(new XStaticMesh({
                    id: a.meshes[l].id,
                    mesh: a.meshes[l],
                    xtype: EMeshType.Tv
                }));
            t != "" && this.cleanTv(!1, !1),
            this.tvMeshs = s,
            this.changeTvFitMode(),
            n(this)
        }
        ).catch(a=>{
            logger.error("[Engine] setSameVideo: create Tv by input mesh error! " + a),
            o(new XTvModelError("[Engine] create Tv by input mesh error! " + a))
        }
        ))))))
    }
    async changeTvModel(e="") {
        return e != "" && (this.meshPath = e,
        this.widthHeightScale = -1),
        this.meshPath == "" ? (logger.error("[Engine] Error,changeTvModel television meshPath is empty."),
        Promise.reject(new XTvVideoElementError("[Engine] Error, changeTvModel television meshPath is empty."))) : this.videoMat == null || this.videoMat == null ? (logger.error("[Engine] changeTvModel: videoMat is null or undefined! "),
        Promise.reject(new XTvModelError("[Engine] changeTvModel: videoMat is null or undefined!"))) : this._scenemanager.urlTransformer(this.meshPath).then(t=>new Promise((r,n)=>BABYLON.SceneLoader.LoadAssetContainerAsync("", t, this.scene, null, ".glb").then(o=>{
            for (let s = o.materials.length - 1; s >= 0; --s)
                o.materials[s].dispose();
            const a = [];
            for (let s = 0; s < o.meshes.length; ++s)
                o.meshes[s].visibility = 0,
                o.meshes[s].isPickable = !0,
                o.meshes[s].checkCollisions = !1,
                o.meshes[s].material = this.videoMat,
                "hasVertexAlpha"in o.meshes[s] && (o.meshes[s].hasVertexAlpha = !1),
                this.scene.addMesh(o.meshes[s]),
                a.push(new XStaticMesh({
                    id: o.meshes[s].id,
                    mesh: o.meshes[s],
                    xtype: EMeshType.Tv
                }));
            e != "" && this.cleanTv(!1, !1),
            this.tvMeshs = a,
            this.changeTvFitMode(),
            r(this)
        }
        ).catch(o=>{
            logger.error("[Engine] changeTvModel: create Tv by input mesh error! " + o),
            n(new XTvModelError("[Engine] changeTvModel: create Tv by input mesh error! " + o))
        }
        )))
    }
    calWidthHeightScale() {
        const e = [1e5, 1e5, 1e5]
          , t = [-1e5, -1e5, -1e5];
        for (let a = 0; a < this.tvMeshs.length; ++a)
            if (this.tvMeshs[a].mesh.name != "__root__") {
                const s = this.tvMeshs[a].mesh.getBoundingInfo().boundingBox.vectorsWorld;
                for (let l = 0; l < s.length; ++l)
                    e[0] > s[l].x && (e[0] = s[l].x),
                    e[1] > s[l].y && (e[1] = s[l].y),
                    e[2] > s[l].z && (e[2] = s[l].z),
                    t[0] < s[l].x && (t[0] = s[l].x),
                    t[1] < s[l].y && (t[1] = s[l].y),
                    t[2] < s[l].z && (t[2] = s[l].z);
                break
            }
        const r = t[0] - e[0]
          , n = t[1] - e[1]
          , o = t[2] - e[2];
        return Math.sqrt(r * r + o * o) / Math.abs(n)
    }
    cleanTv(e=!1, t=!0) {
        logger.warn("[Engine] cleanTV");
        for (let r = 0; r < this.tvMeshs.length; ++r)
            this.tvMeshs[r].dispose(e, t);
        this.tvMeshs = [],
        this.meshPath = ""
    }
}