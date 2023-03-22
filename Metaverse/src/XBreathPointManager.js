import XStaticMesh from "./XStaticMesh.js"
import EMeshType from "./enum/EMeshType.js"
import BreathPoint from "./BreathPoint.js"
import Logger from "./Logger.js"
import XBreathPointError from "./Error/XBreathPointError.js"

//const pointsArr1 = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,144,145,146,147,148,149,150,151,152,153,154]
//const pointsArr2 = [61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181]
const pointsArr3 = [106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226]
//const pointsArr4 = [133,134,135,136,137,138,139,140,141,142,143,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,256,257,258,259,260,261,262,263,264,265,266,267,268,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,286]

const logger = new Logger('BreathPointManager')
export default class XBreathPointManager {
    constructor(e) {
        E(this, "_scene");
        E(this, "materialMap", new Map);
        E(this, "breathPoints", new Map);
        E(this, "_sceneManager");
        E(this, "_allIds", new Set);
        E(this, "_loopBPKeys", []);
        E(this, "addBreathPoint", async info=>{
            const t = [{
                // url: "https://static.xverse.cn/qqktv/texture.png"
                url: "./assets/textures/breathPoint/texture.png"
            },{
                url: "./assets/textures/breathPoint/texture_yellow.png"
            },{
                url: "./assets/textures/breathPoint/texture_purple.png"
            },{
                url: "./assets/textures/breathPoint/texture_green.png",
            }];
            if (t.length <= 0) {
                logger.warn("[Engine] BreathPoint get texture list error: textureList.length <= 0"),
                new XBreathPointError("[Engine] BreathPoint get texture list error!");
                return
            }
            let r = t[1]
            let {
                id, spriteSheet=r.url, spriteWidthNumber=20, spriteHeightNumber=1, position, rotation={ pitch: -90, yaw: 270, roll: 0 }, 
                size=.6, width=-1, height=-1, fps=30, billboardMode=!1, forceLeaveGround=!1, type="default", lifeTime=-1, backfaceculling=!0, 
                maxVisibleRegion=-1, skinInfo="default"
            } = info;

            if (this.breathPoints.get(id)) {
                logger.warn("[Engine] Cannot add breathPoint with an existing id: [" + id + "]"),
                new XBreathPointError("[Engine] Cannot add breathPoint with an existing id: [" + id + "]");
                return
            }
            if (forceLeaveGround) {
                const I = this.castRay(new BABYLON.Vector3(position.x, position.y, position.z)) * scaleFromUE4toXverse;
                I != 0 ? position.z = position.z - I + 1 : position.z = position.z + 1
            }

            // if(pointsArr1.indexOf(parseInt(id)) > -1) type = "p1"
            // if(pointsArr2.indexOf(parseInt(id)) > -1) type = "p2"
            // if(pointsArr3.indexOf(parseInt(id)) > -1) type = "p3"
            // if(pointsArr3.indexOf(parseInt(id)) > -1) {
            //     type = "p3"
            // }
            // else{
            //     type = "p1"
            // }

            let mat;
            if (this.materialMap.get(type)) {
                const I = this.materialMap.get(type);
                I.count = I.count + 1,
                mat = I.mat
            } else {
                const texture = new BABYLON.Texture(spriteSheet, this._scene, !0, !0, BABYLON.Texture.BILINEAR_SAMPLINGMODE, null, ()=>{
                    logger.error("[Engine] Breathpoint create texture error."),
                    new XBreathPointError("[Engine] Breathpoint create texture error.")
                } ,null, !0);
                texture.name = "TexBreathPoint_" + id,

                mat = new BABYLON.StandardMaterial(`MaterialBreathPoint_${id}`,this._scene)
                mat.alpha = 1,
                mat.emissiveTexture = texture,
                mat.backFaceCulling = backfaceculling,
                mat.diffuseTexture = texture,
                mat.diffuseTexture.hasAlpha = !0,
                mat.useAlphaFromDiffuseTexture = !0,
                // if(type == "p1") mat.emissiveColor.set(1,1,1)
                // else if(type == "p2") mat.emissiveColor.set(1,1,0.5)
                // else if(type == "p3") mat.emissiveColor.set(1,0.5,0)
                // else mat.emissiveColor.set(1,0,0)

                this.materialMap.set(type, {
                    mat,
                    count: 1,
                    lastRenderTime: Date.now(),
                    fps,
                    spriteWidthNumber,
                    spriteHeightNumber,
                    spriteSheet,
                    texture
                })
            }

            const faceUV = new Array(6);
            for (let i = 0; i < 6; i++) faceUV[i] = new BABYLON.Vector4(0,0,0,0);
            faceUV[0] = new BABYLON.Vector4(0, 0, 1 / spriteWidthNumber, 1 / spriteHeightNumber),
            faceUV[1] = new BABYLON.Vector4(0, 0, 1 / spriteWidthNumber, 1 / spriteHeightNumber);

            let options = {};
            width > 0 && height > 0 ? options = {
                width: width,
                height: height,
                depth: .01,
                faceUV
            } : options = {
                size: size,
                depth: .01,
                faceUV
            };

            const mesh = BABYLON.MeshBuilder.CreateBox(id, options, this._scene);
            mesh.material = mat;
            const xMesh = new XStaticMesh({
                id,
                mesh,
                xtype: EMeshType.XBreathPoint,
                skinInfo
            });
            
            let rota = rotation;
            billboardMode && (
                mesh.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL,
                xMesh.allowMove(),
                rota = {
                    pitch: 0,
                    yaw: 270,
                    roll: 0
                }
            );
            const breathPoint = new BreathPoint({
                type,
                mesh: xMesh,
                id,
                position,
                rotation: rota,
                mat,
                maxVisibleRegion,
                scene: this._scene,
                skinInfo
            });
            this.breathPoints.set(id, breathPoint),
            this._allIds.add(id),
            lifeTime > 0 && setTimeout(()=>{
                this.clearBreathPoints(id)
            }, lifeTime * 1e3)

            

            if(debugMode) {
                var textureBPNum = new BABYLON.DynamicTexture("dynamic_texture_" + id, {width:300, height:150}, this._scene);  
                textureBPNum.drawText(id, 0, 150, "bold 200px monospace", "white", "", true, true); 
                var materialBPNum = new BABYLON.StandardMaterial("MatBPNum_" + id, this._scene);
                materialBPNum.diffuseTexture = textureBPNum;
                materialBPNum.emissiveTexture = textureBPNum;
                materialBPNum.diffuseTexture.hasAlpha = !0
                materialBPNum.useAlphaFromDiffuseTexture = !0
                materialBPNum.zOffset = -4

                var bpNumMesh
                if(this.bpNumMesh) {
                    bpNumMesh = this.bpNumMesh.clone("BreathPointNum_" + id)
                } else {
                    bpNumMesh = BABYLON.MeshBuilder.CreatePlane("BreathPointNum_" + id, {width: 0.4, height: 0.2, subdivisions: 1}, this._scene);
                    bpNumMesh.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0)
                    this.bpNumMesh = bpNumMesh
                }
                bpNumMesh.position = mesh.position
                bpNumMesh.material = materialBPNum;
            }
        
        });

