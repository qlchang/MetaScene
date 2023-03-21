import Actions from "./enum/Actions.js"
import Codes from "./enum/Codes.js"
import util from "./util.js"
import Logger from "./Logger.js"
import ActionResponseTimeoutError from "./error/ActionResponseTimeoutError.js"

const logger = new Logger('EventsManager')
export default class EventsManager extends EventEmitter {
    constructor() {
        super(...arguments);
        this.events = new Map
        this.specialEvents = new Map
    }

    remove(traceId, code, signal, needDelete) 
    {
        if (this.specialEvents.has(traceId) && !needDelete && code === Codes.Success) return;

        this.events.get(traceId) && (
            this.emit(traceId, {code, data:signal}),
            this.events.delete(traceId),
            this.specialEvents.delete(traceId)
        )

        // todo 写死数据纠正
        // if (this.specialEvents.has(this.traceId) && !needDelete && code === Codes.Success) return;

        // this.events.get(this.traceId) && (
        //     this.emit(this.traceId, {code, data:signal}),
        //     this.events.delete(this.traceId),
        //     this.specialEvents.delete(this.traceId)
        // )
    }

    async track(e, t) 
    {
        const traceId = e.traceId;
        // this.traceId = traceId  // todo 写死数据纠正

        this.emitTraceIdToDecoder(e);

        const { sampleRate, noReport=!1, special } = t || {};
        if (sampleRate && Math.random() > sampleRate) return Promise.resolve();
        const s = Actions[e.event] + "Action"
        const tag = e.tag;

        // 暂存traceId
        this.events.set(traceId, !0),
        special && this.specialEvents.set(traceId, !0);
        
        const startTime = Date.now();
        let c = null;
        return new Promise((resolve, reject) => 
        {
            if (noReport)
                return this.off(traceId),
                    this.events.delete(traceId),
                    resolve(void 0);

            // 移除traceId。events.delete在emit之后执行
            this.on(traceId, ({ code, data, msg }) => 
            {
                if (code === Codes.Success)
                    resolve(data),
                    this.off(traceId),
                    logger.infoAndReportMeasurement({ type: s, traceId, tag, extraData: e.extra });
                else {
                    if (code === Codes.ActionMaybeDelay) return;
                    if (code === Codes.DoActionBlocked && e.event === Actions.Rotation) {
                        logger.debug(s + " response code: " + code);
                        return
                    }
                    const CodeError = util.getErrorByCode(code)
                      , error = new CodeError(msg);
                    this.off(traceId),
                    reject(error),
                    this.emit("actionResponseError", { error, event: e, tag }),
                    logger.infoAndReportMeasurement({ type: s, traceId, tag, error, extraData: e.extra })
                }
            });

            // 超时报错
            const time = e.timeout || 2e3;
            c = window.setTimeout(() => 
            {
                if (c && clearTimeout(c), !this.events.get(traceId)) return;

                const error = new ActionResponseTimeoutError(`${s} timeout in ${time}ms`);
                this.emit("actionResponseTimeout", { error, event: e, tag }),
                reject(error),
                this.events.delete(traceId),
                this.off(traceId),
                logger.infoAndReportMeasurement({ type: s, traceId, tag, error, extraData: e.extra })
            }, time)
        })
    }

    emitTraceIdToDecoder(e) {
        if (
            e.event === Actions.Rotation || 
            e.event === Actions.Clicking || 
            e.event === Actions.GetOnVehicle || 
            e.event === Actions.GetOffVehicle
        ) {
            const t = {
                [Actions.Rotation]: "Rotation",
                [Actions.GetOnVehicle]: "GetOnVehicle",
                [Actions.GetOffVehicle]: "GetOffVehicle",
                [Actions.Clicking]: "MoveTo"
            };
            this.emit("traceId", {
                traceId: e.traceId,
                timestamp: Date.now(),
                event: t[e.event]
            })
        }
    }
}

const eventsManager = new EventsManager();
export { eventsManager };