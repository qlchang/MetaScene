import XStaticMesh from "./XStaticMesh.js"
import EMeshType from "./enum/EMeshType.js"
import XStaticMeshFromOneGltf from "./XStaticMeshFromOneGltf.js"
import XLowpolyModelError from "./error/XLowpolyModelError.js"
import Logger from "./Logger.js"
import XLowpolyJsonError from "./Error/XLowpolyJsonError.js"

const logger = new Logger('StaticMeshComponent')
export default class XStaticMeshComponent{
    constructor(scenemanager) {
        this._CgPlane
        this._orijson
        this._notUsedRegionLists

        this._lowModel_group = new Map,
        this._staticmeshes = [],
        this._meshInfoJson = null,
        this._meshInfoKeys = [],
        this._currentUpdateRegionCount = 0,
        this._abosoluteUrl = "",
        this._partMeshSkinInfo = "",
        this._forceLod = 3,
        this._allowRegionUpdate = !1,
        this._allowRegionForceLod = !1,
        this._currentMeshUsedLod = new Map,
        this._currentPartGroup = new Set,
        this._scenemanager = scenemanager,
        this.scene = scenemanager.Scene,
        this.regionIdInCamera = [],
        this.regionIdInCameraConst = [],
        this._cameraInRegionId = -1,
        this._rootDir = "",
        this._meshVis = !0,
        this._meshVisTypeName = {
            groupName: "",
            skinInfo: ""
        },
        this._doMeshVisChangeNumber = -1,
        this._visCheckDurationFrameNumber = -1,
        this._regionLodRule = [0, 1, 3, 3, -1],
        this.initCgLowModel(),
        this._regionPartLoop()
    }

    reg_staticmesh_partupdate() {
        this._allowRegionUpdate && (
            this.scene.getFrameId(),
            this._meshUpdateFrame()
        )
        if (this._allowRegionForceLod) {
            this.scene.getFrameId() % 2 == 0 && this.setOneRegionLod(this._meshInfoKeys[this._currentUpdateRegionCount % this._meshInfoKeys.length].toString(), this._forceLod);
            let t = !0;
            const r = Array.from(this._currentMeshUsedLod.keys());
            if (r.length > 0) {
                for (let n = 0; n < r.length; ++n)
                    this._currentMeshUsedLod.get(r[n]) != this._forceLod && (t = !1);
                t && (this._allowRegionForceLod = !1)
            }
        }
    }

    setMeshInfo(e,t="") {
        this._abosoluteUrl != e && (
            this._abosoluteUrl.length > 0 && this.deleteLastRegionMesh(),
            this._partMeshSkinInfo = t,
            this._abosoluteUrl = e,
            this._rootDir = this._abosoluteUrl.slice(0, -4) + "/",
            this.parseJson(this._rootDir + "meshInfo.json").then(()=>{
                this.startMeshUpdate()
            })
        )
    }

