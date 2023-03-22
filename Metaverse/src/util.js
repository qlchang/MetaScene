
import Codes from "./enum/Codes.js"
import CodeErrorMap from "./error/CodeErrorMap.js"
import InternalError from "./error/InternalError.js"

var util = {
    uuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, i=>{
            const e = Math.random() * 16 | 0;
            return (i === "x" ? e : e & 3 | 8).toString(16)
        }
        )
    },
    getFormattedDate(i) {
        const e = i.getMonth() + 1
          , t = i.getDate()
          , r = i.getHours()
          , n = i.getMinutes()
          , o = i.getSeconds()
          , a = i.getMilliseconds()
          , s = (e < 10 ? "0" : "") + e
          , l = (t < 10 ? "0" : "") + t
          , u = (r < 10 ? "0" : "") + r
          , c = (n < 10 ? "0" : "") + n
          , h = (o < 10 ? "0" : "") + o;
        return i.getFullYear() + "-" + s + "-" + l + " " + u + ":" + c + ":" + h + "." + a
    },
    createInstance(i) {
        var e = new Axios(i)
          , t = bind(Axios.prototype.request, e);
        return utils.extend(t, Axios.prototype, e),
        utils.extend(t, e),
        t.create = function(n) {
            return createInstance(mergeConfig(i, n))
        }
        ,
        t
    },
    mapLimit(i, e, t) {
        return new Promise((r,n)=>{
            const o = i.length;
            let a = e - 1
              , s = 0;
            const l = u=>{
                u.forEach(c=>{
                    t(c).then(()=>{
                        if (s++,
                        s === o) {
                            r();
                            return
                        }
                        a++;
                        const h = i[a];
                        h && l([h])
                    }
                    , h=>{
                        n(h)
                    }
                    )
                }
                )
            }
            ;
            l(i.slice(0, e))
        }
        )
    },
    isWebAssemblySupported(){
        try {
            if (typeof WebAssembly == "object" && typeof WebAssembly.instantiate == "function") {
                const i = new WebAssembly.Module(Uint8Array.of(0, 97, 115, 109, 1, 0, 0, 0));
                if (i instanceof WebAssembly.Module)
                    return new WebAssembly.Instance(i)instanceof WebAssembly.Instance
            }
        } catch {}
        return console.log("wasm is not supported"),
        !1
    },
    isSupported() {
        return typeof RTCPeerConnection == "function" && this.isWebAssemblySupported()
    },
    objectParseFloat(i){
        const e = {};
        return i && Object.keys(i).forEach(t=>{
            e[t] = parseFloat(i[t])
        }
        ),
        e
    },
    getRandomItem(i){
        if(i.length === 0){
            return null
        }
        else{
            return i[Math.floor(Math.random() * i.length)]
        }
        //i.length === 0 ? null : i[Math.floor(Math.random() * i.length)]
    },
    getErrorByCode(i) {
        if (i === Codes.Success)
            return InternalError;
        const e = CodeErrorMap[i];
        return e || console.warn("unkown code", i),
        e || InternalError
    },
    getDistance(i, e) {
        const {x: t, y: r, z: n} = i
          , {x: o, y: a, z: s} = e;
        return Math.sqrt(Math.abs(t - o) ** 2 + Math.abs(r - a) ** 2 + Math.abs(n - s) ** 2)
    }
}
export default util
