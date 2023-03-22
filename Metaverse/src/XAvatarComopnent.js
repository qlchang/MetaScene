import EMeshType from "./enum/EMeshType.js"
import Logger from "./Logger.js"

const logger = new Logger('CharacterComopnent')

export default class XAvatarComopnent {
    constructor() {
        this.resourceIdList = [],
        this.skeleton = void 0,
        this.extraProp = void 0,
        this.extras = [],
        this.body = void 0,
        this.accessories = new Map
    }
    addBodyComp(e, i) {
        return !e.rootNode || i.root.getChildMeshes().length === 0 
        ? (
            i.isRender = !1,
            !1
        ) : (
            this.body = i,
            this.body.root.parent = e.rootNode,
            i.isRender = !0,
            this.body.root.getChildMeshes()[0] && (
                this.body.root.getChildMeshes()[0].xtype = EMeshType.XAvatar,
                this.body.root.getChildMeshes()[0].xid = e.id
            ),
            this.skeleton = i.skeleton,
            !0
        )
    }
    addClothesComp(e, i) {
        return !e.rootNode || !this.skeleton || !i.root ? (i.isRender = !1,
        !1) : (i.root.xtype = EMeshType.XAvatar,
        i.root.xid = e.id,
        i.isRender = !0,
        i.root.parent = e.rootNode.getChildMeshes()[0],
        this.resourceIdList.push(i),
        i.root.skeleton = this.skeleton,
        i.root.getChildMeshes().forEach(o=>{
            o.skeleton = this.skeleton
        }
        ),
        !0)
    }
    clearClothesComp(e) {
        e.root.getChildMeshes().forEach(i=>{
            i.skeleton = null,
            i.dispose(),
            i.xid = void 0
        }
        ),
        e.root.dispose(),
        this.resourceIdList = this.resourceIdList.filter(i=>i.uId != e.uId)
    }
    clearAllClothesComps() {
        this.resourceIdList.forEach(e=>{
            var i;
            e.root.parent = null,
            e.root._parentContainer.xReferenceCount && (e.root._parentContainer.xReferenceCount--,
            e.root._parentContainer = null),
            e.isRender = !1,
            e.isSelected = !1,
            e.root.getChildMeshes().forEach(o=>{
                o.skeleton = null,
                o.dispose()
            }
            ),
            (i = e.root.skeleton) == null || i.dispose(),
            e.root.dispose()
        }
        ),
        this.resourceIdList = []
    }
    dispose(e) {
        this.body ? (this.body.root._parentContainer.xReferenceCount && (this.body.root._parentContainer.xReferenceCount--,
        this.body.root._parentContainer = null),
        this.clearAllClothesComps(),
        this.body.isRender = !1,
        this.body.skeleton.dispose(),
        this.body.skeleton = null,
        this.body.root.dispose(),
        this.body = void 0,
        this.skeleton && (this.skeleton.dispose(),
        this.skeleton = void 0)) : log$I.warn("[Engine] no body to dispose")
    }
    async attachPendant(e, i) {
        return Promise.resolve(avatarLoader.pullAndLoadXObject(e.avatarManager.sceneManager, i).then(o=>{
            const s = o
              , c = this.accessories.get(s.pointId);
            return c ? (c.dispose(),
            this.accessories.set(s.pointId, s),
            //该挂点当前被占用，已替换该挂点
            log$I.warn("[Engine] \u8BE5\u6302\u70B9\u5F53\u524D\u88AB\u5360\u7528\uFF0C\u5DF2\u66FF\u6362\u8BE5\u6302\u70B9")) : this.accessories.set(s.pointId, s),
            s.attachTo(e),
            s
        }
        ))
    }
    detachPendant(e, i=!0) {
        const o = this.accessories.get(e);
        o && (o.dispose(),
        this.accessories.delete(e))
    }
    changeClothesComp(e, i, o, s, c) {
        return new Promise(d=>{
            if (this.resourceIdList.some(_=>_.name === i))
                return d();
            if (e.isHide || !e.isRender)
                c.concat(o).forEach(b=>{
                    e.clothesList = e.clothesList.filter(j=>j.type != b);
                    const k = {
                        type: o,
                        id: i,
                        url: s,
                        lod: 0
                    };
                    e.clothesList.push(k)
                }
                ),
                d();
            else {
                const _ = c.concat(o);
                e.avatarManager.loadDecoration(o, i, 0).then(b=>{
                    if (b) {
                        e.attachDecoration(b);
                        const k = {
                            type: o,
                            id: i,
                            url: s
                        };
                        e.clothesList.push(k),
                        b.root.setEnabled(!0),
                        _.forEach(j=>{
                            const $ = this.resourceIdList.filter(_e=>_e.type === j);
                            if ($.length > 1) {
                                const _e = $.filter(et=>et.name === i);
                                if (_e.length > 1)
                                    for (let et = 1; et < _e.length; ++et) {
                                        e.detachDecoration(_e[et]),
                                        e.clothesList = e.clothesList.filter(rt=>rt.id != _e[et].name);
                                        const tt = {
                                            type: o,
                                            id: i,
                                            url: s
                                        };
                                        e.clothesList.push(tt)
                                    }
                            }
                            $[0] && $[0].name != i && this._readyToDetach(e, o) && (e.detachDecoration($[0]),
                            e.clothesList = e.clothesList.filter(_e=>_e.id != $[0].name))
                        }
                        )
                    }
                    return d()
                }
                )
            }
        }
        )
    }
    _readyToDetach(e, i) {
        return !((i == "clothes" || i == "pants") && e.clothesList.filter(s=>s.type === "suit").length == 1 && (!e.clothesList.some(s=>s.type === "pants") || !e.clothesList.some(s=>s.type === "clothes")))
    }
    addDecoComp(e, i, o, s, c) {
        if (e.isRender) {
            const d = e.avatarManager.extraComps.get(i)
              , _ = d == null ? void 0 : d.clone(i, void 0);
            if (!d) {
                log$I.error("\u6CA1\u6709\u5BF9\u5E94\u7684\u7EC4\u4EF6");    //没有对应的组件
                return
            }
            this.extras.push(_);
            const b = this.skeleton.bones.find(k=>k.name === o);
            _.position = s,
            _.rotation = c,
            _.attachToBone(b, e.rootNode.getChildMeshes()[0])
        }
    }
    showExtra(e) {
        this.extras.forEach(i=>{
            i.name.indexOf(e) > 0 && i.setEnabled(!0)
        }
        )
    }
    hideExtra(e) {
        this.extras.forEach(i=>{
            i.name.indexOf(e) > 0 && i.setEnabled(!1)
        }
        )
    }
    disposeExtra() {
        this.extras.forEach(e=>{
            e.dispose()
        }
        ),
        this.extras = []
    }
}
