const texRootDir = "./assets/textures/billboard/"

import BillboardStatus from "./enum/BillboardStatus.js"
import Pool from "./Pool.js"
import XBillboard from "./XBillboard.js"

export default class XBillboardManager {
    constructor(e) {
        E(this, "billboardMap", new Map);
        E(this, "sceneManager");
        E(this, "billboardPool");
        E(this, "userBackGroundBlob", new Array);
        E(this, "npcBackGroundBlob", new Array);
        E(this, "tickObserver");
        E(this, "tickInterval");
        E(this, "_updateLoopObserver");
        this.sceneManager = e,
        this.billboardPool = new Pool(this.createBillboardAsset,this.resetBillboardAsset,0,60,this.sceneManager.Scene,!1),
        this.tickInterval = 250;
        let t = 0;
        this.tickObserver = this.sceneManager.Scene.onAfterRenderObservable.add(()=>{
            t += 1,
            t == this.tickInterval && (this.tick(),
            t = 0)
        }
        ),
        this.launchBillboardStatusLoop()
    }
    tick() {
        this.billboardPool.clean(0, this.sceneManager.Scene, !1)
    }
    createBillboardAsset(e, t=!1) {
        const r = BABYLON.MeshBuilder.CreatePlane("billboard-", {
            height: .001,
            width: .001,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE
        }, e);
        r.isPickable = !0,
        r.setEnabled(!1);
        const n = new BABYLON.DynamicTexture("billboard-tex-",{
            width: .001 + 1,
            height: .001 + 1
        },e,t,BABYLON.Texture.BILINEAR_SAMPLINGMODE);
        n.hasAlpha = !0;
        const o = new BABYLON.StandardMaterial("billboard-mat-",e);
        return o.diffuseTexture = n,
        o.emissiveColor = new BABYLON.Color3(.95,.95,.95),
        o.useAlphaFromDiffuseTexture = !0,
        r.material = o,
        r.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y,
        r.position.y = 0,
        r
    }
    resetBillboardAsset(e) {
        const t = e.data;
        return t.setEnabled(!1),
        t.isPickable = !1,
        e
    }
    async loadBackGroundTexToIDB() {
        XBillboardManager.userBubbleUrls.forEach(r=>{
            this.sceneManager.urlTransformer(r).then(n=>{
                this.userBackGroundBlob.push(n)
            }
            )
        }
        ),
        XBillboardManager.npcBubbleUrls.forEach(r=>{
            this.sceneManager.urlTransformer(r).then(n=>{
                this.npcBackGroundBlob.push(n)
            }
            )
        }
        )
    }
    addBillboardToMap(e, t) {
        this.billboardMap.set(e, t)
    }
    addBillboard(e, t, r) {
        let n = this.getBillboard(e);
        return n || (n = new XBillboard(this,t,r),
        this.addBillboardToMap(e, n)),
        n
    }
    generateStaticBillboard(e, {id: t="billboard", isUser: r, background: n, font: o="Arial", fontsize: a=40, fontcolor: s="#ffffff", fontstyle: l="600", linesize: u=16, linelimit: c, scale: h=1, width: f=.01, height: d=.01, position: _={
        x: 0,
        y: 0,
        z: 0
    }}) {
        const g = this.addBillboard(t, !1, !0);
        g.getMesh() == null && g.init(t, f, d);
        let m;
        r != null && (m = r ? XBillboardManager.userBubbleUrls : XBillboardManager.npcBubbleUrls),
        g && g.getMesh() && (g.DEFAULT_CONFIGS = {
            id: t,
            isUser: r,
            background: n,
            font: o,
            fontsize: a,
            fontcolor: s,
            fontstyle: l,
            linesize: u,
            linelimit: c,
            scale: h,
            width: f,
            height: d,
            position: _
        },
        g.drawBillboard({
            imageList: n || m
        }, {
            texts: e,
            font: o,
            fontsize: a,
            fontcolor: s,
            fontstyle: l,
            linesize: u,
            linelimit: c
        }, {
            position: _,
            scale: h
        }),
        t && g.setId(t),
        g.setStatus(BillboardStatus.SHOW))
    }
    getBillboard(e) {
        return this.billboardMap.get(e)
    }
    toggle(e, t) {
        var r;
        (r = this.getBillboard(e)) == null || r.setStatus(t ? BillboardStatus.SHOW : BillboardStatus.HIDE)
    }
    removeBillboard(e) {
        const t = this.getBillboard(e);
        t && (t.setStatus(BillboardStatus.DISPOSE),
        this.billboardMap.delete(e))
    }
    launchBillboardStatusLoop() {
        this._updateLoopObserver = this.sceneManager.Scene.onBeforeRenderObservable.add(()=>{
            this.billboardMap.size <= 0 || this.billboardMap.forEach(e=>{
                e.stageChanged && (e.status == BillboardStatus.SHOW ? e.show() : e.status == BillboardStatus.HIDE ? e.hide() : (e.hide(),
                e.dispose()),
                e.stageChanged = !1)
            }
            )
        }
        )
    }
}
;

E(XBillboardManager, "alphaWidthMap", new Map),
E(XBillboardManager, "userBubbleUrls", [texRootDir + "bubble01.png", texRootDir + "bubble02.png", texRootDir + "bubble03.png"]),
E(XBillboardManager, "npcBubbleUrls", [texRootDir + "bubble01_npc.png", texRootDir + "bubble02_npc.png", texRootDir + "bubble03_npc.png"]);