const defaultLogger = {
  info: console.log,
  debug: console.log,
  error: console.error,
  infoAndReportMeasurement: (...i) => {},
};

let USER_ID = "987412365",
  PAGE_SESSION = "aaabbbccc",
  SERVER_SESSION = "cccbbbaaa",
  COS_PREFIX = "error-bitstreams-auto-uploaded-from-application/",
  FRAME_COMPOSE_LENGTH = 5;

// let testFrame = -1;
// let testBuffer = new Uint8Array(1024 * 1024 * 10);
// let testBufferLength = 0;

Number.prototype.padLeft = function (n, str) {
  return Array(n - String(this).length + 1).join(str || "0") + this;
};

import CircularArray from "./CircularArray.js";
import SecondArray from "./SecondArray.js";
import v2Decoder from "./v2Decoder/index.js";

export default class Workers {
  constructor(e, t) {
    (this.rtcp = e),
      (this.cacheSize = 0),
      (this.cacheBuffer = new Uint8Array(262144)),
      (this.cacheFrameCnt = 0),
      (this.startReceiveTime = 0),
      (this.cacheFrameComposes = new Array(0)),
      (this.cacheSizes = new Array(5).fill(0)),
      (this.cacheFrameCnts = new Array(5).fill(-1)),
      (this.cacheStartReceiveTimes = new Array(5).fill(0)),
      (this.cacheBuffers = [
        new Uint8Array(262144),
        new Uint8Array(262144),
        new Uint8Array(262144),
        new Uint8Array(262144),
        new Uint8Array(262144),
      ]),
      (this.panoCacheSize = 0),
      (this.panoCacheBuffer = new Uint8Array(2097152)),
      (this.cachePanoTileID = 0),
      (this.receivedMedia = 0),
      (this.receivedMedia_worker = 0),
      (this.receivedYUV = 0),
      (this.receivedEmit = 0),
      (this.returnFrames = 0),
      (this.lastReturnFrames = 0),
      (this.lastReceivedEmit = 0),
      (this.mediaBytesReceived = 0),
      (this.metaBytesReceived = 0),
      (this.noWasmBytesReceived = 0),
      (this.rtcBytesReceived = 0),
      (this.rtcMessageReceived = 0),
      (this.packetsDrop = 0),
      (this.framesAwait = 0),
      (this.sendOutBuffer = 0),
      (this.decodeTimePerFrame = 0),
      (this.decodeTimeMaxFrame = 0),
      (this.lastRenderTs = 0),
      (this.JankTimes = 0),
      (this.bigJankTimes = 0),
      (this.DecodeJankTimes = 0),
      (this.bigDecodeJankTimes = 0),
      (this.saveframe = false),
      (this.SaveMediaStream = false),
      (this.packetsLost = 0),
      (this.showAllReceivedMetadata = false),
      (this.firstMediaArrival = 0),
      (this.firstMediaReceived = false),
      (this.firstYUVDecoded = 0),
      (this.firstRender = 0),
      (this.firstYUVReceived = false),
      (this.reconnectSignal = false),
      (this.serverFrameSlow = 0),
      (this.serverFrameFast = 0),
      (this.clientFrameSlow = 0),
      (this.clientFrameFast = 0),
      (this.lastServerTS = 0),
      (this.lastClientTS = 0),
      (this.lastSeq = 0),
      (this.lastIsPureMeta = false),
      (this.lastHBPacketTs = 0),
      (this.HBPacketInterval = 0),
      (this.lastHBPacketSrvSentTs = 0),
      (this.HBPacketIntervalSrvSent = 0),
      (this.cachedLength = 2),
      (this.cachedStreams = new Array(this.cachedLength)),
      (this.cachedMetas = new Array(this.cachedLength)),
      (this.cachedPtss = new Array(this.cachedLength)),
      (this.cachedRender = Array(this.cachedLength).fill(false)),
      (this.cachedResolution = new Array(this.cachedLength)),
      (this.getPtr = 0),
      (this.setPtr = 0),
      (this.receiveIframes = 0),
      (this.decodeIframes = 0),
      (this.prevSenderTs = -1),
      (this.serverSendTimeArray = new CircularArray(120, false, [])),
      (this.inPanoMode = false),
      (this.PanoStatus = {
        x: 0,
        y: 0,
        z: 0,
        tiles: [],
      }),
      (this.DynamicPanoTest = false),
      (this.PanoMask = new ArrayBuffer(8)),
      (this.PanoView = new DataView(this.PanoMask)),
      (this.userId_test = ""),
      (this.PendingMasks = []),
      (this.traceIdMap = new Map()),
      (this.responseTimeArray = []),
      (this.processTimeArray = []),
      (this.displayTimeArray = []),
      (this.overallTimeArray = []),
      (this.responseMiss = 0),
      (this.processMiss = 0),
      (this.displayMiss = 0),
      (this.joyStickTraceIdMap = new Map()),
      (this.joyStickResponseTimeArray = []),
      (this.joyStickProcessTimeArray = []),
      (this.joyStickDisplayTimeArray = []),
      (this.joyStickOverallTimeArray = []),
      (this.joyStickResponseMiss = 0),
      (this.joyStickProcessMiss = 0),
      (this.joyStickDisplayMiss = 0),
      (this.updateYUVCircular = new CircularArray(120, false, [])),
      (this.updateDropFrame = 0),
      (this.metaParseArray = []),
      (this.responseMoveMiss = 0),
      (this.processMoveMiss = 0),
      (this.displayMoveMiss = 0),
      (this.MovingTraceId = ""),
      (this.PendingMovingTraceId = ""),
      (this.inMovingMode = false),
      (this.StartMovingTs = 0),
      (this.PendingStartMovingTs = 0),
      (this.moveEvent = ""),
      (this.MoveToFrameCnt = 0),
      (this.lastIsMoving = 0),
      (this.MoveResponseDelay = 0),
      (this.MoveProcessDelay = 0),
      (this.MoveDisplayDelay = 0),
      (this.lastMoveResponseTime = 0),
      (this.lastMoveProcessTime = 0),
      (this.lastMoveDisplayTime = 0),
      (this.moveResponseCircular = new CircularArray(120, true, [
        STUCK_STAGE_GOOD,
        STUCK_STAGE_WELL,
        STUCK_STAGE_FAIR,
        STUCK_STAGE_BAD,
      ])),
      (this.moveProcessCircular = new CircularArray(120, true, [
        STUCK_STAGE_GOOD,
        STUCK_STAGE_WELL,
        STUCK_STAGE_FAIR,
        STUCK_STAGE_BAD,
      ])),
      (this.moveDisplayCircular = new CircularArray(120, true, [
        STUCK_STAGE_GOOD,
        STUCK_STAGE_WELL,
        STUCK_STAGE_FAIR,
        STUCK_STAGE_BAD,
      ])),
      (this.moveStartPts = -1),
      (this.frameServerCircular = new CircularArray(120, false, [])),
      (this.srvMetaIntervalCircular = new CircularArray(120, false, [])),
      (this.srvMediaIntervalCircular = new CircularArray(120, false, [])),
      (this.srvHBMetaIntervalCircular = new CircularArray(120, false, [])),
      (this.srvHBMetaIntervalSrvSentCircular = new CircularArray(
        120,
        false,
        []
      )),
      (this.frameClientCircular = new CircularArray(120, false, [])),
      (this.unmarshalStreamExecutionArray = new SecondArray()),
      (this.receiveYUVExecutionArray = new SecondArray()),
      (this.postMessageWaitArray = new SecondArray()),
      (this.firstUpdateYUV = true),
      (this.functionMap = new Map()),
      (this.WASM_VERSION = "WASM-1.1"),
      (this.frameHistory = []),
      (this.getVersion = function () {
        return DECODER_VERSION;
      }),
      (this.downloadBlob = (r, n, o) => {
        const a = new Blob([r], {
            type: o,
          }),
          s = window.URL.createObjectURL(a);
        this.downloadURL(s, n),
          setTimeout(function () {
            return window.URL.revokeObjectURL(s);
          }, 1e3);
      }),
      (this.downloadURL = function (r, n) {
        const o = document.createElement("a");
        (o.href = r),
          (o.download = n),
          document.body.appendChild(o),
          (o.style.display = "none"),
          o.click(),
          o.remove();
      }),
      (this.Stringify = function (r) {
        let n = "";
        for (let a = 0; a < r.length / 8192; a++)
          n += String.fromCharCode.apply(
            null,
            r.slice(a * 8192, (a + 1) * 8192)
          );
        return n;
      }),
      (this._rtcp = e);
  }
  registerLogger(e) {
    //defaultLogger = e
  }
  registerFunction(e, t) {
    this.functionMap.set(e, t);
  }
  hasFrmCntInCache(e) {
    let t = -1;
    for (let r = 0; r < this.cacheFrameComposes.length; r++)
      this.cacheFrameComposes[r].frameCnt == e && (t = r);
    return t;
  }
  requestPanoramaTest(e, t, r, n, o) {
    const a = o,
      s = {
        action_type: 16,
        change_rotation_render_type_action: {
          render_type: 5,
          player: {
            position: {
              x: 0,
              y: 0,
              z: 0,
            },
            angle: {
              yaw: 0,
              pitch: 0,
              roll: 0,
            },
          },
          camera: {
            position: {
              x: e,
              y: t,
              z: r,
            },
            angle: {
              yaw: 0,
              pitch: 0,
              roll: 0,
            },
          },
          client_pano_titles_bitmap: n,
        },
        trace_id: a,
        user_id: this.userId_test,
        packet_id: a,
      };
    defaultLogger.debug("send data: ", s), this._rtcp.sendData(s);
  }
  onRotateInPanoMode(e) {
    const t = e.traceId,
      r = {};
    (r.width = 1280),
      (r.height = 720),
      (r.horz_fov = 92),
      (r.angle = {
        yaw: 100,
        pitch: 30,
      });
    const n = new ArrayBuffer(8),
      o = new DataView(n);
    getTilesInView(r, n);
    const a = n.slice(0);
    this.PendingMasks.unshift({
      buffer: a,
      angle: r.angle,
    }),
      MaskSetToOne(18, this.PanoView),
      operateForDataView(o, this.PanoView, o, (s, l) => s ^ (s & l)),
      this.requestPanoramaTest(
        0,
        0,
        0,
        [
          o.getUint8(0),
          o.getUint8(1),
          o.getUint8(2),
          o.getUint8(3),
          o.getUint8(4),
          o.getUint8(5),
          o.getUint8(6),
          o.getUint8(7),
        ],
        t
      );
  }
  processMetaWithTraceId(e) {
    for (const i of e.traceIds) {
      if (this.traceIdMap.has(i)) {
        const o = this.traceIdMap.get(i);
        o != null && ((o.receiveTime = Date.now()), (o.status = 1));
      }
      if (this.joyStickTraceIdMap.has(i)) {
        const o = this.joyStickTraceIdMap.get(i);
        o != null && ((o.receiveTime = Date.now()), (o.status = 1));
      }
      if (i == this.PendingMovingTraceId) {
        (this.inMovingMode = true),
          (this.MovingTraceId = this.PendingMovingTraceId),
          (this.StartMovingTs = this.PendingStartMovingTs),
          (this.PendingMovingTraceId = ""),
          (this.PendingStartMovingTs = 0),
          defaultLogger.info(
            "MoveTo TraceId match",
            this.StartMovingTs,
            Date.now()
          );
        const o = Date.now();
        (this.lastMoveResponseTime = o),
          (this.lastMoveProcessTime = o),
          (this.lastMoveDisplayTime = o),
          this.frameServerCircular.clear(),
          this.frameClientCircular.clear();
      }
    }
  }
  onTraceId(e, i = this) {
    const o = e.traceId,
      s = e.timestamp,
      c = e.event;
    if (c === "Rotation") {
      const d = {
        traceId: o,
        pts: 0,
        startTime: s,
        receiveTime: 0,
        readyTime: 0,
        displayTime: 0,
        status: 0,
      };

      this.traceIdMap.set(o, d);
      const _ = setTimeout(() => {
        if ((_ && clearTimeout(_), this.traceIdMap.has(o))) {
          const b = this.traceIdMap.get(o);
          switch (b == null ? void 0 : b.status) {
            case 0: {
              this.responseMiss += 1;
              break;
            }
            case 1: {
              this.processMiss += 1;
              const k = b.receiveTime - b.startTime;
              this.responseTimeArray.push(k);
              break;
            }
            case 2: {
              this.displayMiss += 1;
              const k = b.receiveTime - b.startTime,
                j = b.readyTime - b.receiveTime;
              this.responseTimeArray.push(k), this.processTimeArray.push(j);
              break;
            }
            case 3:
              defaultLogger.debug("status is 3");
          }
        }
      }, 1e3);
    } else if (c === "Joystick") {
      const d = {
        traceId: o,
        pts: 0,
        startTime: s,
        receiveTime: 0,
        readyTime: 0,
        displayTime: 0,
        status: 0,
      };
      this.joyStickTraceIdMap.set(o, d);

      const _ = setTimeout(() => {
        if ((_ && clearTimeout(_), this.joyStickTraceIdMap.has(o))) {
          const b = this.joyStickTraceIdMap.get(o);
          switch (b == null ? void 0 : b.status) {
            case 0: {
              this.joyStickResponseMiss += 1;
              break;
            }
            case 1: {
              this.joyStickProcessMiss += 1;
              const k = b.receiveTime - b.startTime;
              this.joyStickResponseTimeArray.push(k);
              break;
            }
            case 2: {
              this.joyStickDisplayMiss += 1;
              const k = b.receiveTime - b.startTime,
                j = b.readyTime - b.receiveTime;
              this.joyStickResponseTimeArray.push(k),
                this.joyStickProcessTimeArray.push(j);
              break;
            }
            case 3:
              defaultLogger.debug("status is 3");
          }
        }
      }, 1e3);
    } else
      c === "MoveTo"
        ? (defaultLogger.info("receive moveto traceId ", o, " at timestamp", s),
          (this.PendingMovingTraceId = o),
          (this.PendingStartMovingTs = s),
          (this.moveEvent = c),
          this.frameServerCircular.clear())
        : c === "GetOnAirship" || c === "GetOnVehicle"
        ? (defaultLogger.info(
            "receive airship traceId ",
            o,
            " at timestamp ",
            s
          ),
          (this.PendingMovingTraceId = o),
          (this.PendingStartMovingTs = s),
          (this.moveEvent = c),
          this.frameServerCircular.clear())
        : (c === "GetOffAirship" || c === "GetOffVehicle") &&
          this.clearMoveArray();
  }
  executeFunction(e, t) {
    if (this.functionMap.has(e)) {
      const r = this.functionMap.get(e);
      r != null && r(t);
    }
  }
  UpdateStats(e) {
    // console.log('UpdateStats',e.data);
    var i;
    (i = this._rtcp.connection) == null ||
      i.getStats(null).then((o) => {
        o.forEach((s) => {
          s.type == "data-channel" &&
            ((this.rtcMessageReceived = s.messagesReceived - s.messagesSent),
            (this.rtcBytesReceived = s.bytesReceived));
        });
      }),
      (this.receivedMedia_worker = e.data.framesReceived),
      (this.receivedYUV = e.data.framesDecoded),
      (this.receivedEmit = e.data.framesRendered),
      (this.mediaBytesReceived = e.data.mediaBytesReceived),
      (this.metaBytesReceived = e.data.metaBytesReceived),
      (this.packetsLost = e.data.packetsLost),
      (this.packetsDrop = e.data.packetsDrop),
      (this.framesAwait = e.data.framesAwait),
      (this.decodeTimePerFrame = e.data.decodeTimePerFrame),
      (this.decodeTimeMaxFrame = e.data.decodeTimeMaxFrame),
      (this.returnFrames = e.data.framesReturned),
      (this.sendOutBuffer = e.data.sendOutBuffer),
      (this.DecodeJankTimes = e.data.JankTimes),
      (this.bigDecodeJankTimes = e.data.bigJankTimes),
      (this.receiveIframes = e.data.receivedIframe),
      (this.decodeIframes = e.data.decodedIframe);
  }
  ReceiveDecodeMessage(e) {
    var b;
    const i = Date.now(),
      o = i - e.data.postTs;
    this.postMessageWaitArray.add(o);

    if (!this.firstYUVReceived) {
      this.firstYUVDecoded = e.data.yuv_ts;
      const k = this.firstYUVDecoded - this.rtcp.network.room._startTime;
      defaultLogger.infoAndReportMeasurement({
        type: "firstYUVDecodedAt",
        value: k,
        group: "joinRoom",
      });
      this.firstRender = Date.now();
      const j = this.firstYUVDecoded - this.rtcp.network.room._startTime;
      defaultLogger.infoAndReportMeasurement({
        type: "firstRenderAt",
        value: j,
        group: "joinRoom",
      });
      this.firstYUVReceived = true;
      this.lastRenderTs = Date.now();
    }

    if (
      !this.cachedRender[this.setPtr] &&
      this.cachedMetas[this.setPtr] != null
    ) {
      if (
        this.cachedStreams[this.setPtr] != null &&
        this.cachedStreams[this.setPtr].byteLength != 0
      ) {
        if (e.data.data == null) {
          this.executeFunction("stream", {
            stream: this.cachedStreams[this.setPtr],
            width: this.cachedResolution[this.setPtr].width,
            height: this.cachedResolution[this.setPtr].height,
            pts: this.cachedPtss[this.setPtr],
          });

          this.executeFunction("signal", {
            signal: this.cachedMetas[this.setPtr],
            pts: this.cachedPtss[this.setPtr],
            alreadyUpdateYUV: true,
          });
        } else {
          this.updateDropFrame += 1;
        }

        //重新decode cache ptr

        //console.log("this.cachedStreams", this.cachedStreams, this.setPtr);

        this.decoderWorker.postMessage(
          {
            t: 2,
            frameCnt: this.cachedPtss[this.setPtr],
            buffer: this.cachedStreams[this.setPtr],
          },
          [this.cachedStreams[this.setPtr].buffer]
        );
      }

      this.getPtr = (this.getPtr + 1) % this.cachedLength;
    }

    const s = e.data.metadata;

    if ((b = s == null ? void 0 : s.traceIds) != null && b.length)
      for (const k of s.traceIds) {
        if (this.traceIdMap.has(k)) {
          const j = this.traceIdMap.get(k);
          j != null && ((j.readyTime = Date.now()), (j.status = 2));
        }
        if (this.joyStickTraceIdMap.has(k)) {
          const j = this.joyStickTraceIdMap.get(k);
          j != null && ((j.readyTime = Date.now()), (j.status = 2));
        }
      }

    e.data.pts == this.moveStartPts &&
      (this.MoveProcessDelay = Date.now() - this.StartMovingTs);
    this.userId_test = this.rtcp.network.room.userId;
    if (this.inMovingMode) {
      const k = Date.now(),
        j = k - this.lastMoveProcessTime;
      this.moveProcessCircular.add(j), (this.lastMoveProcessTime = k);
    }
    const c = this.setPtr;
    this.cachedStreams[c] = e.data.data;
    this.cachedMetas[c] = e.data.metadata;
    this.cachedPtss[c] = e.data.pts;
    this.cachedRender[c] = false;
    this.cachedResolution[c] = {
      width: e.data.width,
      height: e.data.height,
    };

    this.setPtr = (this.setPtr + 1) % this.cachedLength;
    const _ = Date.now() - i;
    this.receiveYUVExecutionArray.add(_);
  }
  SendCacheFrameInfo(e) {
    var h, f, d, _, g, m, v;
    const t = e.data.cachedKey,
      r = e.data.metadata,
      n = t,
      o = r,
      a =
        (d =
          (f =
            (h = o.newUserStates) == null
              ? void 0
              : h.find((y) => y.userId === this.rtcp.network.room.userId)) ==
          null
            ? void 0
            : f.playerState) == null
          ? void 0
          : d.roomTypeId,
      s = this.rtcp.network.room.skinId,
      l =
        (v =
          (m =
            (g =
              (_ = o.newUserStates) == null
                ? void 0
                : _.find((y) => y.userId === this._rtcp.network.room.userId)) ==
            null
              ? void 0
              : g.playerState) == null
            ? void 0
            : m.player) == null
          ? void 0
          : v.position,
      u = {
        MsgType: 1,
        FrameCacheMsg: {
          FrameIndex: n,
          RoomTypeId: a,
          SkinID: s,
          Position: l,
        },
      };
    let c = "";
    try {
      c = JSON.stringify(u);
    } catch (y) {
      defaultLogger.error(y);
      return;
    }
  }
  ReceivePanoramaDecodeMessage(e) {
    defaultLogger.info("Receive Panorama Image in Workers.ts"),
      MaskSetToOne(e.data.tileId, this.PanoView);
    let i = 0,
      o;
    const s = this.PendingMasks.length;
    for (i = 0; i < s; i++) {
      const c = this.PendingMasks[i].buffer,
        d = new DataView(c),
        _ = new ArrayBuffer(8),
        b = new DataView(_);
      if (
        (operateForDataView(this.PanoView, d, b, (k, j) => j ^ (k & j)),
        IsAll0(b))
      ) {
        o = this.PendingMasks[i].angle;
        break;
      }
    }
    for (let c = i; c < s; c++) this.PendingMasks.pop();
    this.executeFunction("panorama", {
      data: e.data.data,
      metadata: e.data.metadata,
      tileId: e.data.tileId,
      finished: true,
      matchAngle: o,
    });
  }
  enable_decoder_queue_logging() {
    this.decoderWorker.postMessage({
      t: 100,
      status: true,
    });
  }
  disable_decoder_queue_logging() {
    this.decoderWorker.postMessage({
      t: 100,
      status: false,
    });
  }

