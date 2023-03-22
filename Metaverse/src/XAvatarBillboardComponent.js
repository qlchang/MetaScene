import EMeshType from "./enum/EMeshType.js"
import BillboardStatus from "./enum/BillboardStatus.js"
import Logger from "./Logger.js"

const logger = new Logger('CharacterBillboardComponent')

export default class XAvatarBillboardComponent {
    constructor(e) {
        E(this, "_nickName", "");
        E(this, "_words", "");
        E(this, "_isNameVisible", !0);
        E(this, "_isBubbleVisible", !0);
        E(this, "_isGiftButtonsVisible", !1);
        E(this, "withinVisualRange", !1);
        E(this, "_bubble");
        E(this, "_nameBoard");
        E(this, "_giftButtons", new Map);
        E(this, "_buttonTex", new Map);
        E(this, "_nameLinesLimit", 2);
        E(this, "_nameLengthPerLine", 16);
        E(this, "_scene");
        E(this, "_pickBbox", null);
        E(this, "bbox");
        E(this, "_height", .26);
        E(this, "_attachmentObservers", new Map);
        E(this, "attachToAvatar", (e,t,r=!1,n={
            x: 0,
            y: 0,
            z: 0
        },o=!1,a,s)=>{
            const l = e.rootNode;
            if (this.bbox || e.getBbox(),
            t && l) {
                const u = a || t.uniqueId;
                let c = this._attachmentObservers.get(u);
                if (c)
                    if (o)
                        this._scene.onBeforeRenderObservable.remove(c),
                        this._attachmentObservers.delete(u);
                    else
                        return;
                const h = ue4Position2Xverse(n);
                r ? (t.setParent(l),
                t.position = h) : (c = this._scene.onBeforeRenderObservable.add(()=>{
                    let f = 0;
                    s ? (f = e.rootNode.rotation.y / Math.PI * 180 + 90,
                    e.rootNode.rotation.y && (t.rotation.y = e.rootNode.rotation.y)) : f = e.avatarManager.sceneManager.cameraComponent.getCameraPose().rotation.yaw,
                    f || (f = 0);
                    const d = new BABYLON.Vector3(0,this._height,0);
                    e.controller && e.controller.activeAnimation() && e.controller.activeAnimation().animatables[0] && (this._height = d.y = (e.controller.activeAnimation().animatables[0].target.position.y * .01 - .66) * e.scale),
                    d.y < .07 * e.scale && (d.y = 0),
                    t.position.x = l.position.x + h.x * Math.sin(f * Math.PI / 180) + h.z * Math.cos(f * Math.PI / 180),
                    t.position.z = l.position.z + h.x * Math.cos(f * Math.PI / 180) - h.z * Math.sin(f * Math.PI / 180),
                    t.position.y = l.position.y + this.bbox.maximum.y + h.y + d.y
                }
                ),
                this._attachmentObservers.set(u, c))
            } else
                logger.error("avatar or attachment not found!")
        }
        );
        E(this, "detachFromAvatar", (e,t,r=!1)=>{
            const n = this._attachmentObservers.get(t.uniqueId);
            n && this._scene.onBeforeRenderObservable.remove(n),
            e.rootNode ? (t.setEnabled(!1),
            t.parent = null,
            r && t.dispose()) : logger.error("avatar not found!")
        }
        );
        E(this, "getBbox", (e,t={})=>{
            const {isConst: r=!1, changeWithAvatar: n=!1} = t;
            let {localCenter: o={
                x: 0,
                y: 0,
                z: 75
            }, width: a=1.32, height: s=1.5, depth: l=.44} = t;
            if (n) {
                const u = e.scale;
                o = {
                    x: o.x * u,
                    y: o.y * u,
                    z: o.z * u
                },
                a *= u,
                s *= u,
                l *= u
            }
            if (e.rootNode) {
                let u = new BABYLON.Vector3(0,0,0)
                  , c = new BABYLON.Vector3(0,0,0);
                if (r) {
                    const f = ue4Position2Xverse(o);
                    u = u.add(f.add(new BABYLON.Vector3(-a / 2,-s / 2,-l / 2))),
                    c = c.add(f.add(new BABYLON.Vector3(a / 2,s / 2,l / 2)))
                } else if (u = u.add(new BABYLON.Vector3(Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY)),
                c = c.add(new BABYLON.Vector3(Number.NEGATIVE_INFINITY,Number.NEGATIVE_INFINITY,Number.NEGATIVE_INFINITY)),
                e.isRender) {
                    e.rootNode.getChildMeshes().forEach(_=>{
                        const g = _.getBoundingInfo().boundingBox.minimum
                          , m = _.getBoundingInfo().boundingBox.maximum;
                        u.x = Math.min(u.x, g.x),
                        c.x = Math.max(c.x, m.x),
                        u.y = Math.min(u.y, g.y),
                        c.y = Math.max(c.y, m.y),
                        u.z = Math.min(u.z, g.z),
                        c.z = Math.max(c.z, m.z)
                    }
                    );
                    const f = c.x - u.x
                      , d = c.z - u.z;
                    u.x -= e.scale * f / 2,
                    c.x += e.scale * f / 2,
                    c.y *= e.scale,
                    u.z -= e.scale * d / 2,
                    c.z += e.scale * d / 2
                } else {
                    const f = e.avatarManager.getMainAvatar();
                    f && f.bbComponent.bbox && (u.x = f.bbComponent.bbox.minimum.x,
                    c.x = f.bbComponent.bbox.maximum.x,
                    u.y = f.bbComponent.bbox.minimum.y,
                    c.y = f.bbComponent.bbox.maximum.y,
                    u.z = f.bbComponent.bbox.minimum.z,
                    c.z = f.bbComponent.bbox.maximum.z)
                }
                const h = e.rootNode.computeWorldMatrix(!0);
                if (this.bbox ? this.bbox.reConstruct(u, c, h) : this.bbox = new BABYLON.BoundingBox(u,c,h),
                this._pickBbox == null) {
                    const f = this.createPickBoundingbox(e, this.bbox);
                    this.attachToAvatar(e, f.data, !1, {
                        x: 0,
                        y: 0,
                        z: 0
                    }, !1, "pickbox"),
                    this._pickBbox = f
                }
            } else
                logger.error("avatar not found!")
        }
        );
        this._scene = e
    }
    get isNameVisible() {
        return this._isNameVisible
    }
    get isBubbleVisible() {
        return this._isBubbleVisible
    }
    get isGiftButtonsVisible() {
        return this._isGiftButtonsVisible
    }
    get words() {
        return this._words
    }
    get nickName() {
        return this._nickName
    }
    get giftButtons() {
        return this._giftButtons
    }
    get bubble() {
        return this._bubble
    }
    get nameBoard() {
        return this._nameBoard
    }
    setNicknameStatus(e) {
        if (this.nameBoard && this.nameBoard.setStatus(e),
        e == BillboardStatus.DISPOSE) {
            const t = this._attachmentObservers.get("nickname");
            t && (this._scene.onBeforeRenderObservable.remove(t),
            this._attachmentObservers.delete("nickname"))
        }
    }
    setBubbleStatus(e) {
        if (this.bubble && this.bubble.setStatus(e),
        e == BillboardStatus.DISPOSE) {
            const t = this._attachmentObservers.get("bubble");
            t && (this._scene.onBeforeRenderObservable.remove(t),
            this._attachmentObservers.delete("bubble"))
        }
    }
    setButtonsStatus(e) {
        this.giftButtons && this.giftButtons.size != 0 && this.giftButtons.forEach(t=>{
            if (t.setStatus(e),
            e == BillboardStatus.DISPOSE && t.getMesh()) {
                const r = "button_" + t.getMesh().xid
                  , n = this._attachmentObservers.get(r);
                n && (this._scene.onBeforeRenderObservable.remove(n),
                this._attachmentObservers.delete(r))
            }
        }
        )
    }
    setGiftButtonsVisible(e) {
        this.setButtonsStatus(e ? BillboardStatus.SHOW : BillboardStatus.DISPOSE)
    }
    dispose(e) {
        this._attachmentObservers.forEach(t=>{
            this._scene.onBeforeRenderObservable.remove(t)
        }
        ),
        this._attachmentObservers.clear(),
        this.updateBillboardStatus(e, BillboardStatus.DISPOSE),
        this._buttonTex.clear(),
        this._pickBbox && (e.avatarManager.bboxMeshPool.release(this._pickBbox),
        this._pickBbox = null)
    }
    updateBillboardStatus(e, t) {
        this.bbox || e.getBbox(),
        e.isRender ? (e.setBubbleStatus(t),
        e.setButtonsStatus(t),
        e.setNicknameStatus(t)) : (e.setBubbleStatus(BillboardStatus.DISPOSE),
        e.setButtonsStatus(BillboardStatus.DISPOSE),
        e.enableNickname ? e.setNicknameStatus(t) : e.setNicknameStatus(BillboardStatus.DISPOSE))
    }
    disposeBillBoard(e) {
        this._attachmentObservers.forEach(t=>{
            this._scene.onBeforeRenderObservable.remove(t)
        }
        ),
        this._attachmentObservers.clear(),
        this.updateBillboardStatus(e, BillboardStatus.DISPOSE),
        this._buttonTex.clear(),
        this._pickBbox && (e.avatarManager.bboxMeshPool.release(this._pickBbox),
        this._pickBbox = null)
    }
    setPickBoxScale(e) {
        this._pickBbox && this._pickBbox.data && (this._pickBbox.data.scaling = new BABYLON.Vector3(e,e,e))
    }
    setIsPickable(e, t) {
        e.rootNode && e.rootNode.getChildMeshes().forEach(r=>{
            r.isPickable = t
        }
        ),
        this._pickBbox && this._pickBbox.data && (this._pickBbox.data.isPickable = t)
    }
    initNameboard(e, t=1) {
        this._nameBoard == null && (this._nameBoard = e.avatarManager.sceneManager.billboardComponent.addBillboard("name-" + e.id, !1, !0)),
        this._nameBoard.init("nickname", t / 300, t / 300)
    }
    initBubble(e, t=1) {
        this._bubble == null && (this._bubble = e.avatarManager.sceneManager.billboardComponent.addBillboard("bubble-" + e.id, !1, !0)),
        e.isRender && this._bubble.init("bubble", t / 250, t / 250)
    }
    say(e, t=this._words, {id: r, isUser: n, background: o, font: a="Arial", fontsize: s=38, fontcolor: l="#ffffff", fontstyle: u="bold", linesize: c=22, linelimit: h, offsets: f={
        x: 0,
        y: 0,
        z: 40
    }, scale: d, compensationZ: _=11.2, reregistAnyway: g=!0}) {
        (!this.bubble || this.bubble.getMesh() == null) && e.initBubble(),
        this._words = t;
        let m;
        n != null && (m = n ? XBillboardManager.userBubbleUrls : XBillboardManager.npcBubbleUrls),
        this._bubble && (this._bubble.DEFAULT_CONFIGS = {
            id: r,
            isUser: n,
            background: o || m,
            font: a,
            fontsize: s,
            fontcolor: l,
            fontstyle: u,
            linesize: c,
            linelimit: h,
            offsets: f,
            scale: d,
            compensationZ: _,
            reregistAnyway: g
        },
        this._bubble.getMesh() && (this._bubble.drawBillboard({
            imageList: o || m
        }, {
            texts: this._words,
            font: a,
            fontsize: s,
            fontcolor: l,
            fontstyle: u,
            linesize: c
        }, {
            offsets: f,
            scale: d,
            compensationZ: _
        }),
        this.attachToAvatar(e, this._bubble.getMesh(), !1, this._bubble.offsets, g, "bubble"),
        r && this._bubble.setId(r))),
        this.setButtonsStatus(BillboardStatus.DISPOSE)
    }
    silent() {
        this.setBubbleStatus(BillboardStatus.DISPOSE),
        this._words = ""
    }
    setNickName(e, t, {id: r, isUser: n, background: o, font: a="Arial", fontsize: s=40, fontcolor: l="#ffffff", fontstyle: u="bold", linesize: c=22, linelimit: h, offsets: f={
        x: 0,
        y: 0,
        z: 15
    }, scale: d, compensationZ: _=0, reregistAnyway: g=!1}) {
        this._nickName = t,
        (!this.nameBoard || this.nameBoard.getMesh() == null) && this.initNameboard(e),
        this._nameBoard && this._nameBoard.getMesh() && (this._nameBoard.DEFAULT_CONFIGS = {
            id: r,
            isUser: n,
            background: o,
            font: a,
            fontsize: s,
            fontcolor: l,
            fontstyle: u,
            linesize: c,
            linelimit: h,
            offsets: f,
            scale: d,
            compensationZ: _,
            reregistAnyway: g
        },
        this._nameBoard.drawBillboard({}, {
            texts: this._nickName,
            font: a,
            fontsize: s,
            fontcolor: l,
            fontstyle: u,
            linesize: c,
            linelimit: h
        }, {
            offsets: f,
            scale: d,
            compensationZ: 0
        }),
        this.attachToAvatar(e, this._nameBoard.getMesh(), !1, this._nameBoard.offsets, g, "nickname"),
        r && this._nameBoard.setId(r))
    }
    generateButtons(e, t=null, r, n=85) {
        if (t && (this._buttonTex = t,
        this.clearButtons()),
        this._buttonTex.size == 0)
            return;
        let o = (this._buttonTex.size - 1) / 2;
        this._buttonTex.forEach((a,s)=>{
            let l = this._giftButtons.get(s);
            l || (l = e.avatarManager.sceneManager.billboardComponent.addBillboard("button-" + s + e.id, !0, !1),
            l.init(s, r / 240, r / 240));
            const u = {
                x: r * o * 70,
                y: 0,
                z: r * (n - 20 * (o * o))
            };
            l.drawBillboard({
                imageList: [a]
            }, {}, {
                offsets: u,
                scale: r
            }),
            this.attachToAvatar(e, l.getMesh(), !1, l.offsets, !0, "button_" + s),
            this._giftButtons.set(s, l),
            o -= 1
        }
        ),
        this.setBubbleStatus(BillboardStatus.DISPOSE)
    }
    clearButtons() {
        this._giftButtons.forEach(e=>{
            e.dispose()
        }
        ),
        this._giftButtons.clear()
    }
    createPickBoundingbox(e, t) {
        const r = t.extendSize.x * 2
          , n = t.extendSize.y * 2
          , o = t.extendSize.z * 2
          , a = this._scene
          , s = Math.max(r, o)
          , l = e.avatarManager.bboxMeshPool.getFree(a, s, n, s)
          , u = l.data;
        return u && (u.position = t.centerWorld,
        u.setEnabled(!1),
        u.isPickable = !0,
        u.xtype = EMeshType.XAvatar,
        u.xid = e.id),
        l
    }
}