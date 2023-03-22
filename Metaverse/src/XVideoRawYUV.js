export default class XVideoRawYUV {
    constructor(e, t) {
        E(this, "scene");
        E(this, "_videoRawYUVTexture");
        E(this, "videosResOriArray");
        E(this, "_currentVideoId");
        this.scene = e,
        this._videoRawYUVTexture = [],
        this.videosResOriArray = t,
        this._currentVideoId = -1;
        for (let r = 0; r < t.length; ++r)
            (n=>{
                const o = BABYLON.RawTexture.CreateLuminanceTexture(null, t[n].width, t[n].height * 1.5, this.scene, !1, !0);
                o.name = "videoTex_" + t[n].width + "_" + t[n].height,
                this._videoRawYUVTexture.push(o)
            }
            )(r)
    }
    inRange(e) {
        return e >= 0 && e < this._videoRawYUVTexture.length
    }
    getVideoYUVTex(e) {
        return this.inRange(e) ? this._videoRawYUVTexture[e] : null
    }

    findId(width, height) {
        let r = 0;
        for (let n = 0; n < this.videosResOriArray.length; ++n)
            if (this.videosResOriArray[n].width == width && this.videosResOriArray[n].height == height) {
                r = n;
                break
            }
        return r
    }
    getCurrentVideoTexId() {
        return this._currentVideoId
    }
    setCurrentVideoTexId(e) {
        this._currentVideoId = e
    }
}