  async init(
    e = {
      width: 1280,
      height: 720,
      userID: "testUserId",
      pageSession: "pagesession1",
      serverSession: "serversession1",
    }
  ) {
    for (let o = 0; o < FRAME_COMPOSE_LENGTH; o++) {
      const s = {
        buffer: new Uint8Array(262144),
        size: 0,
        startReceiveTime: 0,
        serverTime: 0,
        frameCnt: -1,
      };
      this.cacheFrameComposes.push(s);
    }
    USER_ID = e.userID;
    PAGE_SESSION = e.pageSession;
    SERVER_SESSION = e.serverSession;

    // console.log("v2Decoder", v2Decoder);

    const i = new Blob([v2Decoder], {
      type: "application/javascript",
    });
    this.decoderWorker = new Worker(URL.createObjectURL(i));

    window.startRecord = ()=>{
      this.decoderWorker.postMessage({
        t:6
      })
    }

    window.stopRecord = ()=>{
      this.decoderWorker.postMessage({
        t:7
      })
    } 
    // this.enable_decoder_queue_logging();

    this.decoderWorker.postMessage({
      t: 9,
      url: WASM_URLS[WASM_Version],
      jitterLength: DECODER_PASSIVE_JITTER,
    });
    this.decoderWorker.postMessage({
      t: 1,
      config: e,
    });

    return new Promise((o) => {
      this.decoderWorker.onmessage = (s) => {
        switch (s.data.t) {
          case 0:
            this.ReceiveDecodeMessage(s);
            break;
          case 1:
            this.UpdateStats(s);
            break;
          case 2:
            o();
            break;
          case 3:
            this.SendCacheFrameInfo(s);
            break;
          case 4: {
            this.downloadBlob(
              s.data.data,
              "test.264",
              "application/octet-stream"
            );
            break;
          }
          case 5:
            // console.log(
            //   "接受webrtc请求(来自worker)：" + JSON.stringify(s.data.metadata)
            // );
            this.executeFunction("signal", {
              signal: s.data.metadata,
              pts: -1,
              alreadyUpdateYUV: false,
            });
            break;
          case 6:
            defaultLogger.infoAndReportMeasurement(s.data.data),
              defaultLogger.debug("WASM Ready Cost");
            break;
          case 7:
            this.ReceivePanoramaDecodeMessage(s);
            break;
          case 8: {
            const c = {
              MstType: 0,
            };
            let d = "";
            try {
              d = JSON.stringify(c);
            } catch (b) {
              defaultLogger.error(b);
              return;
            }
            const _ = "wasm:" + d;
            this._rtcp.sendStringData(_);
            //console.log("meta——丢帧" + s.data.metadata); //.newUserStates[0].playerState.user.camera.yaw);
            break;
          }
          case 9: {
            defaultLogger.info(s.data.printMsg);
            break;
          }
          case 10: {
            defaultLogger.error(s.data.printMsg),
              this.executeFunction("error", {
                code: s.data.code,
                message: s.data.printMsg,
              });
            break;
          }
          case 11: {
            console.log("Workers:pts: %s, isIDR: %s, length: %s, traceIds: %s, cameraPosition:%s, isMoving:%s, time: %s",
            s.data.pts,
            s.data.isIDR,
            s.data.mediaLength,
            s.data.traceIds,
            s.data.cameraPosition,
            s.data.isMoving,
            new Date().getTime());
            if(window.JoyStickDelyTime && s.data.traceIds && window.JoyStickDelyTime.trace_id && s.data.traceIds.length>0 && s.data.traceIds.indexOf(window.JoyStickDelyTime.trace_id)>-1){
              window.JoyStickDelyTime.receiveTime = new Date().getTime();
              window.JoyStickDelyTime.time_delay = window.JoyStickDelyTime.receiveTime - window.JoyStickDelyTime.sendTime;
            }
            break;
          }
          default:
            defaultLogger.error("Receive unknown message event from decoder"),
              defaultLogger.debug(s.data);
            break;
        }
      };
    });
  }

