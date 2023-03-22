import Logger from "./Logger.js"

const logger = new Logger('CharacterLoader')

export default class XAvatarLoader {
    constructor() {
        this.containers = new Map,
        this.meshes = new Map,
        this.animations = new Map,
        this.aniPath = new Map,
        this.binPath = new Map,
        this.texPath = new Map,
        this.matPath = new Map,
        this.mshPath = new Map,
        this.rootPath = new Map,
        this.meshTexList = new Map,
        this._enableIdb = !0,
        this._mappings = new Map,
        this._sharedTex = new Map,
        this.avaliableAnimation = new Map,
        this.enableShareTexture = !0,
        this.enableShareAnimation = !0,
        this.fillEmptyLod = !0,
        this.pendantMap = new Map;
        const e = new BABYLON.GLTFFileLoader;
        BABYLON.SceneLoader.RegisterPlugin(e),
        e.preprocessUrlAsync = function(i) {
            const o = avatarLoader._mappings.get(i);
            return o ? Promise.resolve(o) : Promise.resolve(i)
        }
    }
    _parsePendant(e, i) {
        if (!e || !i) {
            logger.error("[Engine] invalid id or url when loading pendant");
            return
        }
        const o = ".zip"
          , s = i.replace(o, "/");
        this.pendantMap.set(e, s)
    }
    pullAndLoadXObject(e, i) {
        const o = avatarLoader.pendantMap.get(i);
        return Tools.LoadFileAsync(o + `${i}.json`, !1).then(s=>{
            if (!(s instanceof ArrayBuffer))
                return LoadXObject(o, s).then(c=>c)
        }
        )
    }
    getParsedUrl(e, i, o, s="") {
        return new Promise((c,d)=>{
            if (!o || o.indexOf(".zip") === -1)
                return c(o);
            const _ = this.rootPath.get(o);
            if (_)
                return c(_);
            {
                const b = ".zip"
                  , k = o.replace(b, "") + COMPONENT_LIST_PREFIX;
                e.urlTransformer(k, !0).then(j=>{
                    if (!j)
                        return d("Loading Failed");
                    new Response(j).json().then($=>{
                        var tt, rt, it, nt, ot, at, st;
                        const _e = o.replace(b, "")
                          , et = _e + ((tt = $ == null ? void 0 : $.components) == null ? void 0 : tt.url.replace("./", ""));
                        if (this.rootPath.set(o, et),
                        $.components ? ($.components.url && this.mshPath.set(i, _e + "/" + ((rt = $ == null ? void 0 : $.components) == null ? void 0 : rt.url.replace("./", ""))),
                        $.components.url_lod2 && this.mshPath.set(i + "_" + avatarSetting.lod[1].level, _e + "/" + ((it = $ == null ? void 0 : $.components) == null ? void 0 : it.url_lod2.replace("./", ""))),
                        $.components.url_lod4 && this.mshPath.set(i + "_" + avatarSetting.lod[2].level, _e + "/" + ((nt = $ == null ? void 0 : $.components) == null ? void 0 : nt.url_lod4.replace("./", "")))) : ($.meshes.url && this.mshPath.set(i, _e + "/" + ((ot = $ == null ? void 0 : $.meshes) == null ? void 0 : ot.url.replace("./", ""))),
                        $.meshes.url_lod2 && this.mshPath.set(i + "_" + avatarSetting.lod[1].level, _e + "/" + ((at = $ == null ? void 0 : $.meshes) == null ? void 0 : at.url_lod2.replace("./", ""))),
                        $.meshes.url_lod4 && this.mshPath.set(i + "_" + avatarSetting.lod[2].level, _e + "/" + ((st = $ == null ? void 0 : $.meshes) == null ? void 0 : st.url_lod4.replace("./", "")))),
                        $.materials && $.materials.forEach(ut=>{
                            const ct = _e + "/" + ut.url;
                            this.matPath.set(ut.name, ct)
                        }
                        ),
                        $.bin) {
                            const ut = _e + "/" + $.bin.url;
                            this.binPath.set(i, ut);
                            const ct = _e + "/" + $.bin.url_lod2;
                            this.binPath.set(i + "_" + avatarSetting.lod[1].level, ct);
                            const lt = _e + "/" + $.bin.url_lod4;
                            this.binPath.set(i + "_" + avatarSetting.lod[2].level, lt)
                        }
                        return $.textures && $.textures.forEach(ut=>{
                            const ct = _e + "/" + ut.url;
                            this.texPath.set(ut.url, ct);
                            const lt = this.meshTexList.get($.components.url);
                            ut.type === "png" && (lt ? lt.find(ft=>ft === ut.name) || lt.push(ut.url) : this.meshTexList.set(i, [ut.name]))
                        }
                        ),
                        c(et)
                    }
                    ).catch($=>{
                        d(`[Engine] parse json file error,${$}`)
                    }
                    )
                }
                ).catch(j=>{
                    d(`[Engine] ulrtransform error, cannot find resource in db,${j}`)
                }
                )
            }
        }
        )
    }
    async parse(e, i) {
        const o = [];
        i.forEach(s=>{
            this._setAnimationList(s.id, s.animations),
            o.push(this.getParsedUrl(e, s.id, s.url)),
            s.components.forEach(c=>{
                c.name === "pendant" ? c.units.forEach(d=>{
                    this._parsePendant(d.id, d.url)
                }
                ) : c.units.forEach(d=>{
                    o.push(this.getParsedUrl(e, d.name, d.url))
                }
                )
            }
            )
        }
        ),
        await Promise.all(o)
    }
    _setAnimationList(e, i) {
        i ? i.forEach(o=>{
            this.aniPath.set(e + "_" + o.name, o.url)
        }
        ) : logger.error("[Engine] no animation list exist, please check config for details")
    }
    disposeContainer() {
        const e = [];
        this.containers.forEach((i,o)=>{
            if (i.xReferenceCount < 1) {
                if (this.enableShareTexture && i.textures.length > 0) {
                    for (let s = 0; s < i.textures.length; ++s)
                        i.textures[s].xReferenceCount != null ? i.textures[s].xReferenceCount-- : i.textures[s].xReferenceCount = 0,
                        i.textures[s]._parentContainer = null;
                    i.textures = []
                }
                e.push(o)
            }
        }
        ),
        e.forEach(i=>{
            var o, s;
            (o = this.containers.get(i)) == null || o.removeAllFromScene(),
            (s = this.containers.get(i)) == null || s.dispose(),
            this.containers.delete(i)
        }
        ),
        this._sharedTex.forEach((i,o)=>{
            i.xReferenceCount == 0 && (i.dispose(),
            this._sharedTex.delete(o))
        }
        )
    }
    set enableIdb(e) {
        this._enableIdb = e
    }
    getGlbPath(e) {
        return this.aniPath.get(e + ".glb")
    }
    getGltfPath(e) {
        return this.mshPath.get(e + ".gltf")
    }
    getPngUrl(e) {
        return this.texPath.get(e + ".png")
    }
    getMeshUrl(e) {
        return this.mshPath.get(e)
    }
    _getSourceKey(e, i) {
        return i && avatarSetting.lod[i] ? e + avatarSetting.lod[i].fileName.split(".")[0] : e
    }
    _getAnimPath(animationName, avatarType) {
        let o = this.aniPath.get(avatarType + "_animations_" + avatarType.split("_")[1]);
        return o || (o = this.aniPath.get(avatarType + "_" + animationName)),
        o
    }
    load(e, i, o, s) {
        return this.loadGlb(e, i, o).then(c=>c || Promise.reject("[Engine] container load failed")).catch(()=>Promise.reject("[Engine] container load failed"))
    }
    _searchAnimation(e, i) {
        let o;
        return this.containers.forEach((s,c)=>{
            const d = i.split("_")[0];
            c.indexOf(d) != -1 && c.indexOf(e) != -1 && (o = s)
        }
        ),
        o
    }
    loadAnimRes(sceneManager, animationName, avatarType) {
        const aniModelPath = this._getAnimPath(animationName, avatarType)
          , aniKey = getAnimationKey(animationName, avatarType);
        return aniModelPath && this.containers.get(aniModelPath) 
        ? Promise.resolve(this.containers.get(aniModelPath)) 
        : aniModelPath
            ? this._loadGlbFromBlob(sceneManager, aniKey, aniModelPath).then(d=>
                d.animationGroups.length == 0 
                ? (
                    this.containers.delete(aniKey),
                    d.dispose(),
                    Promise.reject("container does not contains animation data")
                ) 
                : d) 
            : Promise.reject("no such url")
    }
    loadGlb(e, i, o) {
        let s = this.getMeshUrl(this._getSourceKey(i, o));
        !s && this.fillEmptyLod && (
            o = 0,
            s = this.getMeshUrl(this._getSourceKey(i, o))
        )
        return s && this.containers.get(s) 
            ? Promise.resolve(this.containers.get(s)) 
            : s 
                ? this._enableIdb 
                    ? this._loadGlbFromBlob(e, this._getSourceKey(i, o), s) 
                    : this._loadGlbFromUrl(e, this._getSourceKey(i, o), s) 
                : Promise.reject("no such url")
    }
    loadGltf(e, i, o, s) {
        const c = this._getSourceKey(i, o || 0);
        let d = this.getGltfPath(c);
        !d && this.fillEmptyLod && (d = this.getGltfPath(i))
        return d && this.containers.get(d) 
            ? Promise.resolve(this.containers.get(d)) 
            : this._enableIdb 
                ? this._loadGltfFromBlob(e, i, o, s) 
                : d 
                    ? this._loadGltfFromUrl(e, i, d.replace(i + ".gltf", "")) 
                    : Promise.reject()
    }
    loadSubsequence() {}
    loadVAT() {}
    getResourceName(e) {
        return this.meshTexList.get(e)
    }
    _loadGltfFromUrl(e, i, o) {
        return BABYLON.SceneLoader.LoadAssetContainerAsync(o, i + ".gltf", e.Scene, null, ".gltf")
    }
    _loadGlbFromBlob(sceneManager, i, aniModelPath) {
        return sceneManager.urlTransformer(aniModelPath)
        .then(path=>BABYLON.SceneLoader.LoadAssetContainerAsync("", path, sceneManager.Scene, null, ".glb").then(model => {
            if (model) {
                if (this.containers.get(aniModelPath))
                    return model.dispose(),
                    this.containers.get(aniModelPath);
                model.addAllToScene()
                if (this.enableShareTexture && model.textures.length > 0) {
                    const d = [];
                    let hasSameTex = false;
                    model.meshes.forEach(mesh=>{
                        if (mesh.material) {
                            const albedoTexture = mesh.material._albedoTexture;
                            if (albedoTexture) {
                                let albedoTexName = albedoTexture.name;
                                albedoTexName = albedoTexName.replace(" (Base Color)", "").split(".")[0];
                                const oldTex = this._sharedTex.get(albedoTexName);
                                oldTex ? (
                                    hasSameTex = true,
                                    mesh.material._albedoTexture = oldTex,
                                    d.push(oldTex),
                                    oldTex._parentContainer = model,
                                    oldTex.xReferenceCount++
                                ) : (
                                    this._sharedTex.set(albedoTexName, albedoTexture),
                                    model.textures[0].xReferenceCount = 1
                                )
                            }
                        }
                    })
                    hasSameTex && (
                        model.textures.forEach(tex=>{
                            sceneManager.Scene.removeTexture(tex)
                            // tex.dispose()      // zeg 这个加上会导致贴图丢失
                        }),
                        model.textures = d
                    )
                }
                model.xReferenceCount = 0
                model.meshes.forEach(mesh=>{
                    mesh.setEnabled(false)
                })
                this.containers.set(aniModelPath, model)
                return Promise.resolve(model)
            } else
                return Promise.reject("glb file load failed")
        }
        ))
    }
    _loadGlbFromUrl(e, i, o) {
        return BABYLON.SceneLoader.LoadAssetContainerAsync("", o, e.Scene, null, ".glb").then(s=>s ? (s.addAllToScene(),
        s.meshes.forEach(c=>{
            c.setEnabled(!1)
        }
        ),
        this.enableShareTexture && s.textures.length > 0 ? (s.meshes.forEach(c=>{
            if (c.material) {
                const d = c.material._albedoTexture;
                if (d) {
                    let _ = d.name;
                    _ = _.replace(" (Base Color)", "").split(".")[0];
                    const b = this._sharedTex.get(_);
                    b ? (c.material._albedoTexture = b,
                    b.xReferenceCount++) : (this._sharedTex.set(_, d),
                    s.textures[0].xReferenceCount = 1)
                }
            }
        }
        ),
        s.xReferenceCount = 0,
        this.containers.set(o, s),
        Promise.resolve(s)) : Promise.reject("glb file load failed"),
        s.xReferenceCount = 0,
        this.containers.set(o, s),
        Promise.resolve(s)) : Promise.reject("glb file load failed"))
    }
    _loadGltfFromBlob(e, i, o, s) {
        return new Promise((c,d)=>{
            const _ = [];
            let b = this._getSourceKey(i, o)
              , k = this.getGltfPath(b);
            if (!k && this.fillEmptyLod && (o = 0,
            b = this._getSourceKey(i, o),
            k = this.getGltfPath(b)),
            !k)
                return d(`[Engine] gltf path incorrect ${b},cancel.`);
            const j = this.mshPath.get(b + ".gltf");
            if (!j)
                return d("cannot find asset mshPath");
            const $ = this.binPath.get(b + ".bin");
            if (!$)
                return d("cannot find asset binPath");
            if (!s) {
                const tt = this.meshTexList.get(i);
                if (!tt || tt.length == 0)
                    return d("cannot find texture");
                s = tt[0]
            }
            const _e = this.texPath.get(s + ".png");
            if (!_e)
                return d();
            const et = this.texPath.get(s + "-astc.ktx");
            if (!et)
                return d();
            _.push(this._blobMapping(e, j)),
            _.push(this._blobMapping(e, $)),
            _.push(this._blobMapping(e, _e)),
            _.push(this._blobMapping(e, et)),
            Promise.all(_).then(()=>{
                const tt = k.replace(b + ".gltf", "");
                BABYLON.SceneLoader.LoadAssetContainerAsync(tt, b + ".gltf", e.Scene, null, ".gltf").then(rt=>{
                    var nt;
                    this.containers.set(k, rt),
                    rt.addAllToScene(),
                    rt.meshes.forEach(ot=>{
                        ot.setEnabled(!1)
                    }
                    );
                    const it = this._sharedTex.get(i);
                    it ? ((nt = rt.meshes[1].material._albedoTexture) == null || nt.dispose(),
                    rt.meshes[1].material._albedoTexture = it) : this._sharedTex.set(i, rt.meshes[1].material._albedoTexture),
                    c(rt)
                }
                )
            }
            )
        }
        )
    }
    _blobMapping(e, i) {
        return new Promise((o,s)=>{
            e.urlTransformer(i).then(c=>c ? (this._mappings.set(i, c),
            o(i)) : s(`[Engine] url urlTransformer parse error ${i}`))
        }
        )
    }
}

const avatarLoader = new XAvatarLoader();
export { avatarLoader };