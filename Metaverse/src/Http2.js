import {modelTable} from "./ModelTable.js"
import Logger from "./Logger.js"

const logger = new Logger('Http')
class Http2 extends EventEmitter {
    async get({url: e, useIndexedDb: t=!1, timeout: r=1e4, key: n}) {
        if (t)
            if (isIndexedDbSupported$1()) {
                const o = window.performance.now();
                let a = null;
                try {
                    a = await modelTable.models.where("name").equals(e).first()
                } catch {
                    return logger.warn("unable to query data from indexedDB"),
                    Promise.resolve(e)
                }
                const s = window.performance.now();
                logger.debug(`search ${e} takes:${s - o}ms`);
                const l = `${a && a.model ? "found" : "notFound"} data by search ${e} `;
                if (logger.debug(l),
                reporter$1.report("measurement", {
                    type: "indexedDB",
                    value: s - o,
                    extra: l
                }),
                a && a.model) {
                    const u = dataURItoBlob$1(a.model);
                    return Promise.resolve(URL.createObjectURL(u))
                } else
                    return this.request({
                        url: e,
                        timeout: r,
                        contentType: "blob",
                        key: n
                    }).then(async u=>{
                        const c = await blobToDataURI$2(u.response);
                        try {
                            modelTable.models.add({
                                name: e,
                                model: c
                            })
                        } catch {
                            logger.warn("unable to add data to indexedDB")
                        }
                        return Promise.resolve(URL.createObjectURL(u.response))
                    }
                    ).catch(u=>Promise.reject(u))
            } else
                return this.request({
                    url: e,
                    timeout: r,
                    contentType: "blob",
                    key: n
                }).then(o=>{
                    const a = o.response;
                    return Promise.resolve(URL.createObjectURL(a))
                }
                ).catch(o=>Promise.reject(o));
        else
            return this.request({
                url: e,
                timeout: 5e3,
                key: n
            }).then(o=>o.getResponseHeader("content-type") === "application/json" ? Promise.resolve(JSON.parse(o.responseText)) : Promise.resolve(o.responseText)).catch(o=>{
                Promise.reject(o)
            }
            )
    }
    request({url: e, timeout: t=15e3, contentType: r, key: n}) {
        return new Promise((o,a)=>{
            const s = window.performance.now()
              , l = new XMLHttpRequest;
            r && (l.responseType = r),
            l.timeout = t,
            l.addEventListener("readystatechange", ()=>{
                if (l.readyState == 4)
                    if (l.status == 200) {
                        const u = window.performance.now();
                        return logger.debug(`download ${e} takes:${u - s}ms`),
                        reporter$1.report("measurement", {
                            type: "http",
                            value: u - s,
                            extra: e
                        }),
                        this.emit("loadend", {
                            message: `request ${e} load success`
                        }),
                        o(l)
                    } else {
                        const u = `Unable to load the request ${e}`;
                        return this.emit("error", {
                            message: u
                        }),
                        logger.error(u),
                        a(u)
                    }
            }
            ),
            l.open("GET", e),
            l.send()
        }
        )
    }
}

const http2 = new Http2();
export { http2 };

// const http = new Http
//   , isIndexedDbSupported = ()=>(window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB) !== void 0
//   , blobToDataURI = async i=>new Promise((e,t)=>{
//     const r = new FileReader;
//     r.readAsDataURL(i),
//     r.onload = function(n) {
//         var o;
//         e((o = n.target) == null ? void 0 : o.result)
//     }
//     ,
//     r.onerror = function(n) {
//         t(n)
//     }
// }
// )
//   , dataURItoBlob = i=>{
//     let e;
//     i.split(",")[0].indexOf("base64") >= 0 ? e = atob(i.split(",")[1]) : e = unescape(i.split(",")[1]);
//     const t = i.split(",")[0].split(":")[1].split(";")[0]
//       , r = new Uint8Array(e.length);
//     for (let o = 0; o < e.length; o++)
//         r[o] = e.charCodeAt(o);
//     return new Blob([r],{
//         type: t
//     })
// }
//   , urlMap = new Map
//   , urlTransformer = async(i,e=!1)=>typeof i != "string" ? (console.warn("url transformer error", i),
// i) : i.startsWith("blob:") ? i : e ? http.get({
//     url: i,
//     useIndexedDb: !0,
//     key: "url",
//     isOutPutObjectURL: !1
// }) : urlMap.has(i) ? urlMap.get(i) : http.get({
//     url: i,
//     useIndexedDb: !0,
//     key: "url"
// }).then(t=>(urlMap.set(i, t),
// t));