  setPageSession(e) {
    PAGE_SESSION = e;
  }

  UpdateYUV() {
    var i, o;
    const e = this.getPtr;

    // console.log("UpdateYUV", this.getPtr);
    // console.log("UpdateYUV", this.cachedMetas[e]);
    // console.log("UpdateYUV",  this.cachedStreams[e]);

    if (this.cachedMetas[e] != null && !this.cachedRender[e]) {
      const s = Date.now();
      if (this.firstUpdateYUV) {
        const $ =
          ((i = this.cachedStreams[e]) == null ? void 0 : i.byteLength) || 0;
        defaultLogger.infoAndReportMeasurement({
          type: "firstUpdateStreamLength",
          value: $,
          group: "joinRoom",
        });
        this.firstUpdateYUV = false;
      }

      if (this.cachedStreams[e] != null) {
        // console.log("cachedStreams", this.cachedStreams[e], e);
        this.executeFunction("stream", {
          stream: this.cachedStreams[e],
          width: this.cachedResolution[e].width,
          height: this.cachedResolution[e].height,
          pts: this.cachedPtss[e],
        });
      }

      const c = Date.now();
      this.cachedStreams[e] != null &&
        this.decoderWorker.postMessage(
          {
            t: 2,
            frameCnt: this.cachedPtss[e],
            buffer: this.cachedStreams[e],
          },
          [this.cachedStreams[e].buffer]
        );
      const d = Date.now(),
        _ = c - s,
        b = d - c;
      (_ > 33 || b > 10) &&
        defaultLogger.debug(
          "[wwwarning] updateYUV takes ",
          _,
          " ms, postMessage takes ",
          b,
          " ms for index ",
          this.cachedPtss[e]
        ),
        c - this.lastRenderTs > 84 && this.JankTimes++,
        c - this.lastRenderTs > 125 && this.bigJankTimes++,
        (this.lastRenderTs = c);
      const k = c - s;
      this.updateYUVCircular.add(k);
      const j = this.cachedMetas[e];
      if ((o = j == null ? void 0 : j.traceIds) != null && o.length)
        for (const $ of j.traceIds) {
          if (this.traceIdMap.has($)) {
            const _e = this.traceIdMap.get($);
            if (_e != null) {
              (_e.displayTime = Date.now()), (_e.status = 3);
              const et = _e.receiveTime - _e.startTime,
                tt = _e.readyTime - _e.receiveTime,
                rt = _e.displayTime - _e.readyTime,
                it = _e.displayTime - _e.startTime;
              this.responseTimeArray.push(et),
                this.processTimeArray.push(tt),
                this.displayTimeArray.push(rt),
                this.overallTimeArray.push(it),
                this.traceIdMap.delete($);
            }
          }
          if (this.joyStickTraceIdMap.has($)) {
            const _e = this.joyStickTraceIdMap.get($);
            if (_e != null) {
              (_e.displayTime = Date.now()), (_e.status = 3);
              const et = _e.receiveTime - _e.startTime,
                tt = _e.readyTime - _e.receiveTime,
                rt = _e.displayTime - _e.readyTime,
                it = _e.displayTime - _e.startTime;
              this.joyStickResponseTimeArray.push(et),
                this.joyStickProcessTimeArray.push(tt),
                this.joyStickDisplayTimeArray.push(rt),
                this.joyStickOverallTimeArray.push(it),
                this.joyStickTraceIdMap.delete($);
            }
          }
        }

      this.cachedPtss[e] == this.moveStartPts &&
        (this.MoveDisplayDelay = Date.now() - this.StartMovingTs);
      if (this.inMovingMode) {
        const $ = Date.now(),
          _e = $ - this.lastMoveDisplayTime;
        this.moveDisplayCircular.add(_e), (this.lastMoveDisplayTime = $);
      }
      // console.log(
      //   "接受webrtc请求（定时执行UpdateYUV）：" +
      //     JSON.stringify(this.cachedMetas[e])
      // );
      // console.log("回传", {
      //   signal: this.cachedMetas[e],
      //   pts: this.cachedPtss[e],
      //   alreadyUpdateYUV: true,
      // });
      this.executeFunction("signal", {
        signal: this.cachedMetas[e],
        pts: this.cachedPtss[e],
        alreadyUpdateYUV: true,
      });
      this.cachedRender[e] = true;
      this.getPtr = (this.getPtr + 1) % this.cachedLength;
    }
  }
  unmarshalPano(e) {
    return false;
  }
  unmarshalPanobk(e) {
    const i = new DataView(e),
      o = i.getUint32(0);
    if (o == 1723558763) return true;
    if (o != 2296221069) return false;
    //console.log("Receive Pano Message"), i.getUint16(4);
    const s = i.getUint16(6),
      c = i.getUint32(8),
      d = i.getUint32(12),
      _ = i.getUint32(16),
      b = i.getUint32(20),
      k = e.byteLength - s;
    if (k == d) {
      const j = new Uint8Array(e).subarray(s).slice(0, _),
        _e = {
          data: new Uint8Array(e).subarray(s).slice(_, d),
          mediaLen: d - _,
          metadata: j,
          metaLen: _,
          tileId: c,
        };
      this.decoderWorker.postMessage({
        t: 8,
        data: _e,
      });
    } else {
      const j = new Uint8Array(e, s, k);
      if (this.cachePanoTileID == c) {
        if (
          (this.panoCacheBuffer.set(j, b),
          (this.panoCacheSize += k),
          this.panoCacheSize === d)
        ) {
          const $ = new Uint8Array(this.panoCacheBuffer).slice(0, _),
            et = {
              data: new Uint8Array(this.panoCacheBuffer).slice(_, d),
              mediaLen: d - _,
              metadata: $,
              metaLen: _,
              tileId: c,
            };
          this.decoderWorker.postMessage({
            t: 8,
            data: et,
          }),
            (this.panoCacheSize = 0);
        }
      } else
        this.panoCacheBuffer.set(j, b),
          (this.panoCacheSize = k),
          (this.cachePanoTileID = c);
    }
    return true;
  }
  clearMoveArray() {
    (this.MovingTraceId = ""),
      (this.inMovingMode = false),
      (this.StartMovingTs = 0),
      (this.MoveToFrameCnt = 0),
      (this.MoveResponseDelay = 0),
      (this.MoveProcessDelay = 0),
      (this.MoveDisplayDelay = 0),
      (this.moveStartPts = -1),
      this.moveResponseCircular.clear(),
      this.moveProcessCircular.clear(),
      this.moveDisplayCircular.clear(),
      (this.moveEvent = "");
  }
  getIsMoving(e) {
    let i;
    if (typeof e.newUserStates != "undefined")
      for (let o = 0; o < e.newUserStates.length; o++) {
        const s = e.newUserStates[o];
        if (s.userId == this.rtcp.network.room.userId) {
          i = s.renderInfo.isMoving;
          break;
        }
      }
    return i;
  }
  isHeartBeatPacket(e, i) {
    return new DataView(e).getUint32(0) == 2009889916;
  }
  resetSendTimeDiff() {
    (this.prevSenderTs = 0), this.serverSendTimeArray.clear();
  }
  calcSendTimeDiff(e) {
    if (this.prevSenderTs == -1) {
      this.prevSenderTs = e;
      return;
    }
    const i = e - this.prevSenderTs;
    this.serverSendTimeArray.add(i), (this.prevSenderTs = e);
  }
  // new unmarshalStream
  unmarshalStreamBk(data) {
    const dateView = new DataView(data);
    // const pts = Date.now();
    if (dateView.getUint32(0) != 1437227610) return false; // flag auth

    return true;
  }
  // backup main unmarshalStreamBk
  unmarshalStream(e) {
    var lt, ft, ht, pt, dt, _t, mt, vt, yt, Et;

    const i = Date.now();
    const o = new DataView(e);

    if (o.getUint32(0) != 1437227610) return false; // 32位0bit 流标识位

    o.getUint16(4); // 2 ?暂时未用
    const c = o.getUint16(6), // 16位6bit 36 ? 可能是混数
      d = o.getUint16(8), // 16位8bit 存当前帧数
      fCnt = d,
      b = o.getUint16(10); // 1 3 255 1,3 ? 方向 空包 255 可能是 DIR 方向
    let k = false;
    b == 1 && (k = true); //
    const j = o.getUint32(12), // 16位12bit ? 帧 byteLength 长度 metaLen
      $ = o.getUint32(16), // 16位16bit  有效流总大小  0 是空包 metaLen
      _e = o.getUint32(20), // calcSendTimeDiff 与时间有关
      et = o.getUint16(24), // 大多数为 0,待定 与inPanoMode 开关有关系
      tt = o.getUint16(26), // 0 / 1 待定  与用户状态有关
      rt = o.getUint32(28), // 0 cachedKey 3, 5, 7
      it = o.getUint32(c - 4), // ？同步I帧或大小slice steam切片 按开始大小 $是总大小
      nt = j + $, // ？cnt  宏块 总包大小
      ot = e.byteLength - c, // cnt 宏块 有效长段
      at = new Uint8Array(e, c, ot); // e流 真实有效  以32位前6bit 可能是留白，

    this.calcSendTimeDiff(_e);

    // console.log("hey", Date.now() - _e);

    // console.log("zh----", fCnt, b);
    if (b !== 255) {
      console.log("gemer1", {
        byteLength: e.byteLength,
        frame: fCnt,
        mediaLen: $,
        metaLen: j,
        b: b,
        cachedKey: rt,
        serverTime: _e,
        it: it,
        start: c,
        ot: ot,
        nt: nt,
        total: nt,
        tt: tt,
        et: et,
        isPureMeta: ot === nt,
        at: at,
      });
    }
    let copyIDR = b;
    //console.log("metaverse----IDR:" + copyIDR);

    // debugger;
    const down = Date.now();
    let st;
    if (this.inPanoMode && ($ > 0 || et))
      return (
        defaultLogger.error(
          "Stream Protocal Violation: receive illegal stream in Pano mode"
        ),
        true
      );

    // cnt总包大小 === cnt 有效长段
    if (ot === nt) {
      this.receivedMedia++;
      // ？宏块位置重新较正， c是留白，从留白开计？
      const At = new Uint8Array(e).subarray(c);
      _e - this.lastServerTS > 60
        ? this.serverFrameSlow++
        : _e - this.lastServerTS < 16 && this.serverFrameFast++;
      const gt = Date.now();
      gt - this.lastClientTS > 60
        ? this.clientFrameSlow++
        : gt - this.lastClientTS < 16 && this.clientFrameFast++;
      const St = $ === 0,
        xt = _e - this.lastServerTS;

      this.lastServerTS != 0 &&
        ((d + 65536 - this.lastSeq) % 65536 === 1 &&
          this.lastIsPureMeta == St &&
          (St
            ? this.srvMetaIntervalCircular.add(xt)
            : this.srvMediaIntervalCircular.add(xt)),
        this.frameServerCircular.add(xt),
        this.frameClientCircular.add(gt - this.lastClientTS)),
        (this.lastSeq = d),
        (this.lastIsPureMeta = St),
        (this.lastServerTS = _e),
        (this.lastClientTS = gt);

      const bt = At.subarray(0, j); // 将坐标插入流，再拿出来？

      const Rt = Date.now();
      const Mt = JSON.parse(this.Stringify(bt)); // json 与帧map的坐标数据
      const Pt = Date.now();

      console.log("gemer2", fCnt, it, Mt);

      //this.showAllReceivedMetadata && console.log(_e, gt, Mt);

      // console.log("Pt - Rt", Pt - Rt, Pt, Rt);
      this.metaParseArray.push(Pt - Rt);

      (lt = Mt.traceIds) != null &&
        lt.length &&
        this.processMetaWithTraceId(Mt),
        $ != 0 &&
          this.moveStartPts == -1 &&
          this.inMovingMode &&
          (this.moveStartPts = d),
        this.moveStartPts == d &&
          ((this.MoveResponseDelay = Date.now() - this.StartMovingTs)
          // console.log(
          //   "move response delay: ",
          //   d,
          //   this.moveStartPts,
          //   this.MoveResponseDelay
          // )
          );

      const It = this.getIsMoving(Mt);

      if (
        (this.inMovingMode &&
          It == 0 &&
          this.lastIsMoving == 1 &&
          this.clearMoveArray(),
        typeof It != "undefined" && (this.lastIsMoving = It),
        this.inMovingMode)
      ) {
        const Ct = Date.now(),
          Ot = Ct - this.lastMoveResponseTime;
        this.moveResponseCircular.add(Ot), (this.lastMoveResponseTime = Ct);
      }

      // 流与状态有关
      (et || tt) &&
        (st =
          (dt =
            (pt =
              (ht =
                (ft = Mt.newUserStates) == null
                  ? void 0
                  : ft.find(
                      (Ct) => Ct.userId === this._rtcp.network.room.userId
                    )) == null
                ? void 0
                : ht.playerState) == null
              ? void 0
              : pt.player) == null
            ? void 0
            : dt.position);

      //封装格式
      const Dt = {
        t: 0,
        data: At,
        mediaLen: $,
        metaLen: j,
        metadata: Mt,
        frameCnt: fCnt,
        server_ts: _e,
        isIDR: k,
        cacheRequest: tt,
        cached: et,
        cachedKey: rt,
        position: st,
      };
      // console.error('Dt',Dt);
      if (this.inPanoMode) {
        // console.log('接受webrtc请求：'+JSON.stringify(Mt));
        this.executeFunction("signal", {
          signal: Mt,
          pts: -1,
          alreadyUpdateYUV: true,
        });
        return true;
      }

      if (
        (this.decoderWorker.postMessage(Dt, [At.buffer]),
        !this.firstMediaReceived)
      ) {
        this.firstMediaArrival = Date.now();
        const Ct = this.firstMediaArrival - this.rtcp.network.room._startTime;

        defaultLogger.infoAndReportMeasurement({
          type: "firstMediaArravalAt",
          value: Ct,
          group: "joinRoom",
        });
        // this.downloadBlob(
        //   [At.buffer],
        //   `first.h264`,
        //   "application/octet-stream"
        // );
        this.firstMediaReceived = true;
      }
    } else {
      const At = this.hasFrmCntInCache(fCnt);

      if (At != -1)
      {
        console.log('out of bound:'+it);
        if (
          (this.cacheFrameComposes[At].buffer.set(at, it),
          (this.cacheFrameComposes[At].size += ot),
          this.cacheFrameComposes[At].size === nt)
        ) {
          const gt = new Uint8Array(this.cacheFrameComposes[At].buffer).slice(
            0,
            nt
          );

          this.cacheFrameComposes[At].frameCnt = -1;
          this.cacheFrameComposes[At].size = 0;
          this.cacheFrameComposes[At].startReceiveTime = 0;
          this.cacheFrameComposes[At].serverTime = 0;
          this.receivedMedia++;

          _e - this.lastServerTS > 60
            ? this.serverFrameSlow++
            : _e - this.lastServerTS < 16 && this.serverFrameFast++;

          const St = Date.now();

          St - this.lastClientTS > 60
            ? this.clientFrameSlow++
            : St - this.lastClientTS < 16 && this.clientFrameFast++,
            this.lastServerTS != 0 &&
              (this.frameServerCircular.add(_e - this.lastServerTS),
              this.frameClientCircular.add(St - this.lastClientTS)),
            (this.lastServerTS = _e),
            (this.lastClientTS = St);

          const xt = gt.subarray(0, j);
          // console.log("xt", xt);
          const bt = Date.now();
          const Rt = JSON.parse(this.Stringify(xt));
          const Mt = Date.now();

          //this.showAllReceivedMetadata && console.log(_e, St, Rt),
            this.metaParseArray.push(Mt - bt),
            (_t = Rt.traceIds) != null &&
              _t.length &&
              this.processMetaWithTraceId(Rt),
            $ != 0 &&
              this.moveStartPts == -1 &&
              this.inMovingMode &&
              (this.moveStartPts = d),
            this.moveStartPts == d &&
              (this.MoveResponseDelay = Date.now() - this.StartMovingTs);
          const Pt = this.getIsMoving(Rt);
          if (
            (this.inMovingMode &&
              Pt == 0 &&
              this.lastIsMoving == 1 &&
              this.clearMoveArray(),
            typeof Pt != "undefined" && (this.lastIsMoving = Pt),
            this.inMovingMode)
          ) {
            const Dt = Date.now(),
              Ct = Dt - this.lastMoveResponseTime;
            this.moveResponseCircular.add(Ct), (this.lastMoveResponseTime = Dt);
          }
          (et || tt) &&
            (st =
              (Et =
                (yt =
                  (vt =
                    (mt = Rt.newUserStates) == null
                      ? void 0
                      : mt.find(
                          (Dt) => Dt.userId === this._rtcp.network.room.userId
                        )) == null
                    ? void 0
                    : vt.playerState) == null
                  ? void 0
                  : yt.player) == null
                ? void 0
                : Et.position);

          const It = {
            t: 0,
            data: gt,
            mediaLen: $,
            metaLen: j,
            metadata: Rt,
            frameCnt: fCnt,
            server_ts: _e,
            isIDR: k,
            cacheRequest: tt,
            cached: et,
            cachedKey: rt,
            position: st,
          };
          //有效Iframe
          //console.error("IT", It);
          // console.log("Work-It1.data", fCnt, It.data);
          // console.log(
          //   "Work-IT2",
          //   fCnt,
          //   It.metadata.mediaSrc +
          //     "," +
          //     JSON.stringify(
          //       It.metadata.newUserStates[0].playerState.player.position
          //     )
          // );
          // testFrame += 1;
          // console.error("IT", fCnt, JSON.stringify(Rt));
          //console.error("traceIds", fCnt, Rt.traceIds.length);
          // console.log("IT-fCnt", It.data);
          // const clip = It.data.subarray(It.metaLen, It.metaLen + It.mediaLen);
          // console.log("testFrame", testFrame);
          // testBuffer.set(clip, testBufferLength);
          // testBufferLength += clip.byteLength;
          // if (testFrame > 90) {
          //   this.downloadBlob(
          //     testBuffer.subarray(0, testBufferLength),
          //     `origin.h264`,
          //     "application/octet-stream"
          //   );
          // }

          // this.downloadBlob(
          //   It.data.subarray(It.metaLen, It.metaLen + It.mediaLen),
          //   `100.${testFrame.padLeft(4,'0')}.h264`,
          //   "application/octet-stream"
          // );
          //console.log("metaverse----", Rt.newUserStates[0].playerState.camera.angle.yaw);
          //console.log("metaverse Worker----", `100.${testFrame.padLeft(4,'0')}`, copyIDR);
          // this.downloadBlob(
          //   It.data.subarray(0, It.metaLen),
          //   `100.${testFrame.padLeft(4,'0')}.json`,
          //   "application/json"
          // );

          if (this.inPanoMode) {
            // console.log("接受webrtc请求：" + JSON.stringify(Rt));
            this.executeFunction("signal", {
              signal: Rt,
              pts: -1,
              alreadyUpdateYUV: true,
            });
            return true;
          }
          if (
            (this.decoderWorker.postMessage(It, [gt.buffer]),
            !this.firstMediaReceived)
          ) {
            // this.downloadBlob([gt.buffer], `gt.h264`, "application/octet-stream");
            this.firstMediaArrival = Date.now();
            const Dt =
              this.firstMediaArrival - this.rtcp.network.room._startTime;
            defaultLogger.infoAndReportMeasurement({
              type: "firstMediaArravalAt",
              value: Dt,
              group: "joinRoom",
            });
            this.firstMediaReceived = true;
          }
        } else
          this.cacheFrameComposes[At].size > nt &&
            defaultLogger.debug(
              "I frame exceed, cache size is ",
              this.cacheSize,
              ", total size is ",
              nt
            );
      }
      else if (At == -1) {
        let gt = this.hasFrmCntInCache(-1);
        if (gt == -1) {
          let St = Date.now() + 1e18,
            xt = -1;
          for (let bt = 0; bt < this.cacheFrameComposes.length; bt++)
            this.cacheFrameComposes[bt].serverTime < St &&
              ((St = this.cacheFrameComposes[bt].serverTime), (xt = bt));
          gt = xt;
        }
        this.cacheFrameComposes[gt].buffer.set(at, it),
          (this.cacheFrameComposes[gt].size = ot),
          (this.cacheFrameComposes[gt].frameCnt = fCnt),
          (this.cacheFrameComposes[gt].startReceiveTime = Date.now()),
          (this.cacheFrameComposes[gt].serverTime = _e);
      }
    }
    const ct = Date.now() - i;
    return this.unmarshalStreamExecutionArray.add(ct), true;
  }
  reset() {
    defaultLogger.debug("Worker reset is called"),
      (this.cacheFrameCnt = 0),
      (this.receivedMedia = 0),
      (this.reconnectSignal = true),
      this.decoderWorker.postMessage({
        t: 4,
      });
  }
  dataHandleOff(e) {
    defaultLogger.debug("hhh");
  }
  dataHandle(e) {
    if (this.saveframe) {
      //console.log("接受webrtc请求：录制视频");
      this.decoderWorker.postMessage({
        t: 6,
      });
      this.saveframe = false;
    }

    if (this.SaveMediaStream) {
      //console.log("接受webrtc请求：下载视频");
      this.decoderWorker.postMessage({
        t: 7,
      }),
        (this.SaveMediaStream = false);
    }

    const i = new Uint8Array(e);
    if (i.length >= 4 && this.isHeartBeatPacket(i.buffer, i.length) == true) {
      // console.log("接受webrtc请求：心跳");
      return;
    }

    if (i.length > 36 && this.unmarshalStream(i.buffer) == true) {
      this.reconnectSignal &&
        (this.executeFunction("reconnectedFrame", {}),
        (this.reconnectSignal = false));
      // console.log("接受webrtc请求：视频流");
      return;
    }
    if (i.length > 20 && this.unmarshalPano(i.buffer) == true) {
      // console.log("接受webrtc请求：全景图");
      return;
    }
    this.noWasmBytesReceived += e.byteLength;
    const o = JSON.parse(this.Stringify(i));
    //console.log("接受webrtc请求：" + JSON.stringify(o));
    this.executeFunction("signal", {
      signal: o,
      pts: -1,
      alreadyUpdateYUV: true,
    });
  }
  changePanoMode(e) {
    this.inPanoMode = e;
  }
  uploadDataToServer() {
    // delete all
  }
}
