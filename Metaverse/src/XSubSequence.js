import {http2} from "./Http2.js"
import Logger from "./Logger.js"

const logger = new Logger('subSequence')

const DefaultUrlTransformer = async i=>typeof i != "string" ? (console.warn("url transformer error", i),
i) : i.startsWith("blob:") ? i : http2.get({
    url: i,
    useIndexedDb: !0,
    key: "url"
})

export default class XSubSequence {
    constructor(e, t, r=DefaultUrlTransformer) {
        E(this, "_scene");
        E(this, "_meshGroups");
        E(this, "_animGroup");
        E(this, "_particleGroups");
        E(this, "_materialGroups");
        E(this, "_spriteGroups");
        E(this, "_glowGroups");
        E(this, "_highLightGroups");
        E(this, "_endFrame");
        E(this, "_centerNode");
        E(this, "_rootDir");
        E(this, "_abosoluteUrl");
        E(this, "_name");
        E(this, "_pickable", !1);
        E(this, "urlTransformer");
        E(this, "onLoadedObserverable", new Observable);
        E(this, "onSubSequenceTransformationChangeObservable", new Observable);
        E(this, "onIntersectionObservable", new Observable);
        E(this, "_loaded");
        E(this, "_isStarted");
        E(this, "_isPaused");
        E(this, "_isDisposing", !1);
        E(this, "init", ()=>new Promise((e,t)=>{
            this.urlTransformer(this._abosoluteUrl).then(r=>{
                const n = new XMLHttpRequest;
                n.open("get", r),
                n.send(null),
                n.onload = ()=>{
                    if (n.status == 200) {
                        const o = JSON.parse(n.responseText);
                        this.load(o).then(()=>{
                            this.onLoadedObserverable.notifyObservers(this),
                            this._loaded = !0,
                            e()
                        }
                        , ()=>{
                            t(),
                            logger.error("subSequence: Load ${jsonBlob} json fail")
                        }
                        )
                    }
                }
                ,
                n.onerror = ()=>{
                    logger.error("http: Get ${jsonBlob} json fail"),
                    t()
                }
            }
            )
        }
        ));
        E(this, "play", async(e=!0)=>new Promise(t=>{
            if (this._animGroup.isPlaying && this._animGroup.stop(),
            this._particleGroups.forEach(r=>{
                var n;
                ((n = r.emitterNode) == null ? void 0 : n.getClassName()) == "Mesh" && r.emitterNode instanceof Mesh ? r.emitterNode.isEnabled() && r.start() : r.start()
            }
            ),
            this._animGroup.targetedAnimations.length == 0) {
                this.show();
                let r = 0;
                this._spriteGroups.forEach(n=>{
                    n.sprites.forEach(o=>{
                        o.toIndex > r && (r = o.toIndex)
                    }
                    )
                }
                ),
                this._spriteGroups.forEach(n=>{
                    n.sprites.forEach(o=>{
                        o.playAnimation(o.fromIndex, o.toIndex, e, o.delay, ()=>{
                            o.toIndex == r && (this._isPaused = !0,
                            this.hide(),
                            t())
                        }
                        )
                    }
                    )
                }
                )
            } else
                this._animGroup.play(e),
                this._spriteGroups.forEach(r=>{
                    r.sprites.forEach(n=>{
                        n.playAnimation(n.fromIndex, n.toIndex, e, n.delay)
                    }
                    )
                }
                ),
                e ? this._animGroup.onAnimationGroupLoopObservable.addOnce(()=>{
                    t()
                }
                ) : this._animGroup.onAnimationGroupEndObservable.addOnce(()=>{
                    this._spriteGroups.forEach(r=>{
                        r.sprites.forEach(n=>{
                            n.isVisible = !1,
                            n.isPickable = !1,
                            n.stopAnimation()
                        }
                        )
                    }
                    ),
                    t()
                }
                );
            this._isStarted = !0,
            this._isPaused = !1
        }
        ));
        E(this, "stop", ()=>{
            this._animGroup.stop(),
            this._particleGroups.forEach(e=>{
                e.systems.forEach(t=>{
                    t.stop()
                }
                )
            }
            ),
            this._spriteGroups.forEach(e=>{
                e.sprites.forEach(t=>{
                    t.stopAnimation()
                }
                )
            }
            ),
            this._isStarted = !1
        }
        );
        E(this, "clone", (e="Clone")=>{
            const t = new XSubSequence(this._scene,this._abosoluteUrl);
            return t._centerNode.name = e + "_" + this._centerNode.name,
            t._animGroup.name = e + "_" + this._animGroup.name,
            this._meshGroups.forEach(r=>{
                const n = r.clone(e + "_", t._centerNode)
                  , o = n.getChildren(void 0, !1);
                if (o.forEach(a=>{
                    a.setEnabled(!0)
                }
                ),
                o.push(n),
                n) {
                    const a = r.getChildren(void 0, !1);
                    a.push(r),
                    this.animGroup.targetedAnimations.forEach(s=>{
                        if (s.target instanceof Node$2) {
                            const l = a.indexOf(s.target);
                            l != -1 && t._animGroup.addTargetedAnimation(s.animation, o[l])
                        }
                    }
                    )
                }
            }
            ),
            t._loaded = !0,
            t
        }
        );
        E(this, "goToFrame", e=>{
            this._animGroup.start(!0, 1, e, e)
        }
        );
        E(this, "pause", ()=>{
            this._isPaused = !0,
            this._animGroup.pause()
        }
        );
        E(this, "reset", ()=>{
            this._animGroup.reset()
        }
        );
        E(this, "loadTrackToAnim", e=>{
            const t = Array();
            let r = !0;
            e.keyFrame.forEach(o=>{
                if (o.frame > this._endFrame && (this._endFrame = o.frame),
                o.value instanceof Array) {
                    const a = {
                        frame: o.frame,
                        value: new Vector3(0,0,0)
                    }
                      , s = new Vector3(o.value[0],o.value[1],o.value[2]);
                    a.value = s,
                    t.push(a)
                } else
                    t.push(o),
                    r = !1
            }
            ),
            e.loop == null && (e.loop = !1),
            e.index == null && (e.index = 0);
            let n = null;
            if ("blockName"in e) {
                const o = {
                    keyFrame: t,
                    blockName: e.blockName,
                    property: e.property,
                    targetName: e.targetName,
                    index: e.index,
                    loop: e.loop
                };
                n = this.transferTrackToAnim(o, r)
            } else {
                const o = {
                    keyFrame: t,
                    property: e.property,
                    targetName: e.targetName,
                    index: e.index,
                    loop: e.loop
                };
                n = this.transferTrackToAnim(o, r)
            }
            return n
        }
        );
        E(this, "transferTrackToAnim", (e,t)=>{
            let r = null;
            t ? (r = new Animation(e.targetName + "_" + e.property,e.property,DEFAULT_FRAME_RATE,Animation.ANIMATIONTYPE_VECTOR3,Animation.ANIMATIONLOOPMODE_CYCLE),
            r.setKeys(e.keyFrame)) : (r = new Animation(e.targetName + "_" + e.property,e.property,DEFAULT_FRAME_RATE,Animation.ANIMATIONTYPE_FLOAT,Animation.ANIMATIONLOOPMODE_CYCLE),
            r.setKeys(e.keyFrame));
            let n = null;
            return "blockName"in e ? n = {
                animation: r,
                blockName: e.blockName,
                targetName: e.targetName,
                nodeIndex: e.index,
                loop: e.loop
            } : n = {
                animation: r,
                targetName: e.targetName,
                nodeIndex: e.index,
                loop: e.loop
            },
            n
        }
        );
        t.indexOf("./") == 0 && (t = t.slice(2)),
        this._abosoluteUrl = t,
        this._name = t.split("/").slice(-1)[0].split(".")[0].split("_")[1],
        this._rootDir = t.split("/").slice(0, -1).join("/") + "/",
        this._scene = e,
        this._meshGroups = new Map,
        this._animGroup = new AnimationGroup("SubSeqAnim_",this._scene),
        this._particleGroups = new Map,
        this._materialGroups = new Map,
        this._glowGroups = new Map,
        this._highLightGroups = new Map,
        this._spriteGroups = new Map,
        this._endFrame = 0,
        this._centerNode = new BABYLON.TransformNode("__rootSubSeq__",e),
        this._loaded = !1,
        this._isPaused = !0,
        this._isStarted = !1,
        this._centerNode.setEnabled(!1),
        this.urlTransformer = r,
        this._centerNode.onAfterWorldMatrixUpdateObservable.add(()=>{
            this.onSubSequenceTransformationChangeObservable.notifyObservers(this)
        }
        ),
        this._animGroup.onAnimationGroupPlayObservable.add(()=>{
            this._particleGroups.forEach(n=>{
                n.systems.forEach(o=>{
                    o.isStarted() || o.start()
                }
                )
            }
            ),
            this.show()
        }
        ),
        this._animGroup.onAnimationGroupLoopObservable.add(()=>{
            this._particleGroups.forEach(n=>{
                n.systems.forEach(o=>{
                    o.isStarted() || o.start()
                }
                )
            }
            ),
            this.show()
        }
        ),
        this._animGroup.onAnimationGroupEndObservable.add(()=>{
            this.hide()
        }
        )
    }
    dispose() {
        this._isDisposing = !0,
        this._spriteGroups.forEach(e=>{
            e.dispose()
        }
        ),
        this._glowGroups.forEach(e=>{
            e.dispose()
        }
        ),
        this._highLightGroups.forEach(e=>{
            e.dispose()
        }
        ),
        this._particleGroups.forEach(e=>{
            XParticleManager.disposeParticleSysSet(e)
        }
        ),
        this._animGroup.stop(),
        this._animGroup.dispose(),
        this._meshGroups.forEach(e=>{
            e.getChildren(void 0, !1).forEach(t=>{
                var r, n;
                (t.getClassName() === "AbstractMesh" || t.getClassName() === "Mesh") && ((r = t.skeleton) == null || r.dispose(),
                (n = t.material) == null || n.dispose(!0, !0)),
                t.dispose(!0, !0)
            }
            ),
            e.dispose(!1, !0)
        }
        ),
        this._centerNode.dispose(!1, !0),
        this._materialGroups.forEach(e=>{}
        ),
        this._materialGroups.clear(),
        this._spriteGroups.clear(),
        this._glowGroups.clear(),
        this._highLightGroups.clear(),
        this._meshGroups.clear(),
        this._particleGroups.clear(),
        this._loaded = !1
    }
    get animGroup() {
        return this._animGroup
    }
    get name() {
        return this._name
    }
    get path() {
        return this._abosoluteUrl
    }
    get position() {
        return xversePosition2Ue4(this.pos)
    }
    get rotation() {
        return xverseRotation2Ue4(this.rot)
    }
    get scaling() {
        return this.scal
    }
    get pos() {
        return this._centerNode.position
    }
    get rot() {
        return this._centerNode.rotation
    }
    get scal() {
        return this._centerNode.scaling
    }
    get root() {
        return this._centerNode
    }
    get loaded() {
        return this._loaded
    }
    get isPlaying() {
        return this._animGroup ? this._animGroup.isPlaying : this._isStarted && !this._isPaused
    }
    get isStarted() {
        return this._animGroup ? this._animGroup.isStarted : this._isStarted
    }
    get isPickable() {
        return this._pickable
    }
    set isPickable(e) {
        this._meshGroups.forEach(t=>{
            t.getChildMeshes().forEach(r=>{
                r.isPickable = e
            }
            )
        }
        ),
        this._spriteGroups.forEach(t=>{
            t.isPickable = e,
            t.sprites.forEach(r=>{
                r.isPickable = e
            }
            )
        }
        ),
        this._pickable = e
    }
    addAnimation(e) {
        this._animGroup.addTargetedAnimation(e, this._centerNode),
        this._spriteGroups.forEach(t=>{
            t.sprites.forEach(r=>{
                this._animGroup.addTargetedAnimation(e, r)
            }
            )
        }
        )
    }
    setStartFrame(e) {
        this._animGroup.stop(),
        this._animGroup.targetedAnimations.forEach(t=>{
            const r = t.animation.getKeys();
            r.forEach(n=>{
                e + r[0].frame > 0 ? n.frame += e : n.frame -= r[0].frame
            }
            )
        }
        )
    }
    lookAt(e) {
        ue4Position2Xverse(e) && this.root.lookAt(ue4Position2Xverse(e))
    }
    setPosition(e) {
        this.setPositionVector(ue4Position2Xverse(e))
    }
    setPositionVector(e) {
        this._centerNode.position = e,
        this._particleGroups.forEach(t=>{
            t.emitterNode == null || t.emitterNode instanceof Vector3 ? t.emitterNode = e : this._scene.getMeshByName(t.emitterNode.name) || (t.emitterNode = e)
        }
        ),
        this._spriteGroups.forEach(t=>{
            t.sprites.forEach((r,n)=>{
                r.position = e
            }
            )
        }
        )
    }
    setScaling(e) {
        this.setScalingVector(ue4Scaling2Xverse(e))
    }
    setScalingVector(e) {
        var t;
        this._centerNode.scaling = e,
        (t = this._particleGroups) == null || t.forEach(r=>{
            r.systems.forEach(n=>{
                XParticleManager.scalingInPlace(n, e.x)
            }
            )
        }
        ),
        this._spriteGroups.forEach(r=>{
            r.sprites.forEach(n=>{
                n.size *= e.x
            }
            )
        }
        )
    }
    setRotation(e) {
        this.setRotationVector(ue4Rotation2Xverse(e))
    }
    setRotationVector(e) {
        this._centerNode.rotation = e
    }
    hide() {
        this._centerNode.setEnabled(!1),
        this._particleGroups.forEach(e=>{
            e.systems.forEach(t=>{
                t.isStarted() && t.stop()
            }
            )
        }
        ),
        this._spriteGroups.forEach(e=>{
            e.sprites.forEach(t=>{
                t.isVisible = !1
            }
            )
        }
        )
    }
    show() {
        this._centerNode.setEnabled(!0),
        this._centerNode.getChildren().forEach(e=>{
            e.setEnabled(!0),
            e.getChildMeshes().forEach(t=>{
                t.setEnabled(!0)
            }
            )
        }
        ),
        this._particleGroups.forEach(e=>{
            e.systems.forEach(t=>{
                t.start()
            }
            )
        }
        ),
        this._spriteGroups.forEach(e=>{
            e.sprites.forEach(t=>{
                t.isVisible = !0
            }
            )
        }
        )
    }
    get totalFrame() {
        return this._endFrame
    }
    load(e) {
        return new Promise((t,r)=>{
            const n = e.Mesh
              , o = e.Sprite
              , a = e.Material
              , s = e.Glow
              , l = e.HighLight
              , u = e.Particle
              , c = e.MeshTrack
              , h = e.ParticleTrack
              , f = e.MaterialTrack;
            this._animGroup.name += e.Type;
            const d = Date.now();
            this._centerNode.name += e.Type;
            const _ = new Array
              , g = new Array;
            n != null && n.forEach(m=>{
                _.push(this.loadMesh(m))
            }
            ),
            o != null && o.forEach(m=>{
                g.push(this.loadSprite(m))
            }
            ),
            Promise.all(_).then(()=>{
                a != null && a.forEach(m=>{
                    g.push(this.loadMaterial(m))
                }
                ),
                u != null && u.forEach(m=>{
                    g.push(this.loadParticle(m))
                }
                ),
                Promise.all(g).then(()=>{
                    if (this._isDisposing) {
                        const v = Date.now() - d;
                        logger.info(`subSequence: Load ${e.Type} takes ${v} ms`),
                        t(this);
                        return
                    }
                    if (s != null)
                        for (const v of s)
                            this.loadGlow(v);
                    if (l != null)
                        for (const v of l)
                            this.loadHighLight(v);
                    c != null && c.forEach(v=>{
                        const y = this._meshGroups.get(v.targetName);
                        if (y != null) {
                            const b = this.loadTrackToAnim(v);
                            ROOT_MESH_ANIM_PROPERTY.indexOf(b.animation.targetProperty) == -1 ? y.getChildMeshes().forEach(T=>{
                                b.animation.targetProperty in T && this._animGroup.addTargetedAnimation(b.animation, T)
                            }
                            ) : this._animGroup.addTargetedAnimation(b.animation, y)
                        }
                    }
                    ),
                    h != null && h.forEach(v=>{
                        var C;
                        const y = v.index
                          , b = v.targetName
                          , T = (C = this._particleGroups.get(b)) == null ? void 0 : C.systems[y];
                        if (T != null) {
                            const A = this.loadTrackToAnim(v);
                            this._animGroup.addTargetedAnimation(A.animation, T)
                        }
                    }
                    ),
                    f != null && f.forEach(v=>{
                        const y = this._materialGroups.get(v.targetName);
                        if (y) {
                            const b = y[0];
                            if (b != null)
                                if (b.getBlockByName(v.blockName) != null) {
                                    const T = this.loadTrackToAnim(v);
                                    y == null || y.forEach(C=>{
                                        this._animGroup.addTargetedAnimation(T.animation, C.getBlockByName(v.blockName))
                                    }
                                    )
                                } else
                                    console.error("property " + v.property + "is not in " + b.name)
                        }
                    }
                    );
                    const m = Date.now() - d;
                    logger.info(`subSequence: Load ${e.Type} takes ${m} ms`),
                    t(this)
                }
                , ()=>{
                    logger.error(`subSequence: Load ${e.Type} fail`),
                    r()
                }
                )
            }
            , ()=>{
                r()
            }
            )
        }
        )
    }
    loadMesh(e) {
        return new Promise((t,r)=>{
            const n = this._rootDir + e.uri;
            this.urlTransformer(n).then(o=>{
                if (this._isDisposing) {
                    t();
                    return
                }
                SceneLoader.LoadAssetContainer("", o, this._scene, a=>{
                    if (this._isDisposing) {
                        a.removeAllFromScene(),
                        t();
                        return
                    }
                    a.animationGroups.forEach(l=>{
                        l.stop()
                    }
                    ),
                    a.animationGroups.length != 0 && (a.animationGroups.forEach(l=>{
                        l.targetedAnimations.forEach(u=>{
                            this._animGroup.addTargetedAnimation(u.animation, u.target)
                        }
                        ),
                        l.dispose()
                    }
                    ),
                    a.animationGroups = [],
                    a.animations = [],
                    a.materials = []);
                    const s = new BABYLON.TransformNode("__root__" + e.name,this._scene);
                    if (e.uri.split(".")[1] == "glb")
                        a.meshes[0].parent = s;
                    else if (e.uri.split(".")[1] == "obj") {
                        const l = new BABYLON.TransformNode("__root__",this._scene);
                        a.meshes.forEach(u=>{
                            u.parent = l,
                            u.Type = MESH_TAG
                        }
                        ),
                        l.parent = s
                    }
                    s.getChildMeshes().forEach(l=>{
                        e.isPickable != null ? l.isPickable = e.isPickable : l.isPickable = !1,
                        l.xtype = "XSubSequence"
                    }
                    ),
                    this._meshGroups.set(e.name, s),
                    s.parent = this._centerNode,
                    a.addAllToScene(),
                    t()
                }
                , ()=>{}
                , ()=>{
                    logger.error("subSequence:Load effect mesh fail"),
                    logger.error(`Effect Mesh ${e.name} load error`),
                    r()
                }
                , ".glb")
            }
            , ()=>{
                logger.error("http:Get effect mesh fail"),
                logger.error(`Effect Mesh ${e.name} load error`),
                r()
            }
            )
        }
        )
    }
    loadSprite(e) {
        return new Promise((t,r)=>{
            if (this._isDisposing) {
                t();
                return
            }
            const n = this._rootDir + e.uri;
            if (e.uri !== "") {
                e.name;
                const o = new XMLHttpRequest;
                o.open("get", n),
                o.send(null),
                o.onload = ()=>{
                    if (o.status == 200) {
                        const a = JSON.parse(o.responseText)
                          , s = XSpriteManager.Parse(a, this._scene, this._rootDir);
                        s.sprites.forEach(l=>{
                            l.stopAnimation()
                        }
                        ),
                        this._spriteGroups.set(e.name, s),
                        t()
                    } else
                        logger.error("subSequence:Load effect sprite fail"),
                        logger.error(`Effect Sprite ${e.name} load error`),
                        r()
                }
            }
        }
        )
    }
    loadMaterial(e) {
        return new Promise((t,r)=>{
            if (this._isDisposing) {
                t();
                return
            }
            const n = this._rootDir + e.uri;
            if (e.uri !== "") {
                const o = e.name
                  , a = new NodeMaterial(`material_${o}`,this._scene,{
                    emitComments: !1
                });
                a.backFaceCulling = !1,
                this.urlTransformer(n).then(s=>{
                    if (this._isDisposing) {
                        a.dispose(!1, !0, !1),
                        t();
                        return
                    }
                    a.loadAsync(s).then(()=>{
                        if (this._isDisposing) {
                            a.dispose(!0, !0, !1),
                            t();
                            return
                        }
                        a.build(!1);
                        const l = new Array;
                        let u = !1;
                        for (let c = 0; c < e.meshName.length; c++)
                            this._meshGroups.forEach(h=>{
                                h.getChildMeshes().forEach(f=>{
                                    var d;
                                    if (f.name === e.meshName[c]) {
                                        u = !0,
                                        (d = f.material) == null || d.dispose(!0, !0);
                                        const _ = f;
                                        if (_.skeleton == null) {
                                            const g = a;
                                            _.material = g,
                                            l.push(g)
                                        } else if (_.numBoneInfluencers = 4,
                                        _.computeBonesUsingShaders = !0,
                                        c == 0) {
                                            const g = a;
                                            _.material = g,
                                            l.push(g)
                                        } else {
                                            const g = a.clone(`material_${o}` + String(c), !1);
                                            _.material = g,
                                            l.push(g)
                                        }
                                    }
                                }
                                )
                            }
                            );
                        u ? this._materialGroups.set(e.name, l) : a.dispose(!0, !0),
                        t()
                    }
                    , ()=>{
                        logger.error("http:Get effect Material fail"),
                        logger.error(`Effect NodeMaterial ${o} load error`),
                        r()
                    }
                    )
                }
                )
            }
        }
        )
    }
    async loadGlow(e) {
        const t = new GlowLayer(e.name,this._scene,{
            blurKernelSize: e.blurKernelSize
        });
        t.intensity = e.intensity,
        e.meshName.forEach(r=>{
            const n = this._scene.getMeshByName(r);
            n != null && t.addIncludedOnlyMesh(n)
        }
        ),
        this._glowGroups.set(e.name, t)
    }
    loadHighLight(e) {
        const t = new HighlightLayer(e.name,this._scene);
        e.meshName.forEach(r=>{
            const n = this._scene.getMeshByName(r);
            if (n != null) {
                const o = new Color3(e.color[0],e.color[1],e.color[2]);
                t.addMesh(n, o)
            }
        }
        ),
        this._highLightGroups.set(e.name, t)
    }
    loadParticle(e) {
        return new Promise((t,r)=>{
            const n = this._rootDir + e.rootDir
              , o = new XParticleManager(this._scene);
            this.urlTransformer(n + e.uri).then(a=>{
                if (this._isDisposing) {
                    t();
                    return
                }
                o.load(n, e.uri, e.name).then(s=>{
                    if (this._isDisposing) {
                        r();
                        return
                    }
                    this._particleGroups.set(e.name, s),
                    t()
                }
                , ()=>{
                    logger.error(`SubSequence: ${e.name} particle load fail`),
                    r()
                }
                )
            }
            , ()=>{
                logger.error(`http: ${n + e.uri} load fail`),
                r()
            }
            )
        }
        )
    }
}