    _meshUpdateFrame() {
        {
            let e = this._meshInfoKeys[this._currentUpdateRegionCount % this._meshInfoKeys.length];
            const t = !0;
            let r = 3;
            if (this._scenemanager != null && this._scenemanager.cameraComponent != null) {
                const n = this._getMainPlayerPosition();
                if (n != null) {
                    if (this._cameraInRegionId >= 0) {
                        const a = this.getRegionIdWhichIncludeCamera(n);
                        (this._cameraInRegionId != a || this.regionIdInCamera.length == 0) && (this._cameraInRegionId = a,
                        this.regionIdInCamera = this._getNeighborId(this._cameraInRegionId.toString()),
                        this.regionIdInCameraConst = this.regionIdInCamera.slice());
                        let s = this.regionIdInCamera.pop();
                        for (; s != null; )
                            if (this._notUsedRegionLists.indexOf(s) >= 0)
                                s = this.regionIdInCamera.pop();
                            else
                                break;
                        s != null && (e = s.toString())
                    } else
                        this._cameraInRegionId = this.getRegionIdWhichIncludeCamera(n);
                    if (this._currentMeshUsedLod.size == 0 || this._notUsedRegionLists.indexOf(parseInt(e)) >= 0) {
                        e = this._cameraInRegionId.toString();
                        const a = this._getNeighborId(e);
                        for (; a.length == 0 && (e = this.getNearestRegionIdWithCamera(n).toString()),
                        this._notUsedRegionLists.indexOf(parseInt(e)) >= 0; )
                            e = a.pop().toString()
                    }
                    const o = this._meshInfoJson[this._cameraInRegionId.toString()].lod;
                    r = 3,
                    this._cameraInRegionId.toString() == e ? r = this._regionLodRule[0] : o[0].indexOf(parseInt(e)) >= 0 ? r = this._regionLodRule[1] : o[1].indexOf(parseInt(e)) >= 0 ? r = this._regionLodRule[2] : o[2].indexOf(parseInt(e)) >= 0 ? r = this._regionLodRule[3] : r = this._regionLodRule[4]
                }
            }
            this.setOneRegionLod(e, r, t),
            this.updateRegionNotInLocalNeighbor(),
            this.cleanRootNodes()
        }
    }

    updateRegionNotInLocalNeighbor() {
        Array.from(this._currentMeshUsedLod.keys()).forEach(t=>{
            this.regionIdInCameraConst.indexOf(parseInt(t)) < 0 && this.setOneRegionLod(t, -1)
        }
        )
    }

    cleanRootNodes() {
        if (this.scene.getFrameId() % 3 == 0) {
            const e = [];
            this.scene.rootNodes.forEach(t=>{
                (t.getClassName() == "TransformNode" && t.getChildren().length == 0 || t.getClassName() == "Mesh" && t.name == "__root__" && t.getChildren().length == 0) && e.push(t)
            }
            ),
            e.forEach(t=>{
                t.dispose()
            }
            )
        }
    }

    setOneRegionLod(e,t,r=!0) {
        this._currentUpdateRegionCount++;
        const n = this._calHashCode(this._rootDir)
          , o = "region_" + n + "_" + e;
        if (t < 0) {
            this._currentMeshUsedLod.has(e) && (this._currentMeshUsedLod.delete(e),
            this._currentPartGroup.delete(o),
            this.deleteMeshesByCustomProperty("group", "region_" + n + "_" + e));
            return
        }
        const a = this._rootDir + e + "_lod" + t + "_xverse.glb"
          , s = this._currentMeshUsedLod.get(e);
        this._currentPartGroup.add(o),
        s != null ? s != t && (this._currentMeshUsedLod.set(e, t),
        this._scenemanager.addNewLowPolyMesh({
            url: a,
            group: "region_" + n + "_" + e,
            pick: !0,
            lod: t,
            skinInfo: this._partMeshSkinInfo
        }, [{
            group: "region_" + n + "_" + e,
            mode: 0
        }])) : (this._currentMeshUsedLod.set(e, t),
        this._scenemanager.addNewLowPolyMesh({
            url: a,
            group: "region_" + n + "_" + e,
            pick: !0,
            lod: t,
            skinInfo: this._partMeshSkinInfo
        }))
    }

    checkPointInView({x: e, y: t, z: r}) {
        const n = ue4Position2Xverse({
            x: e,
            y: t,
            z: r
        });
        if (!n)
            return !1;
        for (let o = 0; o < 6; o++)
            if (this.scene.frustumPlanes[o].dotCoordinate(n) < 0)
                return !1;
        return !0
    }
    
