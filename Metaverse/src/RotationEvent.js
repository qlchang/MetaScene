export default class RotationEvent {
    constructor(e) {
        E(this, "touchStartX");
        E(this, "touchStartY");
        E(this, "handelResize");
        E(this, "_room");
        E(this, "_canvas");
        E(this, "handleTouchStart", e=>{
            const t = e.touches[0];
            this.touchStartX = t.pageX,
            this.touchStartY = t.pageY,
            this._room.emit("touchStart", {
                event: e
            })
        }
        );
        E(this, "handleMouseDown", e=>{
            this.touchStartX = e.pageX,
            this.touchStartY = e.pageY
        }
        );
        E(this, "handleMouseMove", e=>{
            if (!this.touchStartX || !this.touchStartY)
                return;
            const t = e.pageX
              , r = e.pageY
              , n = t - this.touchStartX
              , o = r - this.touchStartY
              , a = this._room.options.canvas.offsetHeight
              , s = this._room.options.canvas.offsetWidth;
            // 后端定，鼠标移动一个canvas width转动90度。*2移动距离加倍，所以前端实际会转180度
            let l = 2 * o / a
              , u = 2 * n / s;
            // 瞬时最大不超过90度
            l > 1 && (l = 1),
            u > 1 && (u = 1),
            this._room.actionsHandler.rotate({
                pitch: l,
                yaw: u
            }),
            this.touchStartX = t,
            this.touchStartY = r
        }
        );
        E(this, "handleMouseUp", ()=>{
            this.touchStartX = void 0,
            this.touchStartY = void 0
        }
        );
        E(this, "handleTouchMove", e=>{
            if (!this.touchStartX || !this.touchStartY)
                return;
            const t = e.touches[0]
              , r = t.pageX
              , n = t.pageY
              , o = r - this.touchStartX
              , a = n - this.touchStartY
              , s = this._room.options.canvas.offsetHeight
              , l = this._room.options.canvas.offsetWidth;
            let u = 2 * a / s
              , c = 2 * o / l;
            u > 1 && (u = 1),
            c > 1 && (c = 1),
            this._room.actionsHandler.rotate({
                pitch: u,
                yaw: c
            }),
            this.touchStartX = r,
            this.touchStartY = n,
            this._room.emit("touchMove", {
                pitch: u,
                yaw: c,
                event: e
            })
        }
        );
        E(this, "handleTouchEnd", e=>{
            this._room.emit("touchEnd", {
                event: e
            })
        }
        );
        this._room = e,
        this._canvas = e.canvas,
        this.handelResize = this.reiszeChange()
    }
    init() {
        this._canvas.addEventListener("touchstart", this.handleTouchStart),
        this._canvas.addEventListener("touchmove", this.handleTouchMove),
        this._canvas.addEventListener("touchend", this.handleTouchEnd),
        this._room.scene.preventDefaultOnPointerDown = !1,
        this._room.scene.preventDefaultOnPointerUp = !1,
        this._canvas.addEventListener("mousedown", this.handleMouseDown),
        this._canvas.addEventListener("mousemove", this.handleMouseMove),
        this._canvas.addEventListener("mouseup", this.handleMouseUp)
    }
    clear() {
        this._canvas.removeEventListener("touchstart", this.handleTouchStart),
        this._canvas.removeEventListener("touchmove", this.handleTouchMove),
        this._canvas.removeEventListener("touchend", this.handleTouchEnd),
        this._canvas.removeEventListener("mousedown", this.handleMouseDown),
        this._canvas.removeEventListener("mousemove", this.handleMouseMove),
        this._canvas.removeEventListener("mouseup", this.handleMouseUp)
    }
    reiszeChange() {
        window.addEventListener("resize", ()=>{}
        )
    }
}