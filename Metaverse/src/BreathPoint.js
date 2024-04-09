export default class BreathPoint {
    constructor(panoInfo) {
        E(this, "_staticmesh");
        E(this, "_id");
        E(this, "_mat");
        E(this, "_type");
        E(this, "_maxVisibleRegion");
        E(this, "_skinInfo");
        E(this, "_scene");
        E(this, "_isInScene");
        const {mesh: xStaticMesh, id: id, position: position, rotation: rotation, mat: material, type: type="default", maxVisibleRegion: maxVisibleRegion=-1, scene: scene, skinInfo: skinInfo="default"} = panoInfo;
        this._id = id;
        xStaticMesh.mesh.position = ue4Position2Xverse(position);
        xStaticMesh.mesh.rotation = ue4Rotation2Xverse(rotation);
        this._staticmesh = xStaticMesh;
        this._mat = material;
        this._type = type;
        this._maxVisibleRegion = maxVisibleRegion;
        this._scene = scene;
        this._skinInfo = skinInfo;
        this._isInScene = !0;
    }
    get isInScene() {
        return this._isInScene
    }
    get skinInfo() {
        return this._skinInfo
    }
    get maxvisibleregion() {
        return this._maxVisibleRegion
    }
    getMesh() {
        return this._staticmesh
    }
    get mesh() {
        return this._staticmesh.mesh
    }
    toggleVisibility(e) {
        e == !0 ? this._staticmesh.show() : this._staticmesh.hide()
    }
    changePickable(e) {
        this._staticmesh.mesh.isPickable = e
    }
    removeFromScene() {
        if(this._isInScene){
            this._staticmesh.mesh != null && this._scene.removeMesh(this._staticmesh.mesh)
            this._isInScene = !1
        }
    }
    addToScene() {
        if(this._isInScene == !1){
            this._staticmesh.mesh != null && this._scene.addMesh(this._staticmesh.mesh);
            this._isInScene = !0
        }
    }
    dispose() {
        let mesh = this._staticmesh.mesh
        if(mesh != null){
            mesh.dispose(!1, !1)
        }
    }
    set position(e) {
        this._staticmesh.mesh.position = ue4Position2Xverse(e)
    }
    get position() {
        return xversePosition2Ue4(this._staticmesh.mesh.position)
    }
    set rotation(e) {
        this._staticmesh.mesh.rotation = ue4Rotation2Xverse(e)
    }
    get rotation() {
        return xverseRotation2Ue4(this._staticmesh.mesh.rotation)
    }
}