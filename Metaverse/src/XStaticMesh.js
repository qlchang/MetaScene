import EMeshType from "./enum/EMeshType.js"
import Logger from "./Logger.js"

const logger = new Logger('StaticMesh')
export default class XStaticMesh {
    constructor({id: e, mesh: t, group: r="default", lod: n=0, xtype: o=EMeshType.XStaticMesh, skinInfo: a="default", url: s=""}) {
        E(this, "_mesh");
        E(this, "_id", "-1");
        E(this, "_group");
        E(this, "_lod");
        E(this, "_isMoving", !1);
        E(this, "_isRotating", !1);
        E(this, "_isVisible", !0);
        E(this, "_skinInfo");
        this._id = e,
        this._mesh = t,
        this._group = r,
        this._lod = n,
        this._skinInfo = a,
        this.unallowMove(),
        this._mesh.xtype = o,
        this._mesh.xid = e,
        this._mesh.xgroup = this._group,
        this._mesh.xlod = this._lod,
        this._mesh.xskinInfo = this._skinInfo,
        this._mesh.xurl = s
    }
    
    setVisibility(e,t) {
        Array.isArray(e) ? e.forEach(r=>{
            this.setVisibility(r, t)
        }
        ) : e.isAnInstance || (e.visibility = t)
    }
    
    setPickable(e,t) {
        Array.isArray(e) ? e.forEach(r=>{
            this.setPickable(r, t)
        }
        ) : ("isPickable"in e && (e.isPickable = t),
        e.setEnabled(t))
    }
    
    hide() {
        var e;
        this._isVisible = !1,
        this.mesh && this.setVisibility(this.mesh, 0),
        this.mesh && this.setPickable(this.mesh, !1),
        (e = this.mesh) == null || e.getChildMeshes().forEach(t=>{
            this.setVisibility(t, 0),
            this.setPickable(t, !1)
        }
        )
    }
    
    show() {
        var e;
        this._isVisible = !0,
        this.mesh && this.setVisibility(this.mesh, 1),
        this.mesh && this.setPickable(this.mesh, !0),
        (e = this.mesh) == null || e.getChildMeshes().forEach(t=>{
            this.setVisibility(t, 1),
            this.setPickable(t, !0)
        }
        )
    }
    
    attachToAvatar(e, t={x:0, y:.5, z:0}, r={yaw:0, pitch:0, roll:0}, n={x:.35, y:.35, z:.35}) {
        const o = ue4Scaling2Xverse(n)
          , a = ue4Rotation2Xverse(r)
          , s = ue4Position2Xverse(t)
          , l = this._mesh;
        e && l ? (e.setParent(l),
        e.position = s,
        e.rotation = a,
        e.scaling = o) : logger.error("[Engine] avatar or attachment not found!")
    }
    
    detachFromAvatar(e,t=!1) {
        this._mesh && e ? this._mesh.removeChild(e) : logger.error("[Engine] avatar not found!")
    }
    
    get mesh() {
        return this._mesh
    }
    get position() {
        var o;
        if (!this._mesh)
            return null;
        const {x: e, y: t, z: r} = (o = this._mesh) == null ? void 0 : o.position;
        return xversePosition2Ue4({
            x: e,
            y: t,
            z: r
        })
    }
    get id() {
        return this._id
    }
    get group() {
        return this._group
    }
    get isMoving() {
        return this._isMoving
    }
    get isVisible() {
        return this._isVisible
    }
    get isRotating() {
        return this._isRotating
    }
    get skinInfo() {
        return this._skinInfo
    }
    allowMove() {
        this._mesh != null && (this._mesh.getChildMeshes().forEach(e=>{
            e.unfreezeWorldMatrix()
        }
        ),
        this._mesh.unfreezeWorldMatrix())
    }
    unallowMove() {
        this._mesh != null && (this._mesh.getChildMeshes().forEach(e=>{
            e.freezeWorldMatrix()
        }
        ),
        this._mesh.freezeWorldMatrix())
    }
    getID() {
        return this._id
    }
    setPosition(e) {
        if (this._mesh) {
            const t = ue4Position2Xverse(e);
            this._mesh.position = t
        } else
            logger.error("[Engine] no root for positioning")
    }
    setRotation(e) {
        const t = ue4Rotation2Xverse_mesh(e);
        this._mesh ? this._mesh.rotation = t : logger.error("[Engine] no root for rotating")
    }
    setScale(e) {
        this._mesh ? this._mesh.scaling = new BABYLON.Vector3(e,e,-e) : logger.error("[Engine] no root for scaling")
    }
    disableAvatar() {
        var e;
        (e = this._mesh) == null || e.setEnabled(!1)
    }
    enableAvatar() {
        var e;
        (e = this._mesh) == null || e.setEnabled(!0)
    }
    togglePickable(e) {
        var t;
        (t = this.mesh) == null || t.getChildMeshes().forEach(r=>{
            "instances"in r && "isPickable"in r && (r.isPickable = e)
        }
        ),
        this.mesh != null && "isPickable"in this.mesh && (this.mesh.isPickable = e)
    }
    setMaterial(e) {
        var t;
        (t = this.mesh) == null || t.getChildMeshes().forEach(r=>{
            "instances"in r && "material"in r && (r.material = e)
        }
        ),
        this.mesh != null && "material"in this.mesh && (this.mesh.material = e)
    }
    dispose(e=!1, t=!1) {
        !this.mesh.isDisposed() && this.mesh.dispose(e, t)
    }
}