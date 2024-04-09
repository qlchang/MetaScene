export default class XCameraComponent {
    constructor(canvas, scene, r) {
        this.maincameraRotLimitObserver = null
        this.mainCamera
        this.cgCamera
        this.saveCameraPose
        this._cameraPose
        this.forceKeepVertical = !1

        this.scene = scene,
        this.canvas = canvas,
        this.yuvInfo = r.yuvInfo,
        r.forceKeepVertical != null && (this.forceKeepVertical = r.forceKeepVertical),
        this.initCamera(r.cameraParam)
    }
    
    initCamera = cameraParam=>{
        const {maxZ: t=1e4, minZ: r=.1, angularSensibility: n=2e3} = cameraParam;
        this.mainCamera = new BABYLON.FreeCamera("camera_main",new BABYLON.Vector3(0,0,1),this.scene),
        this.mainCamera.mode = BABYLON.Camera.PERSPECTIVE_CAMERA,
        this.mainCamera.speed = .1,
        this.mainCamera.angularSensibility = n,
        this.mainCamera.setTarget(new BABYLON.Vector3(0,0,0)),
        this.mainCamera.minZ = r,
        this.mainCamera.fov = Math.PI * this.yuvInfo.fov / 180,
        this.mainCamera.maxZ = t,
        this.mainCamera.fovMode = BABYLON.Camera.FOVMODE_HORIZONTAL_FIXED,
        this.cgCamera = new BABYLON.FreeCamera("camera_temp",new BABYLON.Vector3(0,1e3,0),this.scene),
        this.cgCamera.mode = BABYLON.Camera.PERSPECTIVE_CAMERA,
        this.cgCamera.speed = .1,
        this.cgCamera.setTarget(new BABYLON.Vector3(0,1010,0)),
        this.cgCamera.maxZ = t,
        this.cgCamera.minZ = r,
        this.cgCamera.fovMode = BABYLON.Camera.FOVMODE_HORIZONTAL_FIXED,
        this.cameraFovChange(this.yuvInfo)
    }
    cameraFovChange = e=>{
        this.yuvInfo = e;
        const t = e.width
          , r = e.height
          , n = this.canvas.width
          , o = this.canvas.height
          , a = e.fov;
        if (this.forceKeepVertical == !0) {
            const s = t / (2 * Math.tan(Math.PI * a / 360))
              , l = 2 * Math.atan(r / (2 * s));
            this.mainCamera.fov = l,
            this.cgCamera.fov = l,
            this.mainCamera.fovMode = BABYLON.Camera.FOVMODE_VERTICAL_FIXED,
            this.cgCamera.fovMode = BABYLON.Camera.FOVMODE_VERTICAL_FIXED
        } else if (this.mainCamera.fovMode = BABYLON.Camera.FOVMODE_HORIZONTAL_FIXED,
        this.cgCamera.fovMode = BABYLON.Camera.FOVMODE_HORIZONTAL_FIXED,
        n / o < t / r && this.mainCamera.fov) {
            const s = o
              , l = n
              , u = s * t / r / (2 * Math.tan(a * Math.PI / 360))
              , c = 2 * Math.atan(l / (2 * u));
            this.mainCamera.fov = c,
            this.cgCamera.fov = c
        } else
            this.mainCamera.fov = Math.PI * a / 180,
            this.cgCamera.fov = Math.PI * a / 180
    }
    setCameraPose = e=>{
        var n;
        const t = ue4Position2Xverse(e.position);
        let r = null;
        e.rotation != null && (r = ue4Rotation2Xverse(e.rotation)),
        this._cameraPose = {
            position: t
        },
        r != null && (this._cameraPose.rotation = r),
        this.scene.activeCamera === this.mainCamera && !((n = this.mainCamera) != null && n.isDisposed()) && this._setCamPositionRotation(this.mainCamera, this._cameraPose)
    }
    _setCamPositionRotation = (e,t)=>{
        var r, n;
        t.position && (e.position = (r = t.position) == null ? void 0 : r.clone()),
        t.rotation && (e.rotation = (n = t.rotation) == null ? void 0 : n.clone())
    }
    switchCamera = e=>{
        var t;
        (t = this.scene.activeCamera) == null || t.detachControl(this.canvas),
        this.scene.activeCamera = e
    }
    reCalXYZRot = (e,t)=>(
        e = e % (2 * Math.PI),
        Math.abs(t - e) >= Math.PI && (e = e - 2 * Math.PI),
        e
    )
    _moveCam = (e,t,r,n,o,a,s,l)=>{
        const u = (v,y,b)=>(v.x = this.reCalXYZRot(v.x, y.x),
        v.y = this.reCalXYZRot(v.y, y.y),
        v.z = this.reCalXYZRot(v.z, y.z),
        new BABYLON.Vector3((y.x - v.x) * b + v.x,(y.y - v.y) * b + v.y,(y.z - v.z) * b + v.z))
          , c = function(v, y, b) {
            return new BABYLON.Vector3((y.x - v.x) * b + v.x,(y.y - v.y) * b + v.y,(y.z - v.z) * b + v.z)
        }
          , h = new Animation("myAnimation1","position",s,Animation.ANIMATIONTYPE_VECTOR3,Animation.ANIMATIONLOOPMODE_CONSTANT);
        let f = []
          , d = t
          , _ = r;
        for (let v = 0; v < a; ++v)
            f.push({
                frame: v,
                value: c(d, _, v / a)
            });
        f.push({
            frame: f.length,
            value: c(d, _, 1)
        }),
        h.setKeys(f);
        const g = new Animation("myAnimation2","rotation",s,Animation.ANIMATIONTYPE_VECTOR3,Animation.ANIMATIONLOOPMODE_CONSTANT);
        f = [],
        d = n,
        _ = o;
        for (let v = 0; v < a; ++v)
            f.push({
                frame: v,
                value: u(d, _, v / a)
            });
        f.push({
            frame: f.length,
            value: u(d, _, 1)
        }),
        g.setKeys(f),
        e.animations.push(g),
        e.animations.push(h);
        const m = this.scene.beginAnimation(e, 0, a, !1);
        m.onAnimationEnd = ()=>{
            l(),
            m.stop(),
            m.animationStarted = !1
        }
    }

    get MainCamera() {
        return this.mainCamera
    }
    get CgCamera() {
        return this.cgCamera
    }
    getCameraHorizonFov() {
        return this.mainCamera.fovMode == BABYLON.Camera.FOVMODE_HORIZONTAL_FIXED ? this.mainCamera.fov : Math.PI * this.yuvInfo.fov / 180
    }
    changeMainCameraRotationDamping(e=2e3) {
        this.mainCamera.angularSensibility = e
    }
    removeMainCameraRotationLimit() {
        this.maincameraRotLimitObserver != null && this.mainCamera.onAfterCheckInputsObservable.remove(this.maincameraRotLimitObserver)
    }
    setMainCameraInfo(e) {
        const {maxZ: t=1e4, minZ: r=.1, angularSensibility: n=2e3} = e;
        this.mainCamera.maxZ = t,
        this.mainCamera.minZ = r,
        this.mainCamera.angularSensibility = n
    }
    getMainCameraInfo() {
        return {
            maxZ: this.mainCamera.maxZ,
            minZ: this.mainCamera.minZ,
            angularSensibility: this.mainCamera.angularSensibility
        }
    }
    _limitAngle(e, t) {
        return Math.abs(Math.abs(t[0] - t[1]) - 360) < 1e-6 || (e = (e % 360 + 360) % 360,
        t[0] = (t[0] % 360 + 360) % 360,
        t[1] = (t[1] % 360 + 360) % 360,
        t[0] > t[1] ? e > t[1] && e < t[0] && (Math.abs(e - t[0]) < Math.abs(e - t[1]) ? e = t[0] : e = t[1]) : e < t[0] ? e = t[0] : e > t[1] && (e = t[1])),
        e
    }
    setMainCameraRotationLimit(e, t) {
        this.maincameraRotLimitObserver != null && this.removeMainCameraRotationLimit();
        const r = this.mainCamera
          , {yaw: n, pitch: o, roll: a} = e
          , {yaw: s, pitch: l, roll: u} = t;
        if (s < 0 || l < 0 || u < 0)
        //相机旋转限制只能设置为大于0
            throw new Error("\u76F8\u673A\u65CB\u8F6C\u9650\u5236\u53EA\u80FD\u8BBE\u7F6E\u4E3A\u5927\u4E8E0");
        const c = [o - l, o + l]
          , h = [n - s, n + s]
          , f = [a - u, a + u];
        this.maincameraRotLimitObserver = r.onAfterCheckInputsObservable.add(()=>{
            let {pitch: d, yaw: _, roll: g} = xverseRotation2Ue4(r.rotation);
            d = this._limitAngle(d, c),
            _ = this._limitAngle(_, h),
            g = this._limitAngle(g, f),
            r.rotation = ue4Rotation2Xverse({
                pitch: d,
                yaw: _,
                roll: g
            })
        }
        )
    }
    setMainCameraRotationLimitByAnchor(e, t, r) {
        this.maincameraRotLimitObserver != null && this.removeMainCameraRotationLimit();
        const n = this.mainCamera
          , o = ue4Rotation2Xverse_mesh(t)
          , a = ue4Rotation2Xverse_mesh(r);
        a != null && o != null && e.mesh != null && (this.maincameraRotLimitObserver = n.onAfterCheckInputsObservable.add(()=>{
            const s = e.mesh.rotation;
            r.yaw > 0 && (n.rotation.y <= s.y - a.y + o.y ? n.rotation.y = s.y - a.y + o.y : n.rotation.y >= s.y + a.y + o.y && (n.rotation.y = s.y + a.y + o.y)),
            r.pitch > 0 && (n.rotation.x <= s.x - a.x + o.x ? n.rotation.x = s.x - a.x + o.x : n.rotation.x >= s.x + a.x + o.x && (n.rotation.x = s.x + a.x + o.x)),
            r.roll > 0 && (n.rotation.z <= s.z - a.z + o.z ? n.rotation.z = s.z - a.z + o.z : n.rotation.z >= s.z + a.z + o.z && (n.rotation.z = s.z + a.z + o.z))
        }
        ))
    }
    getCameraPose() {
        const e = xversePosition2Ue4({
            x: this.mainCamera.position.x,
            y: this.mainCamera.position.y,
            z: this.mainCamera.position.z
        })
          , t = xverseRotation2Ue4({
            x: this.mainCamera.rotation.x,
            y: this.mainCamera.rotation.y,
            z: this.mainCamera.rotation.z
        });
        return {
            position: e,
            rotation: t
        }
    }
    changeCameraFov(e, t) {
        this.mainCamera.fov = e,
        t != null && (this.mainCamera.fovMode = t == 0 ? BABYLON.Camera.FOVMODE_HORIZONTAL_FIXED : BABYLON.Camera.FOVMODE_VERTICAL_FIXED)
    }
    controlCameraRotation(e, t, r=.5, n=.5) {
        const o = {
            pitch: n * t * 180,
            yaw: r * e * 180,
            roll: 0
        };
        this.addRot(o)
    }
    addRot(e) {
        const t = this.mainCamera
          , r = ue4Rotation2Xverse_mesh(e);
        r != null && t.rotation.addInPlace(r)
    }
    getCameraFov() {
        return this.mainCamera.fov
    }
    allowMainCameraController() {
        this.mainCamera.attachControl(this.canvas, !0)
    }
    detachMainCameraController() {
        this.mainCamera.detachControl(this.canvas)
    }
    forceChangeSavedCameraPose(e) {
        this.saveCameraPose != null && (e.position != null && (this.saveCameraPose.position = ue4Position2Xverse(e.position)),
        e.rotation != null && (this.saveCameraPose.rotation = ue4Rotation2Xverse(e.rotation)))
    }
    changeToFirstPersonView(e) {
        this.saveCameraPose = {
            position: this.mainCamera.position.clone(),
            rotation: this.mainCamera.rotation.clone()
        },
        this.mainCamera.attachControl(this.canvas, !0),
        e.position != null && (this.mainCamera.position = ue4Position2Xverse(e.position)),
        e.rotation != null && (this.mainCamera.rotation = ue4Rotation2Xverse(e.rotation))
    }
    changeToThirdPersonView() {
        this.saveCameraPose != null && this.mainCamera != null && (this.mainCamera.position = this.saveCameraPose.position.clone(),
        this.mainCamera.rotation = this.saveCameraPose.rotation.clone(),
        this.mainCamera.detachControl(this.canvas))
    }
    switchToMainCamera() {
        this.switchCamera(this.mainCamera)
    }
    switchToCgCamera() {
        this.switchCamera(this.cgCamera)
    }
    moveMainCamera(e, t, r, n, o) {
        this._moveCam(this.mainCamera, this.mainCamera.position, e, this.mainCamera.rotation, t, r, n, o)
    }
}