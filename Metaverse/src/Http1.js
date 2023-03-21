import AxiosCanceler from "./AxiosCanceler"

import Logger from "./Logger.js"

const logger = new Logger('Http')
class Http1 extends EventEmitter {
    constructor() {
        super()
        this.instatnce = axios.create();
        this.canceler = new AxiosCanceler;
    }

    requestConstant(){
        return {
            x_nounce: this.randomString(),
            x_timestamp: new Date().getTime(),
            x_os: "web"
        }
    }

    requestParams(e){
        return oe({}, e.params)
    }

    get(e) {
        return this.request(le(oe({}, e), {
            method: "GET"
        }))
    }
    post(e) {
        return this.request(le(oe({}, e), {
            method: "POST"
        }))
    }
    request(e) {
        const {url: t, timeout: r=1e4, method: n, key: o, beforeRequest: a, responseType: s, data: l} = e;
        let {retry: u=0} = e;
        const c = this.patchUrl(t)
          , h = this.canceler.addPending(t);
        a && isFunction(a) && a(e);
        const f = this.requestParams(e);
        let d = {
            url: c,
            method: n,
            timeout: r,
            cancelToken: h,
            responseType: s,
            params: f
        };
        n === "POST" && (d = oe({
            data: l
        }, d));
        const _ = Date.now()
          , g = ()=>this.instatnce.request(d).then(m=>(o && logger.infoAndReportMeasurement({
            type: "http",
            extraData: t,
            group: "http",
            tag: o
        }),
        this.canceler.removeCancelToken(t),
        m)).catch(m=>{
            const v = axios.isCancel(m);
            return u > 0 && !v ? (u--,
            logger.warn(`request ${t} retry, left retry count`, u),
            g()) : (logger.infoAndReportMeasurement({
                type: "http",
                error: m,
                extraData: {
                    url: t,
                    isCanceled: v
                },
                tag: o,
                group: "http"
            }),
            this.canceler.removeCancelToken(t),
            Promise.reject(m))
        }
        );
        return g()
    }
    patchUrl(e) {
        return e
    }
    randomString() {
        let e = "";
        const t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
          , r = t.length;
        for (let n = 0; n < 8; n++)
            e += t.charAt(Math.floor(Math.random() * r));
        return e
    }
}

const http1 = new Http1();
export { http1 };