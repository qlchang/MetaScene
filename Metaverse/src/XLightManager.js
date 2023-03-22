import Logger from "./Logger.js"

const logger = new Logger('LightManager')

export default class XLightManager {
    constructor(e) {
        E(this, "_scene");
        E(this, "_envTexture");
        E(this, "_shadowLight");
        E(this, "_shadowGenerator");
        E(this, "_avatarShadowMeshMap");
        E(this, "_cullingShadowObservers");
        E(this, "sceneManager");
        this.sceneManager = e,
        this._scene = this.sceneManager.Scene,
        this._envTexture = null,
        this.shadowLean = .1;
        const t = new BABYLON.Vector3(this.shadowLean,-1,0)
          , r = 1024;
        this._shadowLight = new BABYLON.DirectionalLight("AvatarLight",t,this._scene),
        this._shadowLight.shadowMaxZ = 5e3,
        this._shadowLight.intensity = 0,
        this.attachLightToCamera(this._shadowLight),
        this._shadowGenerator = new BABYLON.ShadowGenerator(r,this._shadowLight,!0),
        this._avatarShadowMeshMap = new Map,
        this._cullingShadowObservers = new Map
    }
    set shadowLean(e) {
        e = Math.min(e, 1),
        e = Math.max(e, -1),
        this._shadowLight && (this._shadowLight.direction = new BABYLON.Vector3(e,-1,0))
    }
    setIBL(e) {
        return new Promise((t,r)=>{
            this.sceneManager.urlTransformer(e).then(n=>{
                var o;
                if (n == ((o = this._envTexture) == null ? void 0 : o.url))
                    return t("env set success");
                this._envTexture != null && this.disposeIBL(),
                this._envTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(n, this._scene, ".env"),
                this._scene.environmentTexture = this._envTexture,
                this._envTexture.onLoadObservable.addOnce(()=>{
                    t("env set success"),
                    logger.info("env set success")
                }
                )
            }
            ).catch(()=>{
                r("env set fail")
            }
            )
        }
        )
    }
    disposeIBL() {
        this._envTexture == null ? logger.info("env not exist") : (this._envTexture.dispose(),
        this._envTexture = null,
        this._scene.environmentTexture = null,
        logger.info("env dispose success"))
    }
    removeShadow(e) {
        var t;
        if (this._avatarShadowMeshMap.has(e)) {
            this._avatarShadowMeshMap.delete(e),
            this._cullingShadowObservers.get(e) && (this._scene.onBeforeRenderObservable.remove(this._cullingShadowObservers.get(e)),
            this._cullingShadowObservers.delete(e));
            const r = e.rootNode;
            r && ((t = this._shadowGenerator) == null || t.removeShadowCaster(r))
        } else
            return
    }
    setShadow(e) {
        if (this._avatarShadowMeshMap.has(e))
            return;
        e.rootNode && this._avatarShadowMeshMap.set(e, e.rootNode.getChildMeshes());
        const t = 20
          , r = 10
          , n = this.cullingShadow(t, r, e);
        this._cullingShadowObservers.set(e, n)
    }
    cullingShadow(e, t, r) {
        let n = 0;
        const o = ()=>{
            var s, l;
            if (n == t) {
                const u = this._avatarShadowMeshMap.get(r)
                  , c = (s = r.rootNode) == null ? void 0 : s.getChildMeshes()
                  , h = this._scene.activeCamera;
                u == null || u.forEach(f=>{
                    var d;
                    (d = this._shadowGenerator) == null || d.removeShadowCaster(f, !1)
                }
                ),
                c == null || c.forEach(f=>{
                    var d;
                    (d = this._shadowGenerator) == null || d.addShadowCaster(f, !1)
                }
                ),
                h && r.rootNode && ((l = r.rootNode.position) == null ? void 0 : l.subtract(h.position).length()) > e && (c == null || c.forEach(f=>{
                    var d;
                    (d = this._shadowGenerator) == null || d.removeShadowCaster(f, !1)
                }
                )),
                c && this._avatarShadowMeshMap.set(r, c),
                n = 0
            } else
                n += 1
        }
        ;
        return this._scene.onBeforeRenderObservable.add(o)
    }
    attachLightToCamera(e) {
        const t = e
          , r = 15
          , n = ()=>{
            const o = this._scene.activeCamera;
            if (o) {
                const a = t.direction
                  , s = new BABYLON.Vector3(r * a.x,r * a.y,r * a.z)
                  , l = o.position;
                t.position = l.subtract(s)
            }
        }
        ;
        return t && this._scene.registerBeforeRender(n),
        n
    }
}