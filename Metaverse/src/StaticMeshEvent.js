
import EMeshType from "./enum/EMeshType.js"

const LongPressMesh = [EMeshType.XAvatar];
export default class StaticMeshEvent extends EventEmitter {
    constructor(e) {
        super();
        E(this, "scene");
        E(this, "_staringPointerTime", -1);
        E(this, "_pickedMeshID", "0");
        E(this, "_pointerDownTime", -1);
        E(this, "_currentPickPoint");
        E(this, "_longPressDelay", 500);
        E(this, "_pointerTapDelay", 200);
        E(this, "_pickedMeshType");
        E(this, "registerEvent", ()=>{
            this.scene.onPrePointerObservable.add(this.onDown, BABYLON.PointerEventTypes.POINTERDOWN),
            this.scene.onPrePointerObservable.add(this.onUp, BABYLON.PointerEventTypes.POINTERUP),
            this.scene.onPrePointerObservable.add(this.onDoubleTap, BABYLON.PointerEventTypes.POINTERDOUBLETAP),
            this.scene.onDispose = ()=>{
                this.scene.onPrePointerObservable.removeCallback(this.onUp),
                this.scene.onPrePointerObservable.removeCallback(this.onDown),
                this.scene.onPrePointerObservable.removeCallback(this.onDoubleTap)
            }
        }
        );
        E(this, "onUp", ()=>{
            if (Date.now() - this._pointerDownTime < this._pointerTapDelay && !this.scene._inputManager._isPointerSwiping()) {
                this.scene._inputManager._totalPointersPressed = 0;
                let e = this._currentPickPoint;
                e != null && LongPressMesh.indexOf(e.type) == -1 && this.scene._inputManager._totalPointersPressed == 0 && this.emit("pointTap", e),
                e != null && LongPressMesh.indexOf(e.type) != -1 && (e = this.onPointerTap(t=>t.isPickable && LongPressMesh.indexOf(t.xtype) == -1),
                e != null && this.emit("pointTap", e))
            }
        }
        );
        E(this, "onDown", ()=>{
            let e = this.onPointerTap(t=>t.isPickable);
            this._currentPickPoint = e,
            this._pointerDownTime = Date.now(),
            e != null && LongPressMesh.indexOf(e.type) != -1 && (this._staringPointerTime = Date.now(),
            this._pickedMeshID = e.id,
            this._pickedMeshType = e.type,
            window.setTimeout(()=>{
                e = this.onPointerTap(t=>t.isPickable && t.xtype == this._pickedMeshType && t.xid == this._pickedMeshID),
                e !== null && Date.now() - this._staringPointerTime > this._longPressDelay && !this.scene._inputManager._isPointerSwiping() && this.scene._inputManager._totalPointersPressed !== 0 && (this._staringPointerTime = 0,
                this.emit("longPress", e))
            }
            , this._longPressDelay))
        }
        );
        E(this, "onDoubleTap", ()=>{
            const e = this.onPointerTap(void 0);
            e != null && this.emit("pointDoubleTap", e)
        }
        );
        this.manager = e,
        this.scene = e.Scene,
        this.registerEvent(),
        this._currentPickPoint = null,
        this._pickedMeshType = null
    }
    onPointerTap(e, t=!1) {
        var n, o;
        let r = new BABYLON.PickingInfo;
        if (t) {
            const a = this.scene.multiPick(this.scene.pointerX, this.scene.pointerY, e, void 0, void 0);
            a && a.length > 1 ? r = a[1] : a && (r = a[0])
        } else
            r = this.scene.pick(this.scene.pointerX, this.scene.pointerY, e, !1, null);
        if (r.hit) {
            const a = (n = r == null ? void 0 : r.pickedPoint) == null ? void 0 : n.asArray();
            if (a) {
                const [s,l,u] = a
                  , c = xversePosition2Ue4({
                    x: s,
                    y: l,
                    z: u
                });
                return {
                    name: (o = r.pickedMesh) == null ? void 0 : o.name,
                    type: r.pickedMesh.xtype,
                    id: r.pickedMesh.xid,
                    point: c
                }
            }
        }
        return null
    }
}