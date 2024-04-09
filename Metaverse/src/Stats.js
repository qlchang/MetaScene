
import Logger from "./Logger.js"
import Xverse from "./Xverse.js"

const logger = new Logger('stats')
const numberFormat = new Intl.NumberFormat(window.navigator.language,{
    maximumFractionDigits: 0
});

export default class Stats extends EventEmitter {
    constructor(e) {
        super();
        this._netInterval = null
        this._disabled = !1
        this._show = !1
        this._aggregatedStats = {}
        this._displayElement = null
        this._extraStats = {}
        this._networkSamples = []
        this.externalStats = null
        this.constructedTime = null
        this.room = e,
        this.constructedTime = Date.now(),
        this._interval = window.setInterval(()=>{
            this._disabled || 
            e.networkController && 
            e.networkController.rtcp && 
            e.networkController.rtcp.workers && 
            this.onStats(e.networkController.rtcp.workers.uploadDataToServer())
        }
        , 1e3),
        this._netInterval = window.setInterval(()=>{
            this.getIsWeakNet()
        }
        , NET_INTERVAL * 1e3)
    }
    get isShow() {
        return this._show
    }
    assign(e) {
        Object.assign(this._extraStats, e),
        ((e == null ? void 0 : e.hb) || (e == null ? void 0 : e.rtt)) && this.startStatsNetSamples()
    }
    appendExternalStats(e) {
        const t = {};
        if (!e || typeof e != "object") {
            console.warn("appendExternalStats should be plain object");
            return
        }
        Object.keys(e).forEach(r=>{
            Object.prototype.hasOwnProperty.call(this._aggregatedStats, r) ? console.warn(`${r} is duplicate with internal stats`) : t[r] = e[r]
        }
        ),
        !(Object.keys(t).length > 10) && (this.externalStats = t)
    }
    getRtt() {
        const e = this._extraStats.rtt;
        return typeof e != "number" ? 0 : e > 999 ? 999 : e
    }
    enable() {
        this._disabled = !1
    }
    disable() {
        this._disabled = !0
    }
    disableNet() {
        this._netInterval && window.clearInterval(this._netInterval)
    }
    show() {
        this._show = !0,
        this._render()
    }
    hide() {
        this._show = !1,
        this._displayElement && document.body.removeChild(this._displayElement),
        this._displayElement = null
    }
    getIsWeakNet() {
        let e = !1;
        const t = this._networkSamples.length - 1;
        if (t < 0)
            return;
        const r = this._networkSamples[t].time
          , n = this._networkSamples[0].time
          , o = r - n
          , a = 1e3 * (DURATION - 2);
        if (o < a)
            return;
        const s = this._networkSamples.map(g=>this.isNetDelay(g, "rtt"))
          , l = this._networkSamples.map(g=>this.isNetDelay(g, "hb"))
          , u = s.reduce((g,m)=>g + m, 0)
          , c = l.reduce((g,m)=>g + m, 0)
          , h = Math.floor(u / this._networkSamples.length) * 100
          , f = Math.floor(c / this._networkSamples.length) * 100
          , d = 70;
        (h >= d || f >= d) && (e = !0);
        const _ = this.room.viewMode === "observer" || this.room.viewMode === "serverless";
        e && !_ && (logger.infoAndReportMeasurement({
            type: "weakNetwork",
            extraData: {
                msg: this._networkSamples.slice(20),
                netDelayRTTValues: u,
                netDelayHBValues: c
            }
        }),
        this.emit("weakNetwork"))
    }
    startStatsNetSamples() {
        const {rtt: e, hb: t} = this._extraStats;
        if (e || t) {
            const r = {
                rtt: e,
                hb: t,
                time: new Date().getTime()
            };
            this._networkSamples.push(r);
            const n = this._networkSamples.length - 1;
            if (n < 0)
                return;
            const o = this._networkSamples[n].time
              , a = 1e3 * DURATION;
            this._networkSamples = this._networkSamples.filter(s=>s.time > o - a)
        }
    }
    isNetDelay(e, t) {
        return t === "rtt" ? e.rtt > RTT_MAX_VALUE ? 1 : 0 : t === "hb" && e.hb > HB_MAX_VALUE ? 1 : 0
    }
    getPreciesTimer(e, t) {
        const r = t * 1e3
          , n = new Date().getTime();
        let o = 0;
        o++;
        const a = new Date().getTime() - (n + o * 1e3)
          , s = r - a
          , l = setTimeout(()=>{
            clearTimeout(l),
            e()
        }
        , s)
    }
    _render() {
        var c, h, f, d, _, g, m, v, y, b, T, C, A, S, P, R, M, x, I, w;
        if (!this._aggregatedStats)
            return;
        this._displayElement || (this._displayElement = document.createElement("div"),
        this._displayElement.style.position = "absolute",
        this._displayElement.style.top = "10px",
        this._displayElement.style.left = "200px",
        this._displayElement.style.width = "200px",
        this._displayElement.style.backgroundColor = "rgba(0,0,0,.5)",
        this._displayElement.style.color = "white",
        this._displayElement.style.textAlign = "left",
        this._displayElement.style.fontSize = "8px",
        this._displayElement.style.lineHeight = "10px",
        document.body.appendChild(this._displayElement));
        const e = []
          , t = Date.now() - this.constructedTime
          , r = Math.floor(t / 1e3 % 60)
          , n = Math.floor(t / (1e3 * 60) % 60)
          , o = Math.floor(t / (1e3 * 60 * 60) % 24)
          , a = o < 10 ? "0" + o.toString() : o.toString()
          , s = n < 10 ? "0" + n : n
          , l = r < 10 ? "0" + r : r;
        e.push({
            key: new Date(Math.floor(this._aggregatedStats.timestamp || 0)).toLocaleString("en-GB"),
            value: a + ":" + s + ":" + l
        }),
        e.push({
            key: "rtt: " + this._extraStats.rtt + " hb: " + this._extraStats.hb,
            value: "FPS: " + this._extraStats.fps + " avatar: " + ((c = this.room._userAvatar) == null ? void 0 : c.state)
        }),
        e.push({
            key: "SDK: " + Xverse.SUB_PACKAGE_VERSION,
            value: "ENGINE:" + VERSION$1 + " uid:" + this._extraStats.userId
        }),
        e.push({
            key: "\u540C\u6B65/\u6709\u6548/\u663E\u793A\u73A9\u5BB6",      //同步/有效/显示玩家
            value: `${this._extraStats.syncUserNum || 0}/${this._extraStats.userNum || 0}/${this._extraStats.renderedUserNum || 0}`
        }),
        e.push({
            key: "media/meta bitrate(kbps)",
            value: numberFormat.format(this._aggregatedStats.mediaBitrate || 0) + "/" + numberFormat.format(this._aggregatedStats.metaBitrate || 0)
        }),
        e.push({
            key: ":----------------Decoding---------------",
            value: ""
        }),
        e.push({
            key: "-max/avg decodeTime(ms)",
            value: numberFormat.format(this._aggregatedStats.decodeTimeMaxFrame || 0) + "/" + numberFormat.format(this._aggregatedStats.decodeTimePerFrame || 0)
        }),
        e.push({
            key: "-frmAwait/Lost/Drop",
            value: numberFormat.format(this._aggregatedStats.framesAwait || 0) + "/" + numberFormat.format(this._aggregatedStats.packetsLost || 0) + "/" + numberFormat.format(this._aggregatedStats.packetsDrop || 0) + "/" + numberFormat.format(this._aggregatedStats.updateDropFrame) || 0
        }),
        e.push({
            key: ":----------------FrameLoop-------------",
            value: ""
        }),
        e.push({
            key: "interval(max/avg/>40)",
            value: (((h = this._extraStats.maxFrameTime) == null ? void 0 : h.toFixed(1)) || 0) + "/" + (((f = this._extraStats.avgFrameTime) == null ? void 0 : f.toFixed(0)) || 0) + "/" + this._extraStats.engineSloppyCnt
        }),
        e.push({
            key: "systemStuck",
            value: this._extraStats.systemStuckCnt
        }),
        // e.push({
        //     key: "--update",
        //     value: (this._aggregatedStats.maxGraphicTime.toFixed(1) || 0) + "/" + (((d = this._aggregatedStats.averageGraphicTime) == null ? void 0 : d.toFixed(0)) || 0)
        // }),
        e.push({
            key: "--timeout",
            value: (((_ = this._extraStats.maxTimeoutTime) == null ? void 0 : _.toFixed(1)) || 0) + "/" + ((g = this._extraStats.avgTimeoutTime) == null ? void 0 : g.toFixed(0)) || 0
        }),
        e.push({
            key: "--render",
            value: (((m = this._extraStats.maxRenderFrameTime) == null ? void 0 : m.toFixed(1)) || 0) + "/" + (((v = this._extraStats.renderFrameTime) == null ? void 0 : v.toFixed(0)) || 0)
        }),
        e.push({
            key: "---anim/regBR/clip(avg ms)",
            value: (this._extraStats.animationTime.toFixed(2) || 0) + " / " + (this._extraStats.registerBeforeRenderTime.toFixed(2) || 0) + " / " + (this._extraStats.meshSelectTime.toFixed(2) || 0)
        }),
        e.push({
            key: "---anim/regBR/clip(max ms)",
            value: (this._extraStats.maxAnimationTime.toFixed(2) || 0) + " / " + (this._extraStats.maxRegisterBeforeRenderTime.toFixed(2) || 0) + " / " + (this._extraStats.maxMeshSelectTime.toFixed(2) || 0)
        }),
        e.push({
            key: "---rTR/drC/regAF(avg ms)",
            value: (this._extraStats.renderTargetRenderTime.toFixed(2) || 0) + " / " + (this._extraStats.drawcallTime.toFixed(2) || 0) + " / " + (this._extraStats.registerAfterRenderTime.toFixed(2) || 0)
        }),
        e.push({
            key: "---rTR/drC/regAF(max ms)",
            value: (this._extraStats.maxRenderTargetRenderTime.toFixed(2) || 0) + " / " + (this._extraStats.maxDrawcallTime.toFixed(2) || 0) + " / " + (this._extraStats.maxRegisterAfterRenderTime.toFixed(2) || 0)
        }),
        e.push({
            key: "--tri/drC/pati/bones/anim(Num)",
            value: (this._extraStats.triangle || 0) + " / " + (this._extraStats.drawcall.toFixed(0) || 0) + " / " + (this._extraStats.activeParticles.toFixed(0) || 0) + " / " + (this._extraStats.activeBones.toFixed(0) || 0) + " / " + (this._extraStats.activeAnimation.toFixed(0) || 0)
        }),
        e.push({
            key: "--rootN/mesh/geo/tex/mat(Num)",
            value: (this._extraStats.totalRootNodes.toFixed(0) || 0) + " / " + (this._extraStats.totalMeshes.toFixed(0) || 0) + " / " + (this._extraStats.totalGeometries.toFixed(0) || 0) + " / " + (this._extraStats.totalTextures.toFixed(0) || 0) + " / " + (this._extraStats.totalMaterials.toFixed(0) || 0)
        }),
        e.push({
            key: "--registerBF/AF(Num)",
            value: (this._extraStats.registerBeforeCount.toFixed(0) || 0) + " / " + (this._extraStats.registerAfterCount.toFixed(0) || 0)
        }),
        e.push({
            key: ":----------------Rotation-------------------",
            value: ""
        }),
        e.push({
            key: "Total(ms/miss)",
            value: (((y = this._aggregatedStats.avgOverallTime) == null ? void 0 : y.toFixed(2)) || 0) + "/" + (this._aggregatedStats.responseMissPs + this._aggregatedStats.processMissPs + this._aggregatedStats.displayMissPs)
        }),
        e.push({
            key: "--rotateRsp",
            value: (((b = this._aggregatedStats.avgResponseTime) == null ? void 0 : b.toFixed(1)) || 0) + "/" + this._aggregatedStats.responseMissPs
        }),
        e.push({
            key: "--rotateProc",
            value: (((T = this._aggregatedStats.avgProcessTime) == null ? void 0 : T.toFixed(1)) || 0) + "/" + this._aggregatedStats.processMissPs
        }),
        e.push({
            key: "--rotateShow",
            value: (((C = this._aggregatedStats.avgDisplayTime) == null ? void 0 : C.toFixed(1)) || 0) + "/" + this._aggregatedStats.displayMissPs
        }),
        ((A = this.room._userAvatar) == null ? void 0 : A.state) == "moving",
        e.push({
            key: ":----------------Move----------------------",
            value: ""
        }),
        e.push({
            key: "-startDelay",
            value: (this._aggregatedStats.moveEvent == "MoveTo" ? this._aggregatedStats.moveResponseDelay || 0 : this._aggregatedStats.flyResponseDelay || 0) + "/" + (this._aggregatedStats.moveEvent == "MoveTo" ? this._aggregatedStats.moveProcessDelay || 0 : this._aggregatedStats.flyProcessDelay || 0) + "/" + (this._aggregatedStats.moveEvent == "MoveTo" ? this._aggregatedStats.moveDisplayDelay || 0 : this._aggregatedStats.flyDisplayDelay || 0)
        }),
        (((S = this.room._userAvatar) == null ? void 0 : S.state) == "moving" || this._aggregatedStats.moveEvent == "GetOnAirship" || this._aggregatedStats.moveEvent == "GetOnVehicle") && e.push({
            key: "-srvInterFrm(max/avg)",
            value: (this._aggregatedStats.maxServerDiff || 0) + "/" + (this._aggregatedStats.avgServerDiff.toFixed(1) || 0)
        }),
        e.push({
            key: "-interFrameDelay",
            value: "(max/avg/jank)"
        }),
        // e.push({
        //     key: "--toDisplay",
        //     value: (this._aggregatedStats.moveEvent == "MoveTo" ? this._aggregatedStats.maxDisplayMoveDiff || 0 : this._aggregatedStats.maxDisplayFlyDiff || 0) + "/" + (this._aggregatedStats.moveEvent == "MoveTo" ? this._aggregatedStats.avgDisplayMoveDiff.toFixed(1) || 0 : this._aggregatedStats.avgDisplayFlyDiff.toFixed(1) || 0) + "/" + (this._aggregatedStats.moveEvent == "MoveTo" ? ((P = this._aggregatedStats.moveDisplayJank) == null ? void 0 : P.toFixed(3)) || 0 : ((R = this._aggregatedStats.flyDisplayJank) == null ? void 0 : R.toFixed(3)) || 0)
        // }),
        // e.push({
        //     key: "--received",
        //     value: (this._aggregatedStats.moveEvent == "MoveTo" ? this._aggregatedStats.maxResponseMoveDiff || 0 : this._aggregatedStats.maxResponseFlyDiff || 0) + "/" + (this._aggregatedStats.moveEvent == "MoveTo" ? this._aggregatedStats.avgResponseMoveDiff.toFixed(1) || 0 : this._aggregatedStats.avgResponseFlyDiff.toFixed(1) || 0) + "/" + (this._aggregatedStats.moveEvent == "MoveTo" ? ((M = this._aggregatedStats.moveResponseJank) == null ? void 0 : M.toFixed(3)) || 0 : ((x = this._aggregatedStats.flyResponseJank) == null ? void 0 : x.toFixed(3)) || 0)
        // }),
        // e.push({
        //     key: "--decoded",
        //     value: (this._aggregatedStats.moveEvent == "MoveTo" ? this._aggregatedStats.maxProcessMoveDiff || 0 : this._aggregatedStats.maxProcessFlyDiff || 0) + "/" + (this._aggregatedStats.moveEvent == "MoveTo" ? this._aggregatedStats.avgProcessMoveDiff.toFixed(1) || 0 : this._aggregatedStats.avgProcessFlyDiff.toFixed(1) || 0) + "/" + (this._aggregatedStats.moveEvent == "MoveTo" ? ((I = this._aggregatedStats.moveProcessJank) == null ? void 0 : I.toFixed(3)) || 0 : ((w = this._aggregatedStats.flyProcessJank) == null ? void 0 : w.toFixed(3)) || 0)
        // }),
        e.push({
            key: ":----------------DevInfo-----------------",
            value: ""
        }),
        // e.push({
        //     key: "sd",
        //     value: (this._aggregatedStats.sdMoveResponseLongTime.toFixed(1) || 0) + "/" + (this._aggregatedStats.sdMoveProcessLongTime.toFixed(1) || 0) + "/" + (this._aggregatedStats.sdMoveDisplayLongTime.toFixed(1) || 0)
        // }),
        e.push({
            key: "----hardwareInfo",
            value: this._extraStats.hardwareInfo
        });
        let u = "";
        for (const O of e)
            u += `<div><span>${O.key}</span>: <span>${O.value}</span> </div>`;
        this._displayElement.innerHTML = u
    }
    onStats(e) {
        var n;
        if (!e)
            return;
        const t = {}
          , r = this;
        r._aggregatedStats || (r._aggregatedStats = {}),
        t.timestamp = e.timestamp,
        t.mediaBytesReceived = e.mediaBytesReceived,
        t.metaBytesReceived = e.metaBytesReceived,
        t.packetsLost = e.packetsLost,
        t.frameHeight = e.frameHeight,
        t.frameWidth = e.frameWidth,
        t.framesReceivedUI = e.framesReceived,
        t.framesReceived = e.framesReceivedWorker,
        t.framesDecoded = e.framesDecoded,
        t.framesEmited = e.framesEmited,
        t.decodeTimePerFrame = e.decodeTimePerFrame,
        t.decodeTimeMaxFrame = e.decodeTimeMaxFrame,
        t.packetsDrop = e.packetsDrop,
        t.framesAwait = e.framesAwait,
        t.updateDropFrame = e.updateDropFrame,
        t.firstMediaArraval = e.firstMediaArraval,
        t.firstYUVDecoded = e.firstYUVDecoded,
        t.firstRender = e.firstRender,
        t.returnFrames = e.returnFrames,
        t.sendOutBuffer = e.sendOutBuffer,
        t.averageGraphicTime = e.averageGraphicTime,
        t.maxGraphicTime = e.maxGraphicTime,
        t.jankTimes = e.jankTimes,
        t.bigJankTimes = e.bigJankTimes,
        t.decodeJankTimes = e.decodeJankTimes,
        t.bigDecodeJankTimes = e.bigDecodeJankTimes,
        t.serverFrameFast = e.serverFrameFast,
        t.serverFrameSlow = e.serverFrameSlow,
        t.clientFrameFast = e.clientFrameFast,
        t.clientFrameSlow = e.clientFrameSlow,
        t.rtcMessageReceived = e.rtcMessageReceived,
        t.rtcBytesReceived = e.rtcBytesReceived,
        t.receiveIframes = e.receiveIframes,
        t.decodeIframes = e.decodeIframes,
        t.avgResponseTime = e.avgResponseTime,
        t.avgProcessTime = e.avgProcessTime,
        t.avgDisplayTime = e.avgDisplayTime,
        t.avgOverallTime = e.avgOverallTime,
        t.overallTimeCount = e.overallTimeCount,
        t.responseMiss = e.responseMiss,
        t.processMiss = e.processMiss,
        t.displayMiss = e.displayMiss,
        t.avgResponseMoveDiff = e.avgResponseMoveDiff,
        t.avgProcessMoveDiff = e.avgProcessMoveDiff,
        t.avgDisplayMoveDiff = e.avgDisplayMoveDiff,
        t.maxResponseMoveDiff = e.maxResponseMoveDiff,
        t.maxProcessMoveDiff = e.maxProcessMoveDiff,
        t.maxDisplayMoveDiff = e.maxDisplayMoveDiff,
        t.moveResponseDelay = e.moveResponseDelay,
        t.moveProcessDelay = e.moveProcessDelay,
        t.moveDisplayDelay = e.moveDisplayDelay,
        t.moveResponseJank = e.moveResponseJank,
        t.moveProcessJank = e.moveProcessJank,
        t.moveDisplayJank = e.moveDisplayJank,
        t.avgMetaParseTime = e.avgMetaParseTime,
        t.maxMetaParseTime = e.maxMetaParseTime,
        t.moveResponseCounts = e.moveResponseCounts,
        t.moveProcessCounts = e.moveProcessCounts,
        t.moveDisplayCounts = e.moveDisplayCounts,
        t.MoveDisplayCountGood = e.MoveDisplayCountGood,
        t.MoveDisplayCountWell = e.MoveDisplayCountWell,
        t.MoveDisplayCountFair = e.MoveDisplayCountFair,
        t.MoveDisplayCountBad = e.MoveDisplayCountBad,
        t.MoveDisplayCountRest = e.MoveDisplayCountRest,
        t.avgServerDiff = e.avgServerDiff,
        t.maxServerDiff = e.maxServerDiff,
        t.avgResponseFlyDiff = e.avgResponseFlyDiff,
        t.avgProcessFlyDiff = e.avgProcessFlyDiff,
        t.avgDisplayFlyDiff = e.avgDisplayFlyDiff,
        t.maxResponseFlyDiff = e.maxResponseFlyDiff,
        t.maxProcessFlyDiff = e.maxProcessFlyDiff,
        t.maxDisplayFlyDiff = e.maxDisplayFlyDiff,
        t.flyResponseCounts = e.flyResponseCounts,
        t.flyProcessCounts = e.flyProcessCounts,
        t.flyDisplayCounts = e.flyDisplayCounts,
        t.flyResponseJank = e.flyResponseJank,
        t.flyProcessJank = e.flyProcessJank,
        t.flyDisplayJank = e.flyDisplayJank,
        t.flyResponseDelay = e.flyResponseDelay,
        t.flyProcessDelay = e.flyProcessDelay,
        t.flyDisplayDelay = e.flyDisplayDelay,
        t.moveEvent = e.moveEvent,
        t.sdMoveResponseLongTime = e.sdMoveResponseLongTime,
        t.sdMoveProcessLongTime = e.sdMoveProcessLongTime,
        t.sdMoveDisplayLongTime = e.sdMoveDisplayLongTime,
        r._aggregatedStats && r._aggregatedStats.timestamp && (t.mediaBitrate = 8 * (t.mediaBytesReceived - r._aggregatedStats.mediaBytesReceived) / 1e3,
        t.mediaBitrate = Math.round(t.mediaBitrate || 0),
        t.metaBitrate = 8 * (t.metaBytesReceived - r._aggregatedStats.metaBytesReceived) / 1e3,
        t.metaBitrate = Math.round(t.metaBitrate || 0),
        t.rtcMessagePs = t.rtcMessageReceived - r._aggregatedStats.rtcMessageReceived,
        t.rtcBitrate = 8 * (t.rtcBytesReceived - r._aggregatedStats.rtcBytesReceived) / 1e3,
        t.rtcBitrate = Math.round(t.rtcBitrate || 0),
        t.framesEmitedPs = t.framesEmited - r._aggregatedStats.framesEmited,
        t.framesEmitedPs = Math.round(t.framesEmitedPs || 0),
        t.framesReceivedPs = t.framesReceived - r._aggregatedStats.framesReceived,
        t.framesReceivedPs = Math.round(t.framesReceivedPs || 0),
        t.framesDecodedPs = t.framesDecoded - r._aggregatedStats.framesDecoded,
        t.framesDecodedPs = Math.round(t.framesDecodedPs || 0),
        t.returnFramesPs = t.returnFrames - r._aggregatedStats.returnFrames,
        t.returnFramesPs = Math.round(t.returnFramesPs || 0),
        t.responseMissPs = t.responseMiss - r._aggregatedStats.responseMiss,
        t.processMissPs = t.processMiss - r._aggregatedStats.processMiss,
        t.displayMissPs = t.displayMiss - r._aggregatedStats.displayMiss,
        t.returnFrames = e.returnFrames),
        this._show && this._render(),
        t.registerBeforeRenderTime = this._extraStats.registerBeforeRenderTime,
        t.registerAfterRenderTime = this._extraStats.registerAfterRenderTime,
        t.renderTargetRenderTime = this._extraStats.renderTargetRenderTime,
        t.renderFrameTime = this._extraStats.renderFrameTime,
        t.maxRenderFrameTime = this._extraStats.maxRenderFrameTime,
        t.interFrameTime = this._extraStats.interFrameTime,
        t.animationTime = this._extraStats.animationTime,
        t.meshSelectTime = this._extraStats.meshSelectTime,
        t.drawcall = this._extraStats.drawcall,
        t.drawcallTime = this._extraStats.drawcallTime,
        t.triangle = this._extraStats.triangle,
        t.registerAfterCount = this._extraStats.registerAfterCount,
        t.registerBeforeCount = this._extraStats.registerBeforeCount,
        t.fps = this._extraStats.fps,
        t.rtt = this._extraStats.rtt,
        t.hb = this._extraStats.hb,
        t.avgFrameTime = this._extraStats.avgFrameTime,
        t.avgTimeoutTime = this._extraStats.avgTimeoutTime,
        t.engineSloppyCnt = this._extraStats.engineSloppyCnt,
        t.systemStuckCnt = this._extraStats.systemStuckCnt,
        t.avatarState = (n = this.room._userAvatar) == null ? void 0 : n.state,
        t.maxFrameTime = this._extraStats.maxFrameTime,
        t.maxTimeoutTime = this._extraStats.maxTimeoutTime,
        t.activeParticles = this._extraStats.activeParticles,
        t.activeBones = this._extraStats.activeBones,
        t.activeAnimation = this._extraStats.activeAnimation,
        t.totalRootNodes = this._extraStats.totalRootNodes,
        t.totalGeometries = this._extraStats.totalGeometries,
        t.totalMeshes = this._extraStats.totalMeshes,
        t.totalTextures = this._extraStats.totalTextures,
        t.totalMaterials = this._extraStats.totalMaterials,
        t.hardwareInfo = this._extraStats.hardwareInfo,
        t.maxInterFrameTime = this._extraStats.maxInterFrameTime,
        t.maxDrawcallTime = this._extraStats.maxDrawcallTime,
        t.maxMeshSelectTime = this._extraStats.maxMeshSelectTime,
        t.maxAnimationTime = this._extraStats.maxAnimationTime,
        t.maxRegisterBeforeRenderTime = this._extraStats.maxRegisterBeforeRenderTime,
        t.maxRegisterAfterRenderTime = this._extraStats.maxRegisterAfterRenderTime,
        t.maxRenderTargetRenderTime = this._extraStats.maxRenderTargetRenderTime,
        this.externalStats && Object.keys(this.externalStats || {}).forEach(o=>{
            t[o] = this.externalStats[o]
        }
        ),
        r._aggregatedStats = t,
        this.emit("stats", {
            stats: t
        })
    }
}