    // 加载房间的glb模型
    addNewLowPolyMesh(modelInfo, t, pureVideoShader) {

        if (!modelInfo.url.endsWith("glb") && !modelInfo.url.startsWith("blob:")) {
            return modelInfo.url.endsWith("zip") ? (
                this.setMeshInfo(modelInfo.url, modelInfo.skinInfo),
                Promise.resolve(!0)
            ) : (
                logger.error("[Engine] input model path is error! ", modelInfo.url),
                Promise.reject(new XLowpolyModelError("[Engine] input model path is error! " + modelInfo.url))
            );
        }

        const fileUrl = modelInfo.url;
        return new Promise((o, a) => {
            this._scenemanager.urlTransformer(modelInfo.url).then(blobUrl=>{
                modelInfo.url = blobUrl;
                const l = new XStaticMeshFromOneGltf(this.scene, modelInfo)
                    , time0 = Date.now();

                return new Promise((c, h)=>{
                    l.loadMesh(pureVideoShader, !0).then(f => {
                        const time1 = Date.now();
                        this._scenemanager.engineRunTimeStats.timeArray_loadStaticMesh.add(time1 - time0)
                        if (f == !0) {
                            const modelType = this.getLowModelType(modelInfo);
                            let g = 0;
                            this._lowModel_group.has(modelType) && (g = this._lowModel_group.get(modelType).length)

                            pureVideoShader && this._scenemanager.currentShader 
                            && this._scenemanager.currentShader.name != pureVideoShader.name 
                            && l.setMaterial(this._scenemanager.currentShader)

                            if (this._allowRegionUpdate == !1 && modelType.startsWith("region_"))
                                l.dispose();
                            else if (
                                this._staticmeshes.push(l),
                                this.lowmodelGroupMapAddValue(modelType, l),
                                t && t.length > 0
                            ) {
                                const m = [];
                                for (let v = 0; v < t.length; ++v)
                                    m.push(t[v].group),
                                    this.updateLowModelGroup(t[v], modelType, g)
                            }
                            this._scenemanager.engineRunTimeStats.timeArray_updateStaticMesh.add(Date.now() - time1),
                            c(!0)
                        } else
                            h(new XLowpolyModelError("[Engine] after lowmodel error!"))
                    }
                    ).catch(e=>{
                        logger.error("[Engine] load Mesh [" + fileUrl + "] error! " + e),
                        h(new XLowpolyModelError(`[Engine] load Mesh [${fileUrl}] error! ${e}`))
                    })
                })
            }).then(s=>{
                s == !0 ? (
                    logger.info(`[Engine] load Mesh [${fileUrl}] successfully.`),
                    o(!0)
                ) : a(!1)
            }
            ).catch(s=>{
                logger.error("[Engine] addNewLowPolyMesh [" + fileUrl + "] error! " + s),
                a(new XLowpolyModelError(`[Engine] addNewLowPolyMesh [${fileUrl}] error! ${s}`))
            })
        })
    }

    toggleLowModelVisibility(e) {
        const {vis: t, groupName: r="", skinInfo: n=""} = e;
        this._meshVis = t,
        this._meshVisTypeName = {
            groupName: r,
            skinInfo: n
        },
        this._doMeshVisChangeNumber = 0,
        r == Te.ALL_MESHES || this._currentPartGroup.has(r) == !0 || this._partMeshSkinInfo == n ? t == !1 ? (this._visCheckDurationFrameNumber = 100,
        this.stopMeshUpdate()) : (this._visCheckDurationFrameNumber = 1,
        this.startMeshUpdate()) : this._visCheckDurationFrameNumber = 1
    }
    
    reg_staticmesh_visibility() {
        if (this._doMeshVisChangeNumber >= 0)
            if (this._doMeshVisChangeNumber < this._visCheckDurationFrameNumber)
                if (this._doMeshVisChangeNumber = this._doMeshVisChangeNumber + 1,
                this._meshVisTypeName.groupName == Te.ALL_MESHES)
                    this._lowModel_group.forEach((e,t)=>{
                        for (let r = 0, n = e.length; r < n; ++r)
                            e[r].toggleVisibility(this._meshVis)
                    }
                    );
                else {
                    if (this._lowModel_group.has(this._meshVisTypeName.groupName))
                        for (let e = 0; e < this._lowModel_group.get(this._meshVisTypeName.groupName).length; ++e)
                            this._lowModel_group.get(this._meshVisTypeName.groupName)[e].toggleVisibility(this._meshVis);
                    if (this._meshVisTypeName.skinInfo != "")
                        for (let e = 0; e < this._staticmeshes.length; ++e)
                            this._staticmeshes[e].skinInfo == this._meshVisTypeName.skinInfo && this._staticmeshes[e].toggleVisibility(this._meshVis)
                }
            else
                this._meshVis = !0,
                this._meshVisTypeName = {
                    groupName: "",
                    skinInfo: ""
                },
                this._doMeshVisChangeNumber = -1
    }

