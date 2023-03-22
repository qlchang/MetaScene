import Heartbeat from "./Heartbeat.js";
import Timeout from "./Timeout.js";
import InitNetworkTimeoutError from "./error/InitNetworkTimeoutError.js";
import { reporter } from "./Reporter.js";
import util from "./util.js";
import InternalError from "./error/InternalError.js";
import Logger from "./Logger.js";

const logger = new Logger("ws");
export default class Socket extends EventEmitter {
  constructor(e) {
    super();
    E(this, "_ws");
    E(this, "_openTimer");
    E(this, "connected", !1);
    E(this, "_hasTimeout", !1);
    E(this, "heartbeat");
    E(this, "latency", (e, t) =>
      this.send({
        id: "checkLatency",
        data: JSON.stringify(e),
        packet_id: t,
      })
    );
    E(this, "send", (e) => {
      if (this.wsNoReady()) {
        return;
      }
      const t = JSON.stringify(e);
      e.id !== "heartbeat" && logger.info("send ws frame", t);
      this._ws.send(t);
      // console.log('socket发送数据：'+t)
    });
    E(this, "startGame", () => {
      const {
        roomId: e,
        userId: t,
        avatarId: r,
        skinId: n,
        role: o,
        avatarComponents: a,
        versionId: s,
        rotationRenderType: l,
        isAllSync: u,
        nickname: c,
        avatarScale: h,
        appId: f,
        camera: d,
        player: _,
        firends: g,
        syncByEvent: m,
        areaName: v,
        attitude: y,
        pathName: b,
        person: T,
        roomTypeId: C = "",
        syncToOthers: A,
        hasAvatar: S,
        prioritySync: P,
        extra: R = {},
        removeWhenDisconnected: M,
      } = this.network.room.currentNetworkOptions;
      R.removeWhenDisconnected = M;
      const x = {
        id: "start",
        room_id: e,
        user_id: t,
        trace_id: util.uuid(),
        data: JSON.stringify({
          avatar_components: JSON.stringify(a),
          avatar_id: r,
          skin_id: n,
          is_host: o ? o == "host" : !0,
          skin_data_version: n !== void 0 && s !== void 0 ? n + s : void 0,
          rotation_render_type: l,
          is_all_sync: u,
          nick_name: encodeURIComponent(c || ""),
          app_id: f,
          camera: d,
          player: _,
          person: T,
          firends: JSON.stringify(g),
          sync_by_event: m,
          area_name: v,
          path_name: b,
          attitude: y,
          room_type_id: C,
          syncToOthers: A,
          hasAvatar: S,
          avatarSize: h,
          prioritySync: P,
          extra: JSON.stringify(R),
        }),
      };
      this.send(x);
      const mt = JSON.parse(x.data);
      delete mt.token;
      logger.infoAndReportMeasurement({
        type: "startGame",
        extraData: mt
      });
    });
    (this.network = e),
      (this.heartbeat = new Heartbeat({
        ping: (t) => {
          var r;
          if (!this.connected) {
            this.heartbeat.stop(),
              (r = e.room.stats) == null ||
                r.assign({
                  rtt: 0,
                });
            return;
          }
          this.send({
            id: "heartbeat",
            data: t,
          });
        },
        pong(t) {
          var r;
          (r = e.room.stats) == null ||
            r.assign({
              rtt: t,
            });
        },
      }));
  }

