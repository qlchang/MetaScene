const BREATH_POINT_TYPE = "debugBreathPoint"
  , TAP_BREATH_POINT_TYPE = "debugTapBreathPoint"
  , DEFAULT_SEARCH_RANGE = 1e3;
  
export default class Debug {
    constructor(e) {
        E(this, "isShowNearbyBreathPoints", !1);
        E(this, "isShowTapBreathPoints", !1);
        E(this, "isSceneShading", !0);
        E(this, "searchRange", DEFAULT_SEARCH_RANGE);
        E(this, "nearbyBreathPointListening", !1);
        E(this, "tapBreathPointListening", !1);
        E(this, "dumpStreamTimer", 0);
        this.room = e
    }
    toggleStats() {
        return this.room.stats.isShow ? this.room.stats.hide() : this.room.stats.show()
    }
    toggleNearbyBreathPoint(e=DEFAULT_SEARCH_RANGE) {
        this.searchRange = e,
        this.isShowNearbyBreathPoints = !this.isShowNearbyBreathPoints,
        this.isShowNearbyBreathPoints ? (this.getPointsAndRender(),
        this.setupNearbyBreathPointListener()) : this.room.breathPointManager.clearBreathPoints(BREATH_POINT_TYPE)
    }
    toggleTapBreathPoint() {
        this.isShowTapBreathPoints = !this.isShowTapBreathPoints,
        this.isShowTapBreathPoints ? this.setupTapPointListener() : this.room.breathPointManager.clearBreathPoints(TAP_BREATH_POINT_TYPE)
    }
    dumpStream(e, t=10 * 1e3) {
        if (this.dumpStreamTimer)
            throw new Error("dumpStream running");
        this.room.networkController.rtcp.workers.saveframe = !0,
        this.dumpStreamTimer = window.setTimeout(()=>{
            this.room.networkController.rtcp.workers.SaveMediaStream = !0,
            this.dumpStreamTimer = 0,
            e && e()
        }
        , t)
    }
    toggleSceneshading() {
        this.isSceneShading = !this.isSceneShading,
        this.isSceneShading ? this.room.sceneManager.changeVideoShaderForLowModel() : this.room.sceneManager.changeDefaultShaderForLowModel()
    }
    setupTapPointListener() {
        this.tapBreathPointListening || (this.tapBreathPointListening = !0,
        this.room.on("_coreClick", ({point: e})=>{
            this.isShowTapBreathPoints && this.renderTapBreathPoint({
                id: "tapToint",
                position: e
            })
        }
        ))
    }
    renderTapBreathPoint({position: e, id: t}) {
        let r;
        if (r = this.room.breathPointManager.breathPoints.get(t)) {
            r.position = e;
            return
        }
        this.room.breathPointManager.addBreathPoint({
            id: t,
            position: e,
            type: TAP_BREATH_POINT_TYPE,
            size: .8,
            forceLeaveGround: !0,
            billboardMode: !0,
            rotation: Math.abs(e.z) < 20 ? {
                pitch: 90,
                yaw: 0,
                roll: 0
            } : {
                pitch: 0,
                yaw: 270,
                roll: 0
            }
        })
    }
    setupNearbyBreathPointListener() {
        var e;
        this.nearbyBreathPointListening || (this.nearbyBreathPointListening = !0,
        (e = this.room._userAvatar) == null || e.on("stopMoving", ()=>{
            this.isShowNearbyBreathPoints && this.getPointsAndRender()
        }
        ))
    }
    async getPointsAndRender() {
        var r, n;
        const e = this.searchRange
          , t = ((r = this.room._userAvatar) == null ? void 0 : r.position) && await this.getNeighborPoints({
            point: (n = this.room._userAvatar) == null ? void 0 : n.position,
            containSelf: !0,
            searchRange: e
        }) || [];
        this.room.breathPointManager.breathPoints.forEach(o=>{
            !!t.find(s=>JSON.stringify(s) === o._id) || this.room.breathPointManager.clearBreathPoints(o._id)
        }
        ),
        t.forEach(o=>{
            const a = o.breakPointId + "" // JSON.stringify(o);
            this.room.breathPointManager.breathPoints.get(a) || this.room.breathPointManager.addBreathPoint({
                id: a,
                position: o.position,
                type: BREATH_POINT_TYPE,
                rotation: {
                    pitch: 90,
                    yaw: 0,
                    roll: 0
                },
                forceLeaveGround: !0
            })
        }
        )
    }
    getNeighborPoints(e) {
        const {point: t, containSelf: r=!1, searchRange: n=500} = e;
        return this.room.actionsHandler.getNeighborPoints({
            point: t,
            containSelf: r,
            searchRange: n
        })
    }
}