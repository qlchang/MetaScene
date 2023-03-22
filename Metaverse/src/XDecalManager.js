export default class XDecalManager {
    constructor(e) {
        E(this, "scene");
        E(this, "_decal");
        E(this, "_mat");
        E(this, "_sharedMat");
        E(this, "_scenemanager");
        this._decal = new Map,
        this._mat = new Map,
        this._sharedMat = new Map,
        this._scenemanager = e,
        this.scene = e.Scene
    }
    get decals() {
        return Array.from(this._decal.values())
    }
    getMesh() {
        return this._decal
    }
    async addDecal(e) {
        const {id: t, meshPath: r, skinInfo: n="default"} = e;
        return this._decal.get(t) ? (logger.warn(`[Engine] Cannot add decal with an existing id: [${t}], meshPath: ${r}, skinInfo:${n}`),
        Promise.resolve(!0)) : (logger.info(`[Engine] addDecal wiht id:[${t}], meshPath: ${r}, skinInfo:${n}`),
        new Promise((o,a)=>this._scenemanager.urlTransformer(r).then(s=>new Promise((l,u)=>{
            if (this._decal.get(t))
                l(!0);
            else {
                const c = new XDecal({
                    id: t,
                    scene: this.scene,
                    meshPath: s,
                    skinInfo: n
                });
                this._decal.set(t, c),
                c.loadModel().then(()=>{
                    l(!0)
                }
                ).catch(h=>{
                    logger.error(`[Engine] addDecal Error! id: [${t}], meshpath:${r}, skin: ${n}. ${h}`),
                    u(new XDecalError(`[Engine] addDecal Error! id: [${t}], meshpath:${r}, skin: ${n}. ${h}`))
                }
                )
            }
        }
        )).then(s=>{
            s == !0 ? o(!0) : a(!1)
        }
        ).catch(s=>{
            logger.error(`[Engine] Add Decal error! id: [${t}], meshpath:${r}, skin:${n}. ${s}`),
            a(new XDecalError(`[Engine] addDecal  error! id: [${t}], meshpath:${r}, skin:${n}. ${s}`))
        }
        )))
    }
    setDecalTexture(e) {
        const {id: t, buffer: r, isDynamic: n=!1, width: o=1100, height: a=25, slots: s=1, visibleSlots: l=1} = e
          , u = !0;
        return logger.info(`[Engine] setDecalTexture wiht id:[${t}]`),
        new Promise((c,h)=>{
            const f = this._decal.get(t);
            if (f != null)
                if (this._mat.get(t) != null)
                    this.changeDecalTexture({
                        id: t,
                        buffer: r,
                        isUrl: u,
                        isDynamic: n,
                        width: o,
                        height: a,
                        slots: s,
                        visibleSlots: l
                    }),
                    c(!0);
                else {
                    const d = new XDecalMaterial(t,this.scene);
                    d.setTexture(r, u, n, o, a, s, l).then(()=>{
                        f.setMat(d.getMat()),
                        this._decal.set(t, f),
                        this._mat.set(t, d),
                        c(!0)
                    }
                    ).catch(_=>{
                        logger.error("[Engine] setDecalTexture Error! " + _),
                        h(new XDecalTextureError(`[Engine] decal set texture error! ${_}`))
                    }
                    )
                }
            else
                logger.error("[Engine] Error! decal id: [" + t + "] is not find!"),
                h(new XDecalTextureError(`[Engine] decal id: [${t}] is not find!`))
        }
        )
    }
    async shareDecal(e) {
        const {idTar: t, meshPath: r, idSrc: n, skinInfo: o="default"} = e;
        return this._decal.has(n) && !this._decal.has(t) && this._mat.has(n) && !this._mat.has(t) ? (logger.info(`[Engine] shareDecal wiht idTar:[${t}], idSrc:[${n}], skinInfo: ${o}, meshPath: ${r}`),
        new Promise((a,s)=>this._scenemanager.urlTransformer(r).then(l=>{
            const u = new XDecal({
                id: t,
                scene: this.scene,
                meshPath: l,
                skinInfo: o
            })
              , c = this._mat.get(n);
            c != null && (u.setMat(c.getMat()),
            u.sourceMatId = n,
            this._decal.set(t, u),
            this.addSharedMatCount(n)),
            a(!0)
        }
        ).catch(l=>{
            s(new XDecalError(`[Engine] decal shareDecal error! ${l}`))
        }
        ))) : (logger.error(`[Engine] shareDecal Error. idSrc: [${n}] not exist! or idTar: [${t}] exists!`),
        Promise.reject(`[Engine] shareDecal Error. idSrc: [${n}] not exist! or idTar: [${t}] exists!`))
    }
    async changeDecalModel(e) {
        const {id: t, meshPath: r} = e
          , n = this._decal.get(t);
        return new Promise((o,a)=>n != null ? (logger.info(`[Engine] changeDecalModel id:${t}`),
        n.changeModel(r).then(()=>{
            this._decal.set(t, n),
            o(!0)
        }
        )) : (logger.warn(`[Engine] changeDecalModel id:${t} is not exist`),
        a(`[Engine] changeDecalModel id:${t} is not exist`)))
    }
    changeDecalTexture(e) {
        const {id: t, buffer: r, isUrl: n=!1, isDynamic: o=!1, width: a=1110, height: s=25, slots: l=1, visibleSlots: u=1} = e
          , c = this._mat.get(t);
        c != null && this._decal.has(t) ? (c.changeTexture(r, n, o, a, s, l, u),
        this._mat.set(t, c)) : logger.error(`[Engine] changeDecalTexture Error. id:${t} is not exist`)
    }
    deleteDecal(e) {
        var t, r;
        if (this._decal.has(e)) {
            const n = this._decal.get(e);
            n != null && n.cleanMesh(),
            this._sharedMat.get(e) != null ? this.minusSharedMatCount(e) : this._mat.get(e) != null ? ((t = this._mat.get(e)) == null || t.cleanTexture(),
            this._mat.delete(e)) : ((r = n.sourceMatId) == null ? void 0 : r.length) > 0 && this.minusSharedMatCount(n.sourceMatId),
            this._decal.delete(e)
        }
    }
    deleteDecalBySkinInfo(e) {
        for (const [t,r] of this._decal.entries())
            r.skinInfo == e && this.deleteDecal(t)
    }
    addSharedMatCount(e) {
        const t = this._sharedMat.get(e);
        t != null ? this._sharedMat.set(e, t + 1) : this._sharedMat.set(e, 1)
    }
    minusSharedMatCount(e) {
        var r;
        const t = this._sharedMat.get(e);
        t != null && (this._sharedMat.set(e, t - 1),
        t == 0 && (this._sharedMat.delete(e),
        (r = this._mat.get(e)) == null || r.cleanTexture(),
        this._mat.delete(e)))
    }
    toggle(e, t) {
        const r = this._decal.get(e);
        r == null || r.toggle(t)
    }
    toggleDecalBySkinInfo(e, t) {
        for (const [r,n] of this._decal.entries())
            n.skinInfo == e && n.toggle(t)
    }
    updateTexAsWords(e, t, r={}) {
        const {clearArea: n=!0, w: o=480, h: a=480, y: s=a / 2, fontsize: l=70, slots: u=1, visibleSlots: c=1, font: h="black-body", color: f="white", fontweight: d=100} = r;
        let {x: _=o / 2} = r;
        const g = this._mat.get(e);
        if (g) {
            _ == -1 && (_ = (g.getUOffset() + c / u) % 1 * o * u);
            const v = g.getMat().diffuseTexture
              , y = v.getContext();
            n && y.clearRect(_ - o / 2, s - a / 2, o, a),
            y.textAlign = "center",
            y.textBaseline = "middle",
            v.drawText(t, _, s, d + " " + l + "px " + h, f, "transparent", !0),
            v.hasAlpha = !0,
            v.update()
        }
    }
    async updateTexAsImg(e, t, r={}) {
        const {clearArea: n=!0, w: o=480, h: a=480, x: s=o / 2, y: l=a / 2, clearW: u=o, clearH: c=a} = r;
        return t == null || t == null || t == "" ? (logger.error(`[Engine] updateTexAsImg Error. id: [${e}], newBuffer is Null or ""!`),
        Promise.reject(new XDecalError(`[Engine] updateTexAsImg Error. id: [${e}], newBuffer is Null or ""!`))) : new Promise((h,f)=>this._scenemanager.urlTransformer(t).then(d=>new Promise((_,g)=>{
            const m = this._mat.get(e);
            if (m) {
                const y = m.getMat().diffuseTexture;
                if (typeof t == "string") {
                    const b = new Image;
                    b.crossOrigin = "anonymous",
                    b.src = d,
                    b.onload = ()=>{
                        const T = y.getContext();
                        n && T.clearRect(s - u / 2, l - c / 2, u, c),
                        T.drawImage(b, s - o / 2, l - a / 2, o, a),
                        y.update(),
                        _(!0)
                    }
                    ,
                    b.onerror = ()=>{
                        logger.error(`[Engine] updateTexAsImg Error.newImg load error. id: [${e}], decalMat is Null or undefined!`),
                        g(new XDecalError(`[Engine] updateTexAsImg Error. id: [${e}], decalMat is Null or undefined!`))
                    }
                } else
                    logger.error(`[Engine] updateTexAsImg Error. id: [${e}], Buffer is not string!`),
                    g(new XDecalError(`[Engine] updateTexAsImg Error. id: [${e}], Buffer is not string!`))
            } else
                logger.error(`[Engine] updateTexAsImg Error. id: [${e}], decalMat is Null or undefined!`),
                g(new XDecalError(`[Engine] updateTexAsImg Error. id: [${e}], decalMat is Null or undefined!`))
        }
        ).then(_=>{
            _ == !0 ? h(!0) : (logger.error(`[Engine] updateTexAsImg Error. id: [${e}] !`),
            f(new XDecalError(`[Engine] updateTexAsImg error! id: [${e}]`)))
        }
        ).catch(_=>{
            logger.error(`[Engine] updateTexAsImg Error. id: [${e}]. ${_}`)
        }
        )))
    }
    startAnime(e, t) {
        logger.info(`[Engine] Decal Start Anime. [${e}]`);
        const {speed: r=.001, callback: n} = t
          , o = this._mat.get(e);
        o ? (o.do_animation(r),
        n && o.uOffsetObserverable.add(n)) : (logger.error(`[Engine] startAnime Error. id: [${e}] is not exist!`),
        new XDecalError(`[Engine] startAnime Error. id: [${e}] is not exist!`))
    }
}