  get connection() {
    return this._ws;
  }
  start() {
    this._hasTimeout = !1;
    const e = this.getAddress();
    logger.info(`connecting to ${e}`);
    const t = Date.now();
    (this._ws = new WebSocket(e)),
      (this._openTimer = new Timeout(() => {
        const r = `Failed to open websocket in ${DEFAULT_OPEN_TIMEOUT_MS} ms`;
        (this._hasTimeout = !0),
          this.emit("socketClosed", new InitNetworkTimeoutError(r));
      }, DEFAULT_OPEN_TIMEOUT_MS)),
      (this._ws.onopen = () => {
        var r;
        (r = this._openTimer) == null || r.clear(),
          (this.connected = !0),
          this.heartbeat.start(),
          this.network.room.currentNetworkOptions.reconnect ||
            (logger.infoAndReportMeasurement({
              type: "wsOpenedAt",
              group: "joinRoom"
            }),
            logger.infoAndReportMeasurement({
              type: "wsOpenedCost",
              group: "joinRoom"
            }));
      }),
      this.handleWSEvent();
  }
  getAddress() {
    const {
        wsServerUrl: e,
        reconnect: t,
        sessionId: r,
        token: n,
        roomId: o,
        userId: a,
        pageSession: s,
      } = this.network.room.currentNetworkOptions,
      l = this.network.room.skinId;
    let u = e;
    t && (u = u + `?reconnect=true&lastSessionID=${r}`);
    const c =
      `userId=${a}&roomId=${o}&pageSession=${s}` +
      (this.network.room.isHost ? `&skinId=${l}` : "") +
      (n ? `&token=${n}` : "");
    return (u = u.indexOf("?") > -1 ? u + "&" + c : u + "?" + c), u;
  }
  handleWSEvent() {
    const e = this._ws;
    e.addEventListener("error", (t) => {
      (this.connected = !1),
        logger.error("webscoket error", t),
        this.emit(
          "socketClosed",
          new InternalError(
            "connect to address error: " +
              this.network.room.currentNetworkOptions.wsServerUrl
          )
        );
    }),
      e.addEventListener("close", (t) => {
        (this.connected = !1), this._onClose(t);
      }),
      //接收数据
      e.addEventListener("message", (t) => {
        if (!t || this._hasTimeout || !this.connected) return;
        let r = null;
        try {
          r = JSON.parse(t.data);
          // console.log('接收socket数据：'+t.data)
        } catch (o) {
          logger.error(o);
          return;
        }
        if (!r) return;
        const n = r.id;

        //if(n == "heartbeat") console.log("Socket心跳请求时间（ms）：", Date.now() - parseInt(r.data))

        if (!!n)
          switch (
            (n !== "heartbeat" && logger.info(`receive ws frame: ${t.data}`), n)
          ) {
            case "fail":
              break;
            case "init":
              try {
                const o = r.data.slice(-37, -1);
                reporter.updateBody({
                  serverSession: o,
                });
              } catch (o) {
                console.error(o);
              }
              this.network.rtcp.start();
              break;
            case "heartbeat":
              this.heartbeat.pong(r.data);
              break;
            case "offer":
              this.network.rtcp.setRemoteDescription(
                r.data,
                this.network.stream.el
              );
              break;
            case "ice_candidate":
              this.network.rtcp.addCandidate(r.data);
              break;
            case "start":
              console.log("server start", JSON.stringify(r));
              this.emit("gameRoomAvailable", r);
              break;
            case "error":
              try {
                const { Code: o, Msg: a } = JSON.parse(r.data);
                if (o) {
                  if (o == 3003)
                    return this.emit("socketClosed", new TokenExpiredError());
                  if (authenticationErrorCodes.indexOf(o) > -1)
                    return this.emit(
                      "socketClosed",
                      new AuthenticationError("\u9274\u6743\u9519\u8BEF:" + a)      //鉴权错误
                    );
                  {
                    const s = util.getErrorByCode(o);
                    this.emit("socketClosed", new s(a));
                  }
                }
              } catch (d) {
                const _ = new InternalError(
                  "JSON.parse websocket data error: " + r.data
                );
                logger.error(d, _);
                this.emit("socketClosed", _);
              }
              break;
            case "checkLatency": {
              const o = r.packet_id,
                a = r.data.split(",");
              this.onLatencyCheck({
                packetId: o,
                addresses: a,
              });
              break;
            }
            default:
              logger.warn("unkown ws message type", n, r);
          }
      });
  }
  onLatencyCheck(e) {
    const t = [...new Set(e.addresses || [])];
    Promise.all(
      t.map((r) => ({
        [r]: 9999,
      }))
    ).then((r) => {
      const n = Object.assign({}, ...r);
      this.latency(n, e.packetId);
    });
  }
  wsNoReady() {
    return (
      this._ws.readyState == WebSocket.CLOSED ||
      this._ws.readyState == WebSocket.CLOSING ||
      this._ws.readyState == WebSocket.CONNECTING
    );
  }
  prepareReconnect() {
    this._close({
      code: WS_CLOSE_RECONNECT,
      reason: "reconnect",
    });
  }
  _onClose({ code: e, reason: t }) {
    this._openTimer && this._openTimer.clear(),
      logger.warn(`ws closed: ${e} ` + t),
      [WS_CLOSE_RECONNECT, WS_CLOSE_NORMAL].includes(e) ||
        this.emit("socketClosed", new InternalError("Websocket error"));
  }
  _close({ code: e, reason: t }) {
    var r;
    (r = this._ws) == null || r.close(e, t);
  }
  quit() {
    this._close({
      code: WS_CLOSE_NORMAL,
      reason: "quit",
    });
  }
}
