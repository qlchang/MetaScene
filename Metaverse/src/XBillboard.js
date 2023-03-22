import EMeshType from "./enum/EMeshType.js"
import XBillboardManager from "./XBillboardManager.js"
import Logger from "./Logger.js"

const logger = new Logger('Billboard')
export default class XBillboard {
    constructor(e, t=!1, r=!1) {
        E(this, "_mesh", null);
        E(this, "_texture", null);
        E(this, "_scalingFactor", 1);
        E(this, "offsets", null);
        E(this, "_pickable");
        E(this, "_background", null);
        E(this, "_billboardManager");
        E(this, "poolobj", null);
        E(this, "_usePool");
        E(this, "_initMeshScale", new BABYLON.Vector3(1,1,1));
        E(this, "_status", -1);
        E(this, "_stageChanged", !1);
        E(this, "DEFAULT_CONFIGS", {});
        this._billboardManager = e,
        this._pickable = t,
        this._usePool = r
    }
    set scalingFactor(e) {
        this._scalingFactor = e
    }
    set background(e) {
        this._background = e
    }
    get size() {
        return -1
    }
    setStatus(e) {
        e != this._status && (this._stageChanged = !0,
        this._status = e)
    }
    get status() {
        return this._status
    }
    get stageChanged() {
        return this._stageChanged
    }
    set stageChanged(e) {
        this._stageChanged = e
    }
    init(e="", t=.001, r=.001, n=!1) {
        const o = this._billboardManager.sceneManager.Scene;
        if (this._usePool) {
            const a = this._billboardManager.billboardPool.getFree(o, t, r, n);
            this._mesh = a.data,
            this._mesh.isPickable = this._pickable,
            this._mesh.xid = e,
            this._mesh.xtype = EMeshType.XBillboard,
            this._texture = this._mesh.material.diffuseTexture,
            this.poolobj = a
        } else
            this._mesh = this._billboardManager.createBillboardAsset(o, n);
        this._mesh.isPickable = this._pickable,
        this._initMeshScale.x = t * 1e3,
        this._initMeshScale.y = r * 1e3,
        this._mesh.xid = e,
        this._mesh.xtype = EMeshType.XBillboard,
        this._texture = this._mesh.material.diffuseTexture,
        this.setStatus(1),
        this._stageChanged = !0
    }
    dispose() {
        this._usePool ? this.poolobj && (this._billboardManager.billboardPool.release(this.poolobj),
        this._mesh = null,
        this._texture = null,
        this.poolobj = null) : this._mesh && (this._mesh.dispose(!0, !0),
        this._mesh = null,
        this._texture = null),
        this._background = null
    }
    getMesh() {
        return this._mesh
    }
    updateImage(e) {
        return new Promise(t=>{
            if (this._texture == null) {
                logger.error("[Engine]Billboard texture not found");
                return
            }
            const r = this._mesh
              , n = this._texture
              , o = this._scalingFactor
              , a = this._initMeshScale.x
              , s = this._initMeshScale.y
              , l = this._texture.getContext()
              , u = this._texture.getSize();
            l.clearRect(0, 0, u.width, u.height);
            const c = new Image;
            c.crossOrigin = "anonymous",
            c.src = e,
            c.onload = ()=>{
                const h = c.width * o
                  , f = c.height * o;
                r.scaling.x = h * a,
                r.scaling.y = f * s,
                n.scaleTo(h, f),
                l.drawImage(c, 0, 0, h, f),
                n.hasAlpha = !0,
                n.update(),
                t()
            }
        }
        )
    }
    show() {
        this._mesh && (this._mesh.setEnabled(!0),
        this._mesh.isPickable = this._pickable)
    }
    hide() {
        this._mesh && (this._mesh.setEnabled(!1),
        this._mesh.isPickable = !1)
    }
    setId(e) {
        this._mesh && (this._mesh.xid = e)
    }
    setPosition(e) {
        if (e && this._mesh) {
            const t = ue4Position2Xverse(e);
            this._mesh.position = t
        }
    }
    updateText(e, t, r=!0, n=[], o=30, a="monospace", s="black", l="bold", u) {
        if (this._texture == null) {
            logger.error("[Engine]Billboard texture not found");
            return
        }
        const c = this._texture
          , h = this._mesh
          , f = this._scalingFactor
          , d = this._initMeshScale.x
          , _ = this._initMeshScale.y;
        if (e != "") {
            const g = this._texture.getContext()
              , m = this._texture.getSize();
            g.clearRect(0, 0, m.width, m.height);
            const v = new Image;
            if (r) {
                t != null ? t ? this._background = this._billboardManager.userBackGroundBlob : this._background = this._billboardManager.npcBackGroundBlob : this._background || (this._background = this._billboardManager.userBackGroundBlob);
                let y = e
                  , b = u && u < n.length - 1 ? u : n.length - 1;
                if (this._background) {
                    if (b > this._background.length) {
                        for (let T = 0; T < b - this._background.length; T++)
                            n.pop();
                        b = n.length - 1,
                        y = e.slice(0, n[b] - 1) + String.fromCharCode(8230)
                    }
                    v.crossOrigin = "anonymous",
                    v.src = this._background[b - 1],
                    v.onload = function() {
                        const T = v.width * f
                          , C = v.height * f;
                        h.scaling.x = T * d,
                        h.scaling.y = C * _,
                        c.scaleTo(T, C),
                        g.textAlign = "center",
                        g.textBaseline = "middle",
                        g.drawImage(v, 0, 0, T, C);
                        for (let A = 0; A < b; A++)
                            c.drawText(y.slice(n[0 + A], n[1 + A]), T / 2, C * (A + 1) / (b + 1) + (A - (b - 1) / 2) * f * 10, l + " " + o * f + "px " + a, s, "transparent", !0);
                        c.hasAlpha = !0
                    }
                }
            } else {
                const y = u && u < n.length - 1 ? u : n.length - 1
                  , b = 480 * f
                  , T = 60 * f * y;
                this._mesh.scaling = new BABYLON.Vector3(b * d,T * _,1),
                c.scaleTo(b, T);
                const C = c.getContext();
                C.textAlign = "center",
                C.textBaseline = "middle";
                for (let A = 0; A < y; A++)
                    c.drawText(e.slice(n[0 + A], n[1 + A]), b / 2 + 2 * f, T * (A + 1) / (y + 1) + (A - (y - 1) / 2) * f * 10 + 2 * f, l + " " + o * f + "px " + a, "#333333", "transparent", !0),
                    c.drawText(e.slice(n[0 + A], n[1 + A]), b / 2, T * (A + 1) / (y + 1) + (A - (y - 1) / 2) * f * 10, l + " " + o * f + "px " + a, s, "transparent", !0);
                c.hasAlpha = !0
            }
        } else
            this.clearText()
    }
    drawBillboard(e, t, r) {
        var m;
        const {imageList: n} = e
          , {texts: o, font: a="monospace", fontsize: s=40, fontcolor: l="#ffffff", fontstyle: u="", linesize: c=20, linelimit: h} = t
          , {position: f, offsets: d, scale: _, compensationZ: g=0} = r;
        if (this.scalingFactor = _ || 1,
        d && (this.offsets = {
            x: d.x * this._scalingFactor,
            y: d.y * this._scalingFactor,
            z: d.z * this._scalingFactor
        }),
        this.offsets || (this.offsets = {
            x: 0,
            y: 0,
            z: 0
        }),
        this.setPosition(f),
        n && !o)
            (m = this._billboardManager.sceneManager) == null || m.urlTransformer(n[0]).then(v=>{
                this.updateImage(v)
            }
            );
        else if (o && !n) {
            const [v,y] = getStringBoundaries(o, c, XBillboardManager.alphaWidthMap);
            this.offsets.z += this._scalingFactor * g * (y.length - 1),
            this.updateText(v, void 0, !1, y, s, a, l, u, h)
        } else if (o && n) {
            this.background = n;
            const [v,y] = getStringBoundaries(o, c, XBillboardManager.alphaWidthMap);
            this.offsets.z += this._scalingFactor * g * (y.length - 1),
            this.updateText(v, void 0, !0, y, s, a, l, u, h)
        }
        this.setStatus(1)
    }
    clearText() {
        if (this._texture != null) {
            const e = this._texture.getContext()
              , t = this._texture.getSize();
            e.clearRect(0, 0, t.width, t.height),
            this._texture.update()
        }
    }
}