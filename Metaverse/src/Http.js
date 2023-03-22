import Xverse from "./Xverse.js"
import {modelTable} from "./ModelTable.js"
import Logger from "./Logger.js"

const logger = new Logger('Http')
const isIndexedDbSupported = ()=>(window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB) !== void 0
const dataURItoBlob = i=>{
    let e;
    i.split(",")[0].indexOf("base64") >= 0 ? e = atob(i.split(",")[1]) : e = unescape(i.split(",")[1]);
    const t = i.split(",")[0].split(":")[1].split(";")[0]
      , r = new Uint8Array(e.length);
    for (let o = 0; o < e.length; o++)
        r[o] = e.charCodeAt(o);
    return new Blob([r],{
        type: t
    })
}

export default class Http extends EventEmitter {
    async get({url: e, useIndexedDb: t=!1, timeout: r=15e3, key: n, isOutPutObjectURL: o=!0}) {
        if (Xverse.NO_CACHE !== void 0 && (t = !Xverse.NO_CACHE),
        t)
            if (isIndexedDbSupported()) {
                window.performance.now();
                let a = null;
                try {
                    a = await modelTable.query("url", e)
                } catch (s) {
                    return logger.debug(s),
                    logger.warn("cache query error", e),
                    Promise.resolve(e)
                }
                if (a && a.model) {
                    const s = dataURItoBlob(a.model)
                      , l = Promise.resolve(o ? URL.createObjectURL(s) : s);
                    return window.performance.now(),
                    l
                } else
                    return this.request({
                        url: e,
                        timeout: r,
                        contentType: "blob",
                        key: n
                    }).then(async s=>{
                        const l = await blobToDataURI(s.response);
                        try {
                            await modelTable.put({
                                url: e,
                                model: l
                            })
                        } catch (u) {
                            logger.warn("unable to add data to indexedDB", u)
                        }
                        return Promise.resolve(o ? URL.createObjectURL(s.response) : s.response)
                    }
                    )
            } else
                return this.request({
                    url: e,
                    timeout: r,
                    contentType: "blob",
                    key: n
                }).then(a=>{
                    const s = a.response;
                    return Promise.resolve(o ? URL.createObjectURL(s) : s)
                }
                ).catch(a=>Promise.reject(a));
        else
            return this.request({
                url: e,
                timeout: r,
                key: n
            }).then(a=>a.getResponseHeader("content-type") === "application/json" ? Promise.resolve(JSON.parse(a.responseText)) : Promise.resolve(a.responseText))
    }
    request(e) {
        const {timeout: t=3e4, contentType: r, key: n, onRequestStart: o} = e
          , {url: a} = e;
        return new Promise((s,l)=>{
            window.performance.now();
            const u = new XMLHttpRequest;
            r && (u.responseType = r),
            u.timeout = t,
            u.addEventListener("readystatechange", ()=>{
                if (u.readyState == 4) {
                    if (u.status == 200)
                        return window.performance.now(),
                        this.emit("loadend", {
                            message: `request ${a} load success`
                        }),
                        s(u);
                    {
                        const c = `Unable to load the request ${a}`;
                        return this.emit("error", {
                            message: c
                        }),
                        logger.error(c),
                        l(c)
                    }
                }
            }
            ),
            o && o(u),
            u.open("GET", a),
            u.send()
        }
        )
    }
}

// const http = new Http();
// export { http };

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