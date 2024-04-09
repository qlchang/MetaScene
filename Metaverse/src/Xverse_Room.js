import XverseAvatarManager from "./XverseAvatarManager.js";
import Codes from "./enum/Codes.js";
import PathManager from "./PathManager.js";
import Camera from "./Camera.js";
import Stats from "./Stats.js";
import ActionsHandler from "./ActionsHandler.js";
import Signal from "./Signal.js";
import ModelManager from "./ModelManager.js";
import { reporter } from "./Reporter.js";
import util from "./util.js";
import XverseEffectManager from "./XverseEffectManager.js";
import TimeoutError from "./error/TimeoutError.js";
import ParamError from "./error/ParamError.js";
import MotionType from "./enum/MotionType.js";
import NetworkController from "./NetworkController.js";
import InitNetworkTimeoutError from "./error/InitNetworkTimeoutError.js";
import InitConfigTimeoutError from "./error/InitConfigTimeoutError.js";
import InitDecoderTimeoutError from "./error/InitDecoderTimeoutError.js";
import InitEngineError from "./error/InitEngineError.js";
import { eventsManager } from "./EventsManager.js";
import EngineProxy from "./EngineProxy.js";
import EventsController from "./EventsController.js";
import EImageQuality from "./enum/EImageQuality.js";
import Panorama from "./Panorama.js";
import Debug from "./Debug.js";
import Logger from "./Logger.js";
import NewUserStateType from "./enum/NewUserStateType.js";

const logger = new Logger("4DMVS_Room");
export default class Xverse_Room extends EventEmitter {
  constructor(options) {
    super();
    this.disableAutoTurn = !1;
    this.options;
    this._currentNetworkOptions;
    this.lastSkinId;
    this.debug;
    this.isFirstDataUsed = !1;
    this.userId = null;
    this.pathManager = new PathManager();
    this.networkController;
    this._startTime = Date.now();
    this.canvas;
    this.modelManager;
    this.eventsController;
    this.panorama;
    this.engineProxy;
    this._id;
    this.skinList = [];
    this.isHost = !1;
    this.avatarManager = new XverseAvatarManager(this);
    this.effectManager = new XverseEffectManager(this);
    this.sceneManager;
    this.scene;
    this.breathPointManager;
    this._currentState;
    this.joined = !1;
    this.disableRotate = !1;
    this.isPano = !1;
    this.movingByClick = !0;
    this.camera = new Camera(this);
    this.stats = new Stats(this);
    this.isUpdatedRawYUVData = !1;
    this.actionsHandler = new ActionsHandler(this);
    this._currentClickingState = null;
    this.signal = new Signal(this);
    this.firstFrameTimestamp;
    this.moveToExtra = "";

    this.options = options
    this.options.wsServerUrl || (this.options.wsServerUrl = SERVER_URLS.DEV)
    this.modelManager = ModelManager.getInstance(options.appId, options.releaseId)
    this.updateReporter()

    const n = options,
      { canvas: t } = n,
      r = Oe(n, ["canvas"]);

    logger.infoAndReportMeasurement({
      type: "startJoinRoomAt",
      group: "joinRoom",
      value: 0,
      extraData: r
    });
  }

  receiveRtcData = async () => {
    logger.info("Invoke receiveRtcData");
    let i = !1,
      o = !1,
      s = !1,
      c = !1;
    return this.viewMode === "serverless" ? (
      logger.warn("set view mode to serverless"),
      this.setViewMode("observer").then(() => this, () => this)
    ) : new Promise((resolve, reject) => {
      const workers = this.networkController.rtcp.workers;

      workers.registerFunction("signal", data => {
        // data && data.signal &&
        // console.error(data.signal.code, data.signal.actionResponses, data.signal.newUserStates)
        // 更新坐标数据
        this.signal.handleSignal(data, reject)
        
        // data.signal.newUserStates 
        // && data.signal.newUserStates[0] 
        // && data.signal.newUserStates[0].playerState 
        // && data.signal.newUserStates[0].playerState.camera 
        // && console.error(data.signal.newUserStates[0].playerState.camera.position, data.signal.newUserStates[0].playerState.camera.angle.yaw)
      }),

      workers.registerFunction("stream", data => {
        // 更新视频贴图数据
        this.emit("streamTimestamp", {
          timestamp: Date.now()
        })
        o || (o = !0, logger.info("Invoke stream event"))
        if (data.stream) {
          s || (s = !0, logger.info("Invoke updateRawYUVData"))
          this.isUpdatedRawYUVData = !1;
          const $ = this._currentState.skin == null ? void 0 : this._currentState.skin.fov;
          this.sceneManager.materialComponent.updateRawYUVData(data.stream, data.width, data.height, $)
          this.isUpdatedRawYUVData = !0
        }
        if (!i) {
          logger.info("Invoke isAfterRenderRegistered")
          i = !0
          this.scene.registerAfterRender(() => {
            this.engineProxy.frameRenderNumber >= 2
              && (c || (
                c = !0,
                logger.info("Invoke registerAfterRender")),
                this.isFirstDataUsed || (logger.info("Invoke isStreamAvailable"),
                  this.isFirstDataUsed = !0,
                  this.firstFrameTimestamp = Date.now(),
                  resolve(this),
                  this.afterJoinRoom()
                ))
          })
        }
      }),

      this.panorama.bindListener(() => {
        resolve(this)
        this.afterJoinRoom()
      }),
      workers.registerFunction("reconnectedFrame", () => { }),
      logger.info("Invoke decoderWorker.postMessage"),
      workers.decoderWorker.postMessage({
        t: 5
      })
    })
  }

