import Logger from "./Logger.js"

const logger = new Logger('StateMachine')
export default class XStateMachine {
    constructor(scene) {
        this.state
        this.isMoving
        this.isRotating
        this._observer
        this._movingObserver
        this._scene = scene
    }
    rotateTo(avatar, t, r, aniName) {
        return new Promise((resolve, reject)=>{
            const scene = avatar.avatarManager.scene;
            if (r && avatar.setRotation(r), t == r) return resolve();

            avatar.priority === 0 && logger.info(`avatar ${avatar.id} starts to rotate from ${r} to ${t}`);

            let lerpRatio = 0;
            const u = 1e3 / 25
              , c = calcDistance3DAngle(t, avatar.rotation) / u;

            this._movingObserver && scene.onBeforeRenderObservable.remove(this._movingObserver),
            avatar.controller && avatar.controller.playAnimation(aniName || "Walking", !0),
            this._movingObserver = scene && scene.onBeforeRenderObservable.add(()=>{
                if (lerpRatio < 1) {
                    if (!avatar.rootNode) return avatar.setRotation(t), resolve();
                    const d = BABYLON.Vector3.Lerp(avatar.rootNode.rotation, ue4Rotation2Xverse(t), lerpRatio);
                    avatar.setRotation(xverseRotation2Ue4(d)),
                    lerpRatio += u / (c * 1e3)
                } else
                    return scene.onBeforeRenderObservable.remove(this._movingObserver),
                    avatar.controller && avatar.controller.playAnimation("Idle", !0),
                    resolve()
            })
        })
    }
    _filterPathPoint(e) {
        let t = 0;
        const r = 1e-4;
        if (e.length <= 1)
            return [];
        for (; t < e.length - 1; )
            calcDistance3D(e[t], e[t + 1]) < r ? e.splice(t, 1) : t++;
        return e
    }
    moveTo(avatar, t, r, n, aniName, a) {
        return new Promise((resolve, reject)=>{
            const scene = avatar.avatarManager.scene;
            avatar.priority === 0 && logger.info(`avatar ${avatar.id} starts to move from ${t} to ${r}`);

            let lerpRatio = 0;
            a ? a = a.concat(r) : a = [r],
            a = this._filterPathPoint(a);
            let h = t
              , f = a.shift();
            if (!f) return reject("[Engine input path error]");
            let d = calcDistance3D(h, f) / n;
            const _ = 1e3 / 25;
            avatar.rootNode.lookAt(ue4Position2Xverse(f));

            const rotationUE4 = xverseRotation2Ue4({
                x: avatar.rootNode.rotation.x,
                y: avatar.rootNode.rotation.y,
                z: avatar.rootNode.rotation.z
            });
            rotationUE4 && (
                rotationUE4.roll = 0,
                rotationUE4.pitch = 0,
                avatar.setRotation(rotationUE4)
            ),

            this._movingObserver && scene.onBeforeRenderObservable.remove(this._movingObserver),
            avatar.controller && avatar.controller.playAnimation(aniName, !0),
            this._movingObserver = scene && scene.onBeforeRenderObservable.add(()=>{
                if (lerpRatio < 1) 
                {
                    const y = BABYLON.Vector3.Lerp(ue4Position2Xverse(h), ue4Position2Xverse(f), lerpRatio);
                    if (avatar.setPosition(xversePosition2Ue4(y)), !avatar.rootNode)
                        return avatar.setPosition(r),
                        resolve();
                    lerpRatio += _ / (d * 1e3)
                } else if (h = f, f = a.shift(), f) 
                {
                    d = calcDistance3D(h, f) / n,
                    avatar.rootNode.lookAt(ue4Position2Xverse(f));
                    const rotationUE4 = xverseRotation2Ue4({
                        x: avatar.rootNode.rotation.x,
                        y: avatar.rootNode.rotation.y,
                        z: avatar.rootNode.rotation.z
                    });
                    rotationUE4 && (
                        rotationUE4.roll = 0,
                        rotationUE4.pitch = 0,
                        avatar.setRotation(rotationUE4)
                    ),
                    lerpRatio = 0
                } else
                    return scene.onBeforeRenderObservable.remove(this._movingObserver),
                    avatar.controller && avatar.controller.playAnimation("Idle", !0),
                    resolve()
            }
            )
        }
        )
    }
    lookAt(e, t, r) {
        return new Promise(n=>{
            var _, g;
            const o = ue4Position2Xverse(t)
              , s = e.rootNode.position.subtract(o).length()
              , l = new BABYLON.Vector3(s * Math.sin(e.rootNode.rotation.y),0,s * Math.cos(e.rootNode.rotation.y))
              , u = (_ = e.rootNode) == null ? void 0 : _.position.add(l);
            let c = 0;
            const h = r || 1 / 100
              , f = (g = e.rootNode) == null ? void 0 : g.getScene()
              , d = f == null ? void 0 : f.onBeforeRenderObservable.add(()=>{
                var y, b;
                const m = (y = e.controller) == null ? void 0 : y.animations.find(T=>T.name == "Idle");
                (m == null ? void 0 : m.isPlaying) != !0 && (m == null || m.play());
                const v = BABYLON.Vector3.Lerp(u, o, c);
                c < 1 ? ((b = e.rootNode) == null || b.lookAt(v),
                c += h) : (d && f.onBeforeRenderObservable.remove(d),
                n())
            }
            )
        }
        )
    }
    sendObjectTo(e, t, r, n=2, o=10, a={
        x: 0,
        y: 0,
        z: 150
    }) {
        return new Promise((s,l)=>{
            var u;
            if (!r.loaded)
                l("Gift has not inited!");
            else {
                const c = (u = e.rootNode) == null ? void 0 : u.getScene();
                let h = 0;
                const f = 1 / (n * 25)
                  , d = f
                  , _ = o / 100
                  , g = 8 * _ * f * f;
                let m = .5 * g / f
                  , v = ue4Position2Xverse(e.position);
                const y = ue4Position2Xverse(a)
                  , b = ue4Position2Xverse(e.position)
                  , T = c == null ? void 0 : c.onBeforeRenderObservable.add(()=>{
                    (!t || !e.position || !t.position) && (T && c.onBeforeRenderObservable.remove(T),
                    l("Invalid receiver when shoot gift!")),
                    r.loaded || (T && c.onBeforeRenderObservable.remove(T),
                    s());
                    const C = ue4Position2Xverse(t.position)
                      , A = new BABYLON.Vector3((C.x - b.x) * f,m,(C.z - b.z) * f);
                    m = m - g,
                    h < 1 ? (v = v.add(A),
                    r.setPositionVector(v.add(y)),
                    h += d) : (s(),
                    T && c.onBeforeRenderObservable.remove(T))
                }
                )
            }
        }
        )
    }
    roll(e, t, r, n) {
        var o, a;
        this._observer && ((o = this._scene) == null || o.onBeforeRenderObservable.remove(this._observer)),
        t && (r = r != null ? r : 1,
        n = n != null ? n : 1,
        this._observer = (a = this._scene) == null ? void 0 : a.onBeforeRenderObservable.add(()=>{
            e.rootNode.rotation.y += r * .1 * n,
            e.rootNode.rotation.y %= Math.PI * 2
        }
        ))
    }
    disposeObsever() {
        this._movingObserver && this._scene.onBeforeRenderObservable.remove(this._movingObserver)
    }
}