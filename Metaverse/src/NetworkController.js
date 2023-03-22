import Codes from "./enum/Codes.js"
import Socket from "./Socket.js"
import Rtcp from "./Rtcp.js"
import NetworkMonitor from "./NetworkMonitor.js"
import Stream from "./Stream.js"
import InternalError from "./error/InternalError.js"
import util from "./util.js"
import Actions from "./enum/Actions.js"
import Logger from "./Logger.js"

const logger = new Logger('NetworkController')

var workerSourceCode = `onmessage = function (event) {
    const data = event.data
    if (!data) return
  
    if (data.type === 'start') {
      const startTime = Date.now()
      const request = new XMLHttpRequest()
      request.open('GET', data.url)
      try {
        request.send()
      } catch (error) {
        console.error(error)
      }
      request.addEventListener('readystatechange', () => {
        if (request.readyState == 4) {
          if (request.status == 200) {
            postMessage(Date.now() - startTime)
          }
        }
      })
    }
  }
  `;
  
export default class NetworkController extends EventEmitter {
    constructor(e) {
        super();
        this.socket = null
        this.rtcp = null
        this.stream = null
        this._state = 'connecting'
        this._networkMonitor = null
        this.blockedActions = []
        this.reconnectCount = 0
        this.room = e,
        this.socket = new Socket(this);
        this.rtcp = new Rtcp(this);
        this.stream = new Stream;
        this._networkMonitor = new NetworkMonitor(()=>{
            logger.info("network changed, online:", this._networkMonitor.isOnline),
            this._state === "disconnected" && this._networkMonitor.isOnline && (logger.info("network back to online, try to reconnect"),
            this.reconnect())
        });

        this.checkNetworkQuality(this.room.currentNetworkOptions.wsServerUrl);
        this._networkMonitor.start();

        new VisibilityChangeHandler().subscribe(r=>{
                var n, o;
                r ? ((o = this.room.stats) == null || o.disable(),
                logger.infoAndReportMeasurement({
                    type: "pageHide"
                })) : ((n = this.room.stats) == null || n.enable(),
                logger.infoAndReportMeasurement({
                    type: "pageShow",
                    extraData: {
                        state: this._state
                    }
                }),
                this._state === "disconnected" && this.reconnect())
            }
        )
    }

    startGame(){
        return new Promise((e,t)=>{
            if (!this.rtcp.connected)
                return t(new InternalError("Game cannot load. Please refresh"));
            if (!this.rtcp.inputReady)
                return t(new InternalError("Game is not ready yet. Please wait"));
            this.socket.on("gameRoomAvailable", r=>{
               
                this.setState("connected"),
                e(r),
                this.rtcp.heartbeat.start()
            }
            ),
            this.socket.on("socketClosed", r=>{
                t(r)
            }
            ),
            this.socket.startGame()
        })
    }

