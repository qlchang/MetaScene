import EMeshType from "./enum/EMeshType.js"
import XDecalTextureError from "./error/XDecalTextureError.js"
import Logger from "./Logger.js"

const logger = new Logger('DecalManager')

export default class XDecal {
    constructor(e) {
        E(this, "_id");
        E(this, "meshPath");
        E(this, "_low_model", []);
        E(this, "_mat", null);
        E(this, "scene");
        E(this, "_skinInfo");
        E(this, "sourceMatId", "");
        E(this, "loadModel", async()=>new Promise((e,t)=>{
            typeof this.meshPath == "string" ? BABYLON.SceneLoader.LoadAssetContainerAsync("", this.meshPath, this.scene, null, ".glb").then(r=>{
                for (let n = r.materials.length - 1; n >= 0; --n)
                    r.materials[n].dispose();
                for (let n = 0; n < r.meshes.length; ++n)
                    r.meshes[n].visibility = 1,
                    r.meshes[n].isPickable = !0,
                    r.meshes[n].checkCollisions = !1,
                    "hasVertexAlpha"in r.meshes[n] && (r.meshes[n].hasVertexAlpha = !1),
                    this.scene.addMesh(r.meshes[n]),
                    this._low_model.push(new XStaticMesh({
                        id: this._id,
                        mesh: r.meshes[n],
                        xtype: EMeshType.Decal,
                        skinInfo: this._skinInfo
                    })),
                    this.toggle(!1);
                e(!0)
            }
            ).catch(r=>{
                t(new XDecalError(`[Engine] decal load model error! ${r}`))
            }
            ) : t(new XDecalError("[Engine] decal inport mesh is not string!"))
        }
        ).catch(e=>{
            new XDecalError(`[Engine] decal loadModel ${e}`)
        }
        ));
        const {id: t, scene: r, meshPath: n, skinInfo: o="default"} = e;
        this._id = t,
        this.scene = r,
        this.meshPath = n,
        this._skinInfo = o
    }
    get skinInfo() {
        return this._skinInfo
    }
    getMesh() {
        return this._low_model
    }
    getMat() {
        return this._mat
    }
    get id() {
        return this._id
    }
    toggle(e) {
        for (let t = 0; t < this._low_model.length; ++t)
            e == !0 ? this._low_model[t].show() : this._low_model[t].hide()
    }
    setMat(e) {
        this._mat = e;
        for (let t = 0; t < this._low_model.length; ++t)
            this._low_model[t].mesh.material = this._mat;
        this.toggle(!0)
    }
    changeModel(e="") {
        return e != "" && (this.meshPath = e),
        this.meshPath == "" ? (logger.error("[Engine] changeModel Error! meshPath is empty"),
        Promise.reject(new XDecalTextureError("[Engine] changeModel Error! meshPath is empty"))) : new Promise((t,r)=>BABYLON.SceneLoader.LoadAssetContainerAsync("", this.meshPath, this.scene, null, ".glb").then(n=>{
            for (let a = n.materials.length - 1; a >= 0; --a)
                n.materials[a].dispose();
            const o = [];
            for (let a = 0; a < n.meshes.length; ++a)
                n.meshes[a].visibility = 0,
                n.meshes[a].isPickable = !0,
                n.meshes[a].checkCollisions = !1,
                "hasVertexAlpha"in n.meshes[a] && (n.meshes[a].hasVertexAlpha = !1),
                this._mat != null && (n.meshes[a].material = this._mat),
                this.scene.addMesh(n.meshes[a]),
                o.push(new XStaticMesh({
                    id: this._id,
                    mesh: n.meshes[a],
                    xtype: EMeshType.Decal,
                    skinInfo: this._skinInfo
                }));
            e != "" && this.cleanMesh(),
            this._low_model = o,
            this._mat != null && this.toggle(!0),
            t(this)
        }
        ).catch(n=>{
            logger.error("[Engine] Create decal error! " + n),
            r(new XDecalError("[Engine] Create decal error! " + n))
        }
        ))
    }
    cleanMesh(e=!1, t=!1) {
        logger.info("[Engine] Decal Model clean mesh");
        for (let r = 0; r < this._low_model.length; ++r)
            this._low_model[r].dispose(e, t)
    }
}