        E(this, "reg_breathpoint_update", ()=>{
            const e = new Date().getTime();
            if (this.materialMap != null)
                for (const [t,r] of this.materialMap)
                    e - r.lastRenderTime > 1e3 / r.fps && (r.lastRenderTime = e,
                    Math.abs(r.mat.diffuseTexture.uOffset - (1 - 1 / r.spriteWidthNumber)) < 1e-6 ? (r.mat.diffuseTexture.uOffset = 0,
                    Math.abs(r.mat.diffuseTexture.vOffset - (1 - 1 / r.spriteHeightNumber)) < 1e-6 ? r.mat.diffuseTexture.vOffset = 0 : r.mat.diffuseTexture.vOffset += 1 / r.spriteHeightNumber) : r.mat.diffuseTexture.uOffset += 1 / r.spriteWidthNumber)
        }
        );
        E(this, "reg_breathpoint_autovisible", ()=>{
            if (this._scene.getFrameId() % 2 == 0)
                if (this._loopBPKeys.length == 0)
                    this._loopBPKeys = Array.from(this._allIds);
                else {
                    const e = this._getMainPlayerPosition();
                    for (let t = 0; t < 5 && this._loopBPKeys.length > 0; ++t) {
                        const r = this._loopBPKeys.pop();
                        if (r != null) {
                            const n = this.getBreathPoint(r);
                            if (n != null && n.maxvisibleregion >= 0 && n.mesh.visibility == 1) {
                                const o = n.mesh.position;
                                calcDistance3DVector(e, o) >= n.maxvisibleregion ? n == null || n.removeFromScene() : n == null || n.addToScene()
                            }
                        }
                    }
                }
        }
        );
        this._sceneManager = e,
        this._scene = e.Scene,
        this._scene.registerBeforeRender(this.reg_breathpoint_update),
        this._scene.registerBeforeRender(this.reg_breathpoint_autovisible)
    }
    setAllBreathPointVisibility(e) {
        for (const [t,r] of this.breathPoints.entries())
            r.toggleVisibility(e)
    }
    toggleBPVisibilityBySkinInfo(e, t) {
        for (const [r,n] of this.breathPoints.entries())
            n.skinInfo == e && n.toggleVisibility(t)
    }
    toggleBPVisibilityById(e, t) {
        const r = this.getBreathPoint(e);
        r != null && r.toggleVisibility(t)
    }
    getBreathPointBySkinInfo(e) {
        const t = [];
        for (const [r,n] of this.breathPoints.entries())
            n.skinInfo == e && t.push(n);
        return t
    }
    getAllBreathPoint() {
        return this.breathPoints
    }
    getBreathPoint(e) {
        return this.breathPoints.get(e)
    }
    delete(e) {
        const t = this.breathPoints.get(e);
        if (t != null) {
            t.dispose(),
            this._allIds.delete(e);
            const r = this.materialMap.get(t._type);
            r != null && (r.count = r.count - 1,
            r.count <= 0 && (r.count = 0,
            r.texture.dispose(),
            r.mat.dispose(!0, !0),
            this.materialMap.delete(t._type))),
            this.breathPoints.delete(e)
        }
    }
    castRay(e) {
        var s;
        e = ue4Position2Xverse({
            x: e.x,
            y: e.y,
            z: e.z
        });
        const t = new BABYLON.Vector3(0,-1,0)
          , r = new BABYLON.Ray(e,t,length)
          , n = []
          , o = (s = this._sceneManager) == null ? void 0 : s.getGround({
            x: e.x,
            y: e.y,
            z: e.z
        });
        let a = r.intersectsMeshes(o);
        if (a.length > 0) {
            const l = a[0];
            if (l && l.pickedMesh) {
                const u = l.distance;
                t.y = 1;
                const c = r.intersectsMeshes(n);
                let h = 1e8;
                if (c.length > 0) {
                    const f = c[0];
                    return f && f.pickedMesh && (h = -f.distance),
                    h == 1e8 ? u : Math.abs(h) < Math.abs(u) ? h : u
                }
            }
        } else if (t.y = 1,
        a = r.intersectsMeshes(n),
        a.length > 0) {
            const l = a[0];
            if (l && l.pickedMesh)
                return l.distance
        }
        return 0
    }
    changePickable(e) {
        for (const [t,r] of this.breathPoints.entries())
            r.changePickable(e)
    }
    clearBreathPoints(e) {
        logger.info(`[Engine] clearBreathPoints: ${e}`);
        for (const [t,r] of this.breathPoints.entries())
            (r._type == e || r._id == e) && this.delete(r._id)
    }
    clearBreathPointsBySkinInfo(e) {
        logger.info(`[Engine] clearBreathPointsBySkinInfo: ${e}`);
        for (const [t,r] of this.breathPoints.entries())
            r.skinInfo == e && this.delete(r._id)
    }
    clearAllBreathPoints() {
        logger.info("[Engine] ClearAllBreathPoints");
        for (const [e,t] of this.breathPoints.entries())
            this.delete(t._id)
    }
    _getMainPlayerPosition() {
        var r;
        const e = this._sceneManager.cameraComponent.MainCamera.position
          , t = this._sceneManager.avatarComponent.getMainAvatar();
        if (t != null && t != null) {
            const n = (r = t == null ? void 0 : t.rootNode) == null ? void 0 : r.position;
            if (n != null)
                return n
        }
        return e
    }
    changeBreathPointPose(e, t, r) {
        const n = new BABYLON.Vector3(e.position.x,e.position.y,e.position.z);
        if (this.breathPoints.get(r) != null) {
            logger.info(`[Engine] changeBreathPointPose, id:${r}`);
            const o = this.breathPoints.get(r)
              , a = o.mesh.position;
            let s = a.subtract(n);
            s = BABYLON.Vector3.Normalize(s);
            const l = BABYLON.Vector3.Distance(a, n)
              , u = new Ray(n,s,l)
              , c = this._scene.multiPickWithRay(u);
            if (c) {
                for (let h = 0; h < c.length; h++)
                    if (c[h].pickedMesh != null && t.mesh.name.indexOf(c[h].pickedMesh.name) >= 0) {
                        const f = c[h].pickedPoint;
                        o.mesh.position = n.add(f.subtract(n).scale(.99)),
                        this.breathPoints.set(r, o)
                    }
            }
        } else
            logger.warn(`[Engine] changeBreathPointPose, id:${r} is not existing!`)
    }
}