    addBlockedActions(e) {
        this.blockedActions.push(...e)
    }
    removeBlockedActions(e) {
        if (!e) {
            this.blockedActions = [];
            return
        }
        const t = this.blockedActions.indexOf(e);
        this.blockedActions.splice(t, 1)
    }
    setState(e) {
        this._state !== e && (logger.info("Set network state to ", e),
        this._state = e)
    }
    async connectAndStart(e) {
        return this.connect(e).then(this.startGame)
    }
    async connect(e=!1) {
     
        this.room.updateCurrentNetworkOptions({
            reconnect: e
        });
        return new Promise((t,r)=>{
      
            this.rtcp.on("rtcConnected", ()=>{
                this.setState("connected"),
                t()
            }
            ),
            this.rtcp.on("rtcDisconnected", ()=>{
                logger.info("rtc disconnected"),
                this._state === "connecting" ? (this.setState("disconnected"),
                r(new InternalError("rtc connect failed"))) : (this.setState("disconnected"),
                logger.info("rtc disconnected, start to reconnect"),
                this.reconnect())
            }
            ),
            this.socket.on("socketQuit", ()=>{
                logger.info("socket quit success"),
                this.setState("closed")
            }
            ),
            this.socket.on("socketClosed", n=>{
                this._state === "connecting" && (this.setState("disconnected"),
                r(n)),
                r(n)
            }
            ),
            this.socket.start()
        }
        )
    }
    reconnect() {
        // webrtc的IceConnectionState为disconnected时，前端连接断开并尝试重连
        if (this.room.viewMode === "observer")
            return;
        const e = Date.now();
        if (this.reconnectCount++,
        this.reconnectCount > MAX_RECONNECT_COUNT) {
            logger.error("reconnect failed, reached max reconnect count", MAX_RECONNECT_COUNT),
            this.reconnectCount = 0,
            this.emit("stateChanged", {
                state: "disconnected"
            });
            return
        }
        return logger.info("start reconnect, count:", this.reconnectCount),
        this._reconnect().then(()=>{
            logger.infoAndReportMeasurement({
                type: "reconnect"
            })
        }
        ).catch(t=>{
            if (logger.infoAndReportMeasurement({
                type: "reconnect",
                error: t
            }),
            t.code === Codes.RepeatLogin) {
                this.room.handleRepetLogin();
                return
            }
            const r = 1e3;
            logger.info("reconnect failed, wait " + r + " ms for next reconnect"),
            setTimeout(()=>{
                this.reconnect()
            }
            , r)
        }
        )
    }
    _reconnect() {
        return this._state === "closed" ? (logger.warn("connection closed already"),
        Promise.reject()) : this._state === "connecting" ? (logger.warn("connection is already in connecting state"),
        Promise.reject()) : this._state !== "disconnected" ? Promise.reject() : (this.prepareReconnect(),
        this._state = "connecting",
        this.emit("stateChanged", {
            state: "reconnecting",
            count: this.reconnectCount
        }),
        this.socket.off("gameRoomAvailable"),
        this.socket.off("socketClosed"),
        this.rtcp.off("rtcDisconnected"),
        this.rtcp.off("rtcConnected"),
        this.connectAndStart(!0).then(({session_id: e})=>{
            this.room.updateCurrentNetworkOptions({
                sessionId: e
            }),
            reporter.updateBody({
                serverSession: e
            }),
            logger.info("reconnect success"),
            this.setState("connected"),
            this.reconnectCount = 0,
            this.emit("stateChanged", {
                state: "reconnected"
            })
        }
        ))
    }
    prepareReconnect() {
        this.rtcp.disconnect(),
        this.socket.prepareReconnect(),
        this.prepareReconnectOptions()
    }
    prepareReconnectOptions() {
        const {camera: e, player: t} = this.room.currentClickingState || {};
        e && t && this.room.updateCurrentNetworkOptions({
            camera: e,
            player: t
        })
    }
    sendRtcData(e) {
        if (this.blockedActions.includes(e.action_type)) {
            logger.info(`action: ${Actions[e.action_type]} was blocked`);
            return
        }
        this.rtcp.sendData(e)
    }
    sendSocketData(e) {
        logger.debug("ws send ->", e),
        this.socket.send(e)
    }
    quit() {
        const e = util.uuid()
          , t = {
            action_type: Actions.Exit,
            trace_id: e,
            exit_action: {},
            user_id: this.room.options.userId,
            packet_id: e
        };
        this.setState("closed"),
        this.socket.quit(),
        this.sendRtcData(t)
    }

    checkNetworkQuality(i) {
        let worker = null
        if (!i)
            return;
        const e = Date.now();
        if (this.pingOthers("https://www.baidu.com", function(t, r) {
            logger.infoAndReportMeasurement({
                type: "baiduRtt",
                group: "http",
                value: r
            })
        }),
        !worker) {
            const t = new Blob([workerSourceCode],{
                type: "application/javascript"
            });
            worker = new Worker(URL.createObjectURL(t)),
            worker.onmessage = function(r) {
                logger.infoAndReportMeasurement({
                    type: "workerRtt",
                    group: "http",
                    value: r.data
                })
            }
        }
    }
    pingOthers(i, e) {
        let t = !1;
        const r = new Image;
        r.onload = o,
        r.onerror = a;
        const n = Date.now();
        function o(l) {
            t = !0,
            s()
        }
        function a(l) {}
        function s() {
            const l = Date.now() - n;
            if (typeof e == "function")
                return t ? e(null, l) : (console.error("error loading resource"),
                e("error", l))
        }
        r.src = i + "/favicon.ico?" + +new Date
    }
}