  get currentNetworkOptions() {
    return this._currentNetworkOptions;
  }
  get viewMode() {
    var e;
    return ((e = this._currentState) == null ? void 0 : e.viewMode) || "full";
  }
  get id() {
    return this._id;
  }
  get skinId() {
    return this._currentState.skinId;
  }
  get skin() {
    return this._currentState.skin;
  }
  get sessionId() {
    return this.currentNetworkOptions.sessionId;
  }
  get pictureQualityLevel() {
    return this.currentState.pictureQualityLevel;
  }
  get avatars() {
    return Array.from(this.avatarManager.avatars.values());
  }
  get currentState() {
    var e;
    return le(oe({}, this._currentState), {
      state: (e = this.networkController) == null ? void 0 : e._state,
    });
  }
  get _userAvatar() {
    return this.avatars.find((e) => e.userId === this.userId);
  }
  get tvs() {
    return this.engineProxy._tvs;
  }
  get tv() {
    return this.tvs[0];
  }
  get currentClickingState() {
    return this._currentClickingState;
  }
  afterJoinRoomHook() { }
  beforeJoinRoomResolveHook() { }
  afterReconnectedHook() { }
  handleSignalHook(e) { }
  skinChangedHook() { }
  async beforeStartGameHook(e) { }
  loadAssetsHook() { }
  afterUserAvatarLoadedHook() { }
  audienceViewModeHook() { }
  setViewModeToObserver() { }
  handleVehicleHook(e) { }

  updateReporter() {
    const { avatarId, skinId, userId, roomId, role, appId, wsServerUrl } = this.options;
    reporter.updateHeader({ userId }),
      reporter.updateBody({ roomId, role, skinId, avatarId, appId, wsServerUrl })
  }

  async initRoom() {
    const { timeout: e = DEFAULT_JOINROOM_TIMEOUT } = this.options;
    if (util.isSupported()) {
      return this._initRoom()._timeout(e, new TimeoutError("initRoom timeout"));
    } else {
      return Promise.reject(new UnsupportedError());
    }
  }

  async _initRoom() {
    const e = this.validateOptions(this.options);
    if (e) {
      return logger.error("initRoom param error", e),
        Promise.reject(e);
    }
    const {
      canvas, avatarId, skinId, userId, wsServerUrl, role, token, pageSession, rotationRenderType, isAllSync = !1, appId, camera, player,
      avatarComponents, nickname, avatarScale, firends = [], syncByEvent = !1, areaName, attitude = MotionType.Walk, pathName, viewMode = "full",
      person, roomId, roomTypeId, hasAvatar = !1, syncToOthers = !1, prioritySync = !1, extra, removeWhenDisconnected = !0
    } = this.options;
    this.setCurrentNetworkOptions({
      avatarId, skinId, roomId, userId, wsServerUrl, role, token, pageSession, rotationRenderType, isAllSync, appId, camera, player,
      avatarComponents, nickname, avatarScale, firends, syncByEvent, areaName, attitude, pathName,
      person, roomTypeId, hasAvatar, syncToOthers, prioritySync, extra, removeWhenDisconnected
    });

    this.userId = userId;
    this.canvas = canvas;
    areaName && (this.pathManager.currentArea = areaName);
    this.networkController = new NetworkController(this);
    this.setCurrentState({ areaName, pathName, attitude, speed: 0, viewMode, state: this.networkController._state, skinId });
    try {
      await Promise.all([this.initNetwork(), this.initConfig(), this.initWasm()]),
        logger.info("network config wasm all ready, start to create game");
      const skin = await this.requestCreateRoom({ skinId })
        , skinRoute = skin.routeList.find(route => route.areaName === areaName)
        , speed = ((skinRoute == null ? void 0 : skinRoute.step) || 7.5) * 30;
      this.updateCurrentState({ skin, skinId: skin.id, versionId: skin.versionId, speed }),
        await this.initEngine(skin)
    } catch (e) {
      return Promise.reject(e)
    }
    this.beforeJoinRoomResolve();
    return this.receiveRtcData()
  }