    _getMeshesByCustomProperty(e,t) {
        let r = [];
        return this._staticmeshes.forEach(n=>{
            n[e] != null && n[e] == t && (r = r.concat(n.meshes))
        }
        ),
        r
    }

    get cameraInRegionId() {
        return this._cameraInRegionId
    }
    setRegionLodRule(e) {
        return e.length != 5 ? !1 : (e.forEach(t=>{}
        ),
        this._regionLodRule = e,
        !0)
    }
    get lowModel_group() {
        return this._lowModel_group
    }
    _regionPartLoop() {
        this.scene.registerBeforeRender(this.reg_staticmesh_partupdate),
        this.scene.registerAfterRender(this.reg_staticmesh_visibility)
    }
    _globalSearchCameraInWhichRegion(e, t) {
        let r = -1;
        for (let n = 0; n < t.length; ++n) {
            const o = this._meshInfoJson[t[n].toString()].boundingbox
              , a = o[0]
              , s = o[1];
            if (e.x >= a[0] && e.x <= s[0] && e.y >= a[1] && e.y <= s[1] && e.z >= a[2] && e.z <= s[2] || e.x >= s[0] && e.x <= a[0] && e.y >= s[1] && e.y <= a[1] && e.z >= s[2] && e.z <= a[2]) {
                r = parseInt(t[n].toString());
                break
            }
        }
        return r
    }
    getRegionIdByPosition(e) {
        return this.getRegionIdWhichIncludeCamera(e)
    }
    getRegionIdWhichIncludeCamera(e) {
        let t = -1;
        if (this._allowRegionUpdate == !1)
            return t;
        if (this._cameraInRegionId == -1 ? t = this._globalSearchCameraInWhichRegion(e, this._meshInfoKeys) : (t = this._globalSearchCameraInWhichRegion(e, this.regionIdInCameraConst),
        t == -1 && (t = this._globalSearchCameraInWhichRegion(e, this._meshInfoKeys))),
        t == -1) {
            let r = 1e7;
            for (let n = 0; n < this._meshInfoKeys.length; ++n) {
                const o = this._meshInfoJson[this._meshInfoKeys[n]].center
                  , a = Math.abs(e.x - o[0]) + Math.abs(e.y - o[1]);
                r > a && (r = a,
                t = parseInt(this._meshInfoKeys[n]))
            }
        }
        return t
    }
    getNearestRegionIdWithCamera(e) {
        let t = 1
          , r = 1e7;
        for (let n = 0; n < this._meshInfoKeys.length; ++n) {
            if (this._notUsedRegionLists.indexOf(parseInt(this._meshInfoKeys[n])) >= 0)
                continue;
            const o = this._meshInfoJson[this._meshInfoKeys[n]].center
              , a = Math.abs(e.x - o[0]) + Math.abs(e.y - o[1]);
            r > a && (r = a,
            t = parseInt(this._meshInfoKeys[n]))
        }
        return t
    }
    _getNeighborId(e) {
        const t = this._meshInfoJson[e].lod;
        let r = [];
        const n = Object.keys(t);
        for (let o = n.length - 1; o >= 0; --o)
            r = r.concat(t[n[o]]);
        return r.push(parseInt(e)),
        r
    }
    _getMainPlayerPosition() {
        const e = this._scenemanager.cameraComponent.getCameraPose().position
          , t = this._scenemanager.avatarComponent.getMainAvatar();
        if (t != null && t != null) {
            const r = t.position;
            if (r != null)
                return r
        }
        return e
    }
    _calHashCode(e) {
        return hashCode(e) + "_" + this._partMeshSkinInfo
    }
    forceAllRegionLod(e=3) {
        e < 0 && (e = 0),
        e > 3 && (e = 3),
        this.stopMeshUpdate(),
        this._allowRegionForceLod = !0,
        this._forceLod = e
    }
    deleteLastRegionMesh() {
        if (this._rootDir != "") {
            const e = this._calHashCode(this._rootDir);
            this._currentMeshUsedLod.clear(),
            this._currentPartGroup.clear(),
            this._meshInfoJson = null,
            this._meshInfoKeys = [],
            this._currentUpdateRegionCount = 0,
            this._orijson = null,
            this._notUsedRegionLists = [],
            this._partMeshSkinInfo = "",
            this._abosoluteUrl = "",
            this.stopMeshUpdate(),
            this.deleteMeshesByCustomProperty("group", "region_" + e, !0)
        }
    }
    startMeshUpdate() {
        this._allowRegionUpdate == !1 && this._meshInfoJson != null && this._abosoluteUrl != "" && this._meshInfoKeys.length > 0 && (this._allowRegionUpdate = !0)
    }
    stopMeshUpdate() {
        this._allowRegionUpdate = !1
    }
    parseJson(e) {
        return new Promise((t,r)=>this._scenemanager.urlTransformer(e).then(n=>{
            const o = new XMLHttpRequest;
            o.open("get", n),
            o.send(null),
            o.onload = ()=>{
                if (o.status == 200) {
                    const a = JSON.parse(o.responseText);
                    this._orijson = a,
                    this._meshInfoJson = this._orijson.usedRegion,
                    this._notUsedRegionLists = this._orijson.notUsedRegion,
                    this._meshInfoKeys = Object.keys(this._meshInfoJson),
                    logger.info("[Engine] parse zip mesh info successful"),
                    t()
                }
            }
            ,
            o.onerror = ()=>{
                logger.error(`[Engine] load zip mesh info json error, (provided by blob): ${n}`),
                r(new XLowpolyJsonError(`[Engine] load zip mesh info json error, (provided by blob): ${n}`))
            }
        }
        ).catch(n=>{
            logger.error(`[Engine] load zip mesh info json error: ${n}, link:${e}`),
            r(new XLowpolyJsonError(`[Engine] load zip mesh info json error: ${n}, link: ${e}`))
        }
        ))
    }
    initCgLowModel() {
        const e = BABYLON.MeshBuilder.CreatePlane("CgPlane", {
            size: 400
        });
        e.position = new BABYLON.Vector3(0,1010,0),
        e.rotation = new BABYLON.Vector3(3 * Math.PI / 2,0,0),
        this._CgPlane = new XStaticMesh({
            id: "CgPlane",
            mesh: e,
            xtype: EMeshType.Cgplane
        }),
        this._CgPlane.hide()
    }
    getLowModelType(e) {
        let t = "";
        return e.group != null ? t = e.group : t = "default",
        t
    }
    lowmodelGroupMapAddValue(e, t) {
        const r = this._lowModel_group.get(e);
        r != null ? (r.push(t),
        this._lowModel_group.set(e, r)) : this._lowModel_group.set(e, [t])
    }
    updateLowModelGroup(e, t, r) {
        let n = r;
        e.group == t || (n = -1),
        e.mode == 0 ? this.deleteLowModelGroup(e.group, n) : e.mode == 1 ? this.toggleVisibleLowModelGroup(!1, e.group, n) : e.mode == 2 && this.toggleVisibleLowModelGroup(!0, e.group, n)
    }
    toggleVisibleLowModelGroup(e, t, r=-1) {
        if (this._lowModel_group.has(t)) {
            const n = this._lowModel_group.get(t);
            let o = n.length;
            r >= 0 && o >= r && (o = r);
            for (let a = 0; a < o; ++a)
                n[a].toggleVisibility(e)
        }
    }
    deleteLowModelGroup(e, t=-1) {
        if (this._lowModel_group.has(e)) {
            const o = this._lowModel_group.get(e);
            let a = o.length;
            t >= 0 && a >= t && (a = t);
            for (let s = 0; s < a; ++s)
                o[s].dispose();
            t >= 0 ? this._lowModel_group.set(e, this._lowModel_group.get(e).slice(a)) : this._lowModel_group.delete(e)
        }
        const r = this._lowModel_group.get(e)
          , n = [];
        r != null && r.length > 0 ? this._staticmeshes.forEach(o=>{
            if (o.group != e)
                n.push(o);
            else
                for (let a = 0; a < r.length; ++a)
                    o.groupUuid == r[a].groupUuid && n.push(o)
        }
        ) : this._staticmeshes.forEach(o=>{
            o.group != e && n.push(o)
        }
        ),
        this._staticmeshes = n
    }
    deleteMeshesByGroup(e) {
        this.deleteLowModelGroup(e)
    }
    deleteMeshesById(e) {
        this.deleteMeshesByCustomProperty("id", e)
    }
    deleteMeshesByLoD(e) {
        this.deleteMeshesByCustomProperty("lod", e)
    }
    deleteMeshesBySkinInfo(e) {
        this.deleteMeshesByCustomProperty("skinInfo", e)
    }
    removeMeshesFromSceneByGroup(e) {
        this.removeMeshesFromSceneByCustomProperty("group", e)
    }
    removeMeshesFromSceneById(e) {
        this.removeMeshesFromSceneByCustomProperty("id", e)
    }
    addMeshesToSceneByGroup(e) {
        this.addMeshesToSceneByCustomProperty("group", e)
    }
    addMeshesToSceneById(e) {
        this.addMeshesToSceneByCustomProperty("id", e)
    }
    removeMeshesFromSceneByCustomProperty(e, t, r=!1) {
        this._staticmeshes.forEach(n=>{
            n.isinscene && n[e] != null && (r ? n[e].indexOf(t) < 0 || n.removeFromScene() : n[e] != t || n.removeFromScene())
        }
        )
    }
    addMeshesToSceneByCustomProperty(e, t, r=!1) {
        this._staticmeshes.forEach(n=>{
            n.isinscene == !1 && n[e] != null && (r ? n[e].indexOf(t) < 0 || n.addToScene() : n[e] != t || n.addToScene())
        }
        )
    }
    deleteMeshesByCustomProperty(e, t, r=!1) {
        const n = [];
        this._staticmeshes.forEach(a=>{
            a[e] != null && (r ? a[e].indexOf(t) < 0 ? n.push(a) : a.dispose() : a[e] != t ? n.push(a) : a.dispose())
        }
        ),
        this._staticmeshes = n;
        const o = Array.from(this._lowModel_group.keys());
        for (let a = 0; a < o.length; ++a) {
            const s = o[a]
              , l = this._lowModel_group.get(s);
            if (l != null) {
                const u = [];
                for (let c = 0; c < l.length; ++c)
                    l[c][e] != null && (r ? l[c][e].indexOf(t) < 0 && u.push(l[c]) : l[c][e] != t && u.push(l[c]));
                u.length > 0 ? this._lowModel_group.set(s, u) : this._lowModel_group.delete(s)
            }
        }
    }
    getMeshes() {
        let e = [];
        for (let t = 0; t < this._staticmeshes.length; ++t)
            e = e.concat(this._staticmeshes[t].meshes);
        return e
    }
    getCgMesh() {
        return this._CgPlane
    }
    getMeshesByGroup(e="default") {
        const t = this._lowModel_group.get(e);
        if (t != null) {
            let r = [];
            for (let n = 0; n < t.length; ++n)
                r = r.concat(t[n].meshes);
            return r
        } else
            return null
    }
    getMeshesByGroup2(e="default") {
        return this._getMeshesByCustomProperty("group", e)
    }
}