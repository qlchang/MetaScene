import XStaticMesh from "./XStaticMesh.js"
import XLowpolyModelError from "./error/XLowpolyModelError.js"
import util from "./util.js"
import EMeshType from "./enum/EMeshType.js"
import Logger from "./Logger.js"

const logger = new Logger('StaticMeshComponent')
export default class XStaticMeshFromOneGltf {
    
    constructor(scene, options) {

        this._meshes = [],
        this._scene = scene,
        this._url = options.url,

        options.group != null ? this._group = options.group : this._group = "default",
        options.pick != null ? this._pickable = options.pick : this._pickable = !1,
        options.id != null ? this._id = options.id : this._id = "default",
        options.lod != null ? this._lod = options.lod : this._lod = -1,
        options.skinInfo != null ? this._skinInfo = options.skinInfo : this._skinInfo = "default",

        this._groupUuid = util.uuid(),
        this._isInScene = !1
    }
    
    loadMesh(pureVideoShader, t) {
        const meshLength0 = this._meshes.length
          , isVisi = t ? 1 : 0
          , url = this._url;

        return BABYLON.SceneLoader.LoadAssetContainerAsync("", url, this._scene, ()=>{
            this._scene.blockMaterialDirtyMechanism = !0
        }, ".glb").then(modelInfo => {

            for (let s = modelInfo.materials.length - 1; s >= 0; --s)
                modelInfo.materials[s].dispose();

            this._scene.blockMaterialDirtyMechanism = !0;

            for (let i = 0; i < modelInfo.meshes.length; ++i) {
                const mesh = modelInfo.meshes[i];
                if ("instances"in mesh) {
                    "visibility"in mesh && (mesh.visibility = 0);
                    "isPickable"in mesh && (mesh.isPickable = this._pickable);
                    pureVideoShader && (mesh.material = pureVideoShader);
                    "hasVertexAlpha"in mesh && (mesh.hasVertexAlpha = !1);

                    const xMesh = new XStaticMesh({
                        id: this._groupUuid + "-" + Math.random().toString(36).substr(2, 5),
                        mesh,
                        lod: this._lod,
                        group: this._group,
                        url: this._url,
                        xtype: EMeshType.XStaticMesh,
                        skinInfo: this._skinInfo
                    });
                    // 房间模型初始180度矫正
                    xMesh.setRotation({pitch: 0, roll:0, yaw:180})
                    this._meshes.push(xMesh);
                }
                this._scene.addMesh(mesh);
            }
            return !0
        }).then(() => {
            this._isInScene = !0;
            for (let i = meshLength0; i < this._meshes.length; ++i)
                this._meshes[i].mesh.visibility = isVisi;
            return Promise.resolve(!0)
        }).catch(e => {
            logger.error("[Engine] input gltf mesh uri error! " + e),
            Promise.reject(new XLowpolyModelError("[Engine] input gltf mesh uri error! " + e))
        })
    }

    get isinscene() {
        return this._isInScene
    }
    get groupUuid() {
        return this._groupUuid
    }
    get skinInfo() {
        return this._skinInfo
    }
    get group() {
        return this._group
    }
    get meshes() {
        return this._meshes
    }
    get url() {
        return this._url
    }
    get id() {
        return this._id
    }
    get lod() {
        return this._lod
    }
    removeFromScene() {
        if (this._isInScene) {
            this._isInScene = !1;
            for (let e = 0, t = this._meshes.length; e < t; ++e)
                this._meshes[e].mesh != null && this._scene.removeMesh(this._meshes[e].mesh)
        }
    }
    addToScene() {
        if (this._isInScene == !1) {
            this._isInScene = !0;
            for (let e = 0, t = this._meshes.length; e < t; ++e)
                this._meshes[e].mesh != null && this._scene.addMesh(this._meshes[e].mesh)
        }
    }
    toggleVisibility(e) {
        const t = e ? 1 : 0;
        for (let r = 0, n = this._meshes.length; r < n; ++r)
            "visibility"in this._meshes[r].mesh && (this._meshes[r].mesh.visibility = t)
    }
    togglePickable(e) {
        for (let t = 0, r = this._meshes.length; t < r; ++t)
            "isPickable"in this._meshes[t].mesh && (this._meshes[t].mesh.isPickable = e)
    }
    setMaterial(e) {
        for (let t = 0, r = this._meshes.length; t < r; ++t)
            "material"in this._meshes[t].mesh && (this._meshes[t].mesh.material = e)
    }
    dispose() {
        for (let e = 0, t = this._meshes.length; e < t; ++e)
            this._meshes[e].mesh.dispose(!1, !1)
    }
}