  beforeJoinRoomResolve() {
    this.setupStats(),
      (this.eventsController = new EventsController(this)),
      this.eventsController.bindEvents(),
      (this.panorama = new Panorama(this)),
      this.beforeJoinRoomResolveHook();
  }
  afterJoinRoom() {
    (this.joined = !0),
      this.viewMode === "observer" && this.setViewModeToObserver(),
      logger.infoAndReportMeasurement({
        tag: this.viewMode,
        value: this.firstFrameTimestamp || Date.now() - this._startTime,
        type: "joinRoom",
        options: {
          immediate: !0,
        },
      }),
      (this.camera.initialFov =
        this.sceneManager.cameraComponent.getCameraFov()),
      this.stats.on("stats", ({ stats: e }) => {
        reporter.report("stats", oe({}, e));
      }),
      (this.debug = new Debug(this)),
      this.afterJoinRoomHook();
    setInterval(() => {
      this.actionsHandler
        .getNewUserState(NewUserStateType.NUST_Undefined)
        .then((i) => {
          this.avatarManager.handleAvatar(i);
        })
        .catch(() => { });
    }, 2e3);
  }
  afterReconnected() {
    this.avatarManager.clearOtherUsers(), this.afterReconnectedHook();
  }
  leave() {
    return logger.info("Invoke room.leave"),
      this.eventsController == null || this.eventsController.clearEvents(),
      this.networkController == null || this.networkController.quit(),
      this
  }

  validateOptions(e) {
    const { canvas, avatarId, skinId, userId, role, roomId, token, appId, avatarComponents } = e || {}
    const h = [];
    canvas instanceof HTMLCanvasElement || h.push(new ParamError("`canvas` must be instanceof of HTMLCanvasElement"));
    (!userId || typeof userId != "string") && h.push(new ParamError("`userId` must be string"));
    (!token || typeof token != "string") && h.push(new ParamError("`token` must be string"));
    (!appId || typeof appId != "string") && h.push(new ParamError("`appId` must be string"));
    role == "audience" || (!avatarId || !skinId) && h.push(new ParamError("`avatarId` and `skinId` is required when create room"));
    return h[0]
  }

