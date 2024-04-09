
import XDecalTextureError from "./error/XDecalTextureError"

export default class XDecalMaterial {
    constructor(e, t) {
        E(this, "_id");
        E(this, "_tex");
        E(this, "scene");
        E(this, "_mat");
        E(this, "_speed", .001);
        E(this, "_slots", 1);
        E(this, "_visibleSlots", 1);
        E(this, "_isRegisterAnimation");
        E(this, "_animeObserver", null);
        E(this, "_uOffsetObserverable");
        E(this, "reg_mat_update", ()=>{
            const e = this._mat.diffuseTexture;
            e != null && (e.uOffset = e.uOffset + this._speed,
            e.uOffset > 1 && (e.uOffset -= 1),
            Math.round(e.uOffset % (1 / this._slots) / this._speed) == 0 && this._uOffsetObserverable.notifyObservers(this))
        }
        );
        E(this, "setTexture", async(e,t=!0,r=!1,n=1,o=1,a=1,s=1)=>new Promise((l,u)=>{
            this._slots = a,
            this._visibleSlots = s;
            const c = this._tex;
            r ? (this._tex = new BABYLON.DynamicTexture("dyTex",{
                width: n,
                height: o
            },this.scene,!0,BABYLON.Texture.BILINEAR_SAMPLINGMODE),
            this._tex.name = "decal_dy_" + this._id,
            this._tex.uScale = s / a,
            this._tex.vScale = -1,
            this._tex.vOffset = 1,
            this._tex.wrapU = 1,
            this._mat.emissiveColor = new BABYLON.Color3(.95,.95,.95),
            this._mat.diffuseTexture = this._tex,
            this._mat.diffuseTexture.hasAlpha = !0,
            this._mat.useAlphaFromDiffuseTexture = !0,
            this._mat.backFaceCulling = !1,
            this._mat.transparencyMode = BABYLON.Material.MATERIAL_ALPHATEST,
            c != null && c.dispose(),
            l(!0)) : !r && t && typeof e == "string" ? this._tex = new BABYLON.Texture(e,this.scene,!0,!1,BABYLON.Texture.BILINEAR_SAMPLINGMODE,()=>{
                this._tex.name = "decal_" + this._id,
                this._mat.emissiveTexture = this._tex,
                this._mat.diffuseTexture = this._tex,
                this._mat.diffuseTexture.hasAlpha = !0,
                this._mat.useAlphaFromDiffuseTexture = !0,
                this._mat.transparencyMode = BABYLON.Material.MATERIAL_ALPHATEST,
                c != null && c.dispose(),
                l(!0)
            }
            ,()=>{
                logger.error("[Engine] decal create texture error!"),
                u(new XDecalTextureError("[Engine] decal create texture error!"))
            }
            ,null,!0) : this._tex = new BABYLON.Texture("data:decal_" + this._id,this.scene,!0,!1,BABYLON.Texture.BILINEAR_SAMPLINGMODE,()=>{
                this._tex.name = "decal_" + this._id,
                this._mat.emissiveTexture = this._tex,
                this._mat.diffuseTexture = this._tex,
                this._mat.diffuseTexture.hasAlpha = !0,
                this._mat.useAlphaFromDiffuseTexture = !0,
                this._mat.transparencyMode = Material.MATERIAL_ALPHATEST,
                c != null && c.dispose(),
                l(!0)
            }
            ,()=>{
                logger.error("[Engine] decal create texture error!"),
                u(new XDecalTextureError("[Engine] decal create texture error!"))
            }
            ,e,!0)
        }
        ));
        this._id = e,
        this.scene = t,
        this._mat = new BABYLON.StandardMaterial("decalMat_" + this._id,this.scene),
        this._isRegisterAnimation = !1,
        this._uOffsetObserverable = new Observable
    }
    get uOffsetObserverable() {
        return this._uOffsetObserverable
    }
    getMat() {
        return this._mat
    }
    set speed(e) {
        this._speed = e
    }
    getUOffset() {
        return this._tex.uOffset
    }
    do_animation(e) {
        this._speed = e,
        this._isRegisterAnimation == !1 && (this._isRegisterAnimation = !0,
        this._animeObserver = this.scene.onBeforeRenderObservable.add(()=>{
            this.reg_mat_update()
        }
        ))
    }
    changeTexture(e, t=!1, r=!1, n=1, o=1, a=1, s=1) {
        return this._mat == null || this._tex == null ? (logger.error("[Engine] Decal Mat is null or tex is null"),
        Promise.reject(new XDecalTextureError("[Engine] Decal Mat is null or tex is null"))) : this.setTexture(e, t, r, n, o, a, s)
    }
    cleanTexture() {
        logger.info("[Engine] Decal clean Texture"),
        this.scene.onBeforeRenderObservable.remove(this._animeObserver),
        this._uOffsetObserverable.clear(),
        this._tex.dispose(),
        this._mat.dispose()
    }
}