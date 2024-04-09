import {reporter} from "./Reporter.js"
import {modelTable} from "./ModelTable.js"
import util from "./util.js"
import {http1} from "./Http1.js"
import InternalError from "./error/InternalError.js"
import axios from "axios";
import Logger from "./Logger.js"
import PreloadCanceledError from "./error/PreloadCanceledError.js"
import ParamError from "./error/ParamError.js"

const logger = new Logger('preload')
export default class Preload {
    constructor(e) {
        this.config = null
        this.allKeys = []
        this.oldResourcesDeleted = !1;
        this.requests = {
            simple: {
                stopped: !0,
                requests: {}
            },
            observer: {
                stopped: !0,
                requests: {}
            },
            full: {
                stopped: !0,
                requests: {}
            }
        };
        this.modelManager = e,
        this.init(e.appId)
    }
    init(e) {
        reporter.updateBody({
            appId: e
        })
    }
    static getTimeoutBySize(e) {
        return e ? e < 500 * 1e3 ? 30 * 1e3 : e < 1e3 * 1e3 ? 60 * 1e3 : 100 * 1e3 : 100 * 1e3
    }
    async getConfig(e) {
        if (this.config)
            return this.config;
        const {preload: t} = await this.modelManager.requestConfig();
        return t ? (this.config = t,
        Promise.resolve(t)) : Promise.reject("no preload config")
    }
    async getAllKeys() {
        if (this.allKeys.length)
            return this.allKeys;
        try {
            const e = await modelTable.getAllKeys();
            this.allKeys = e;
            return e
        } catch {
            const t = "preload getAllKeys error";
            return logger.error(t),
            Promise.reject(t)
        }
    }
    stop(e) {
        e === "serverless" && (e = "observer"),
        this.requests[e].stopped = !0;
        const t = this.requests[e].requests;
        Object.keys(t).forEach(r=>{
            http1.canceler.removePending(r),
            delete t[r]
        }
        )
    }
    clearPreload(e) {
        this.requests[e].stopped = !1,
        this.allKeys = []
    }
    async start(e, t, r) {
        let n = Date.now()
          , o = 0;
        try {
            if (e === "serverless" && (e = "observer"),
            !this.requests[e])
                return Promise.reject(new ParamError("invalid stage name: " + e));
            this.clearPreload(e);
            const a = await this.getConfig(e);
            const s = await this.getAllKeys();
            try {
                await this.deleteOldResources(a.assetUrls.map(d=>d.url), s)
            } catch (d) {
                logger.error(d)
            }
            const {baseUrls: l, assetUrls: u, observeUrls: c} = a;
            let h;
            switch (e) {
            case "simple":
                h = l;
                break;
            case "observer":
                h = u;
                break;
            case "full":
                h = u;
                break;
            default:
                h = u
            }
            let f = h.filter(d=>!s.includes(d.url));
            r && isFunction(r) && (f = f.filter(r));
            o = f.length;
            logger.debug("keysNeedToPreload", f);
            f.length || t && t(h.length, h.length);
            n = Date.now();
            await this._preload(e, f, t);
            logger.infoAndReportMeasurement({
                tag: e,
                type: "assetsPreload",
                extraData: {
                    total: o
                }
            });
            return
        } catch (a) {
            let s = a;
            return (this.requests[e].stopped || axios.isCancel(a)) && (s = new PreloadCanceledError),
            logger.infoAndReportMeasurement({
                tag: e,
                type: "assetsPreload",
                error: s,
                options: {
                    immediate: !0
                },
                extraData: {
                    total: o
                }
            }),
            Promise.reject(s)
        }
    }
    deleteOldResources(e, t) {
        if (!this.oldResourcesDeleted)
            this.oldResourcesDeleted = !0;
        else
            return Promise.resolve();
        const r = t.filter(n=>!e.includes(n));
        return logger.debug("keysNeedToDelete", r),
        logger.warn("keysNeedToDelete", r.length),
        Promise.all(r.map(n=>modelTable.delete(n)))
    }
    async _preload(e, t, r) {
        const n = t.length;
        if (!n)
            return Promise.resolve();
        let o = 0;
        const a = window.setInterval(()=>{
            r && r(o, n),
            o >= n && window.clearInterval(a)
        }
        , 1e3);
        return util.mapLimit(t, 10, async s=>{
            const {size: l, url: u} = s;
            return this.requests[e].stopped ? Promise.reject(new PreloadCanceledError) : http1.get({
                url: u,
                timeout: Preload.getTimeoutBySize(l),
                responseType: "blob",
                retry: 2,
                beforeRequest: ()=>{
                    this.requests[e].requests[u] = !0
                }
            }).then(async c=>{
                const h = c.data;
                if (!(h instanceof Blob))
                    return logger.error("request blob failed, type:", typeof h, u),
                    Promise.reject("request blob failed " + u);
                const f = await blobToDataURI(h);
                try {
                    await modelTable.put({
                        url: u,
                        model: f
                    });
                    return
                } catch (d) {
                    return logger.error("unable to add data to indexedDB", d),
                    Promise.reject(new InternalError("preload db error"))
                }
            }
            ).then(()=>{
                o++,
                delete this.requests[e].requests[u]
            }
            , c=>(delete this.requests[e].requests[u],
            window.clearInterval(a),
            Promise.reject(c)))
        }
        )
    }
}