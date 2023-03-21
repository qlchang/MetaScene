import XDecalManager from "./XDecalManager.js"
import XTelevision from "./XTelevision.js";

export default class TV extends XTelevision {
    constructor(id, meshUrl, room, options) {
        super(room.scene, meshUrl, room.sceneManager, options);
        E(this, "decal");
        E(this, "id");
        E(this, "imageUrl");
        E(this, "mode", "video");
        E(this, "room");
        E(this, "setVideo", (e, t=!1, r=!0)=>super.setVideo(e, t, r).then(()=>this));
        this.id = id,
        this.room = room,
        this.decal = new XDecalManager(room.sceneManager)
    }
    show() {
        this.mode === "video" ? this.toggle(!0) : this.mode === "poster" && this.showPoster()
    }
    hide() {
        this.mode === "video" ? this.toggle(!1) : this.mode === "poster" && this.hidePoster()
    }
    showVideo() {
        this.mode = "video",
        this.toggle(!0)
    }
    hideVideo() {
        this.toggle(!1)
    }
    showPoster() {
        const e = this.imageUrl;
        if (!e)
            return Promise.reject("set poster url before show it");
        if (!this.decal)
            return Promise.reject("decal was not found");
        const t = this.id;
        return this.decal.addDecal({
            id: t,
            meshPath: this.meshPath
        }).then(()=>{
            var r;
            this.mode = "poster",
            (r = this.decal) == null || r.setDecalTexture({
                id: t,
                buffer: e
            }).then(()=>{
                var n;
                (n = this.decal) == null || n.toggle(t, !0)
            }
            )
        }
        )
    }
    setPoster(e) {
        return this.imageUrl = e,
        this.showPoster()
    }
    hidePoster() {
        return this.decal ? this.decal.toggle(this.id, !1) : Promise.reject("decal was not found")
    }
    setUrl(e) {
        const {url: t, loop: r, muted: n} = e || {};
        return t ? super.setUrl({
            url: t,
            bLoop: r,
            bMuted: n
        }).then(()=>(
            this.videoElement && (
                this.videoElement.crossOrigin = "anonymous",
                this.videoElement.playsInline = !0,
                this.videoElement.load()
            ),
            this.mode = "video",
            this
        )) : Promise.reject("tv url is required")
    }
    mirrorFrom(e) {
        const t = e.getVideoMat();
        return this.setSameVideo(t).then(()=>{
            this.toggle(!0)
        }
        )
    }
    clean() {
        var e;
        this.cleanTv(!1, !0),
        (e = this.decal) == null || e.deleteDecal(this.id)
    }
}