  async initNetwork() {
    if (this.viewMode === "serverless") return Promise.resolve();
    const e = Date.now();
    try {
      await this.networkController
        .connect()
        ._timeout(8e4, new InitNetworkTimeoutError()),
        logger.infoAndReportMeasurement({
          type: "networkInitAt",
          group: "joinRoom",
        }),
        logger.infoAndReportMeasurement({
          type: "networkInitCost",
          group: "joinRoom",
        });
    } catch (t) {
      throw (
        (logger.infoAndReportMeasurement({
          type: "networkInitAt",
          group: "joinRoom",
          error: t,
        }),
          t)
      );
    }
  }
  async initConfig() {
    const e = Date.now();
    try {
      await this.modelManager
        .getApplicationConfig()
        ._timeout(8e3, new InitConfigTimeoutError()),
        logger.infoAndReportMeasurement({
          type: "configInitAt",
          group: "joinRoom",
        }),
        logger.infoAndReportMeasurement({
          type: "configInitCost",
          group: "joinRoom",
        });
    } catch (t) {
      throw (
        (logger.infoAndReportMeasurement({
          type: "configInitAt",
          group: "joinRoom",
          error: t,
        }),
          t)
      );
    }
  }
  async initEngine(e) {
    const t = Date.now();
    try {
      (this.engineProxy = new EngineProxy(this)),
        await this.engineProxy.initEngine(e),
        logger.infoAndReportMeasurement({
          type: "webglInitAt",
          group: "joinRoom",
        }),
        logger.infoAndReportMeasurement({
          type: "webglInitCost",
          group: "joinRoom",
        });
      return;
    } catch (r) {
      console.error(r)
      let n = r;
      return (
        r.code !== Codes.InitEngineTimeout && (n = new InitEngineError()),
        logger.error(r),
        logger.infoAndReportMeasurement({
          type: "webglInitAt",
          group: "joinRoom",
          error: n,
        }),
        Promise.reject(n)
      );
    }
  }
  async initWasm() {
    if (this.viewMode === "serverless") return Promise.resolve();
    const i = Date.now();
    try {
      await this.networkController.rtcp.workers
        .init({
          width: 1920,
          height: 1080,
          userID: this.userId,
          pageSession: this.options.pageSession,
          serverSession: "",
        })
        ._timeout(8e3, new InitDecoderTimeoutError()),
        this.networkController.rtcp.workers.registerFunction("error", (o) => {
          logger.error("decode error", o);
          const { code: s, message: c } = o;
          this.emit("error", {
            code: s,
            msg: c,
          });
        }),
        logger.infoAndReportMeasurement({
          type: "wasmInitAt",
          group: "joinRoom"
        }),
        logger.infoAndReportMeasurement({
          type: "wasmInitCost",
          group: "joinRoom"
        }),
        eventsManager.on("traceId", (o) => {
          this.networkController.rtcp.workers.onTraceId(o);
        });
    } catch (o) {
      throw (
        (logger.infoAndReportMeasurement({
          type: "wasmInitAt",
          group: "joinRoom",
          error: o,
        }),
          o)
      );
    }
  }
  async requestCreateRoom({ skinId: e }) {
    let skin;
    if (e) {
      skin = await this.getSkin(e);
      this.updateCurrentState({
        skin: skin,
      });
      const r = await this.modelManager.findRoute(e, this.options.pathName);
      this.updateCurrentNetworkOptions({
        areaName: r.areaName,
        attitude: r.attitude,
        versionId: skin.versionId,
      });
      const { camera: n, player: player } =
        util.getRandomItem(r.birthPointList) || this.options;
      this.options.camera ||
        this.updateCurrentNetworkOptions({
          camera: n,
        }),
        this.options.player ||
        this.updateCurrentNetworkOptions({
          player: player,
        });
    }
    if (this.viewMode === "serverless") return skin;
    try {
      await this.beforeStartGameHook(this.options);
      const {
        room_id: room_id,
        data: n,
        session_id: session_id,
      } = await this.networkController.startGame();
      this._id = room_id;
      const a = JSON.parse(n);
      (this.isHost = a.IsHost), (e = a.SkinID || e);
      const skin = await this.getSkin(e);
      this.updateCurrentNetworkOptions({
        roomId: room_id,
        sessionId: session_id,
      });
      reporter.updateBody({
        roomId: room_id,
        skinId: e,
        serverSession: session_id,
      });
      return skin;
    } catch (r) {
      logger.error("requestCreateRoom error:", r);
      return Promise.reject(r);
    }
  }
  pause() {
    return this.engineProxy.pause();
  }
  resume() {
    return this.engineProxy.resume();
  }
  reconnect() {
    this.networkController.reconnect();
  }
  async setViewMode(e) { }
  handleRepetLogin() {
    logger.warn("receive " + Codes.RepeatLogin + " for repeat login"),
      this.emit("repeatLogin"),
      reporter.disable(),
      this.networkController.quit();
  }
  setPictureQualityLevel(e) {
    const t = {
      high: EImageQuality.high,
      low: EImageQuality.low,
      average: EImageQuality.mid,
    };
    return (
      this.updateCurrentState({
        pictureQualityLevel: e,
      }),
      this.sceneManager.setImageQuality(t[e])
    );
  }
  async getSkin(skinId) {
    let t = (this.skinList = await this.modelManager.getSkinsList()).find(
      (skin) => skin.id === skinId || skin.id === skinId
    );
    if (t) return t;
    {
      const n = `skin is invalid: skinId: ${skinId}`;
      return Promise.reject(new ParamError(n));
    }
  }
  setupStats() {
    this.stats.assign({
      roomId: this.id,
      userId: this.userId,
    }),
      setInterval(this.engineProxy.updateStats, 1e3);
  }
  proxyEvents(e, t) {
    this.emit(e, t);
  }
  setCurrentNetworkOptions(e) {
    this._currentNetworkOptions = e;
  }
  updateCurrentNetworkOptions(e) {
    Object.assign(this._currentNetworkOptions, e),
      Object.assign(this.options, e);
  }
  setCurrentState(e) {
    this._currentState = e;
  }
  updateCurrentState(e) {
    e.skinId &&
      ((this.lastSkinId = this.currentState.skinId),
        this.updateCurrentNetworkOptions({
          skinId: e.skinId,
        })),
      e.versionId &&
      this.updateCurrentNetworkOptions({
        versionId: e.versionId,
      }),
      Object.assign(this._currentState, e);
  }

  afterSetUrlHook() { }
  afterTvStopedHook() { }
  afterTvPlayedHook() { }
  pageShowHandler() {
    this.engineProxy.setEnv(this.skin), (this.allowRender = !0);
  }
  pageHideHandler() {
    this.allowRender = !1;
  }
}
