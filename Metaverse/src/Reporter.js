import util from "./util.js"
export default class Reporter extends EventEmitter {
    constructor() {
        super();
        this._header= {}
        this._body= {}
        this._queue= []
        this._disabled= !1
        this._interval= null
        this._reportUrl= null
        this.isDocumentLoaded =()=>document.readyState === "complete";
        this._header.logModuleId = REPORT_MODULE_TYPE,
        this._header.url = location.href,
        this._header.enviroment = ENV,
        this._header.networkType = window.navigator.connection ? window.navigator.connection.type : "unknown",
        this._interval = window.setInterval(()=>{
            this._flushReport()
        }
        , 10 * 1e3)
    }
    
    disable() {
        this._disabled = !0,
        this._interval && window.clearInterval(this._interval)
    }
    updateHeader(e) {
        Object.assign(this._header, e)
    }
    updateBody(e) {
        Object.assign(this._body, e)
    }
    updateReportUrl(e) {
        this._reportUrl = e
    }
    report(e, t, r) {
        if (this._disabled)
            return;
        r || (r = {});
        const {immediate: n, sampleRate: o} = r;
        if (o && o > Math.random())
            return;
        this.updateBody({
            logTime: util.getFormattedDate(new Date),
            logTimestamp: Date.now()
        });
        const a = s=>{
            const l = oe(le(oe({}, this._body), {
                type: e
            }), s);
            this._queue.push(l),
            e === "measurement" && this.emit("report", s)
        }
        ;
        Array.isArray(t) ? t.forEach(s=>a(s)) : a(t),
        (n || this._queue.length >= REPORT_NUM_PER_REQUEST) && this._flushReport()
    }
    _flushReport() {
        if (this._disabled || !this._queue.length || !this.isDocumentLoaded())
            return;
        const e = {
            header: this._header,
            body: this._queue.splice(0, REPORT_NUM_PER_REQUEST)
        };
        this._post(e)
    }
    _post(e) {
        const t = this._reportUrl || REPORT_URL.DEV;
        // return new Promise((r,n)=>{
        //     const o = new XMLHttpRequest;
        //     o.open("POST", t),
        //     o.setRequestHeader("Content-Type", "application/json");
        //     try {
        //         o.send(JSON.stringify(e))
        //     } catch (a) {
        //         console.error(a)
        //     }
        //     o.addEventListener("readystatechange", ()=>{
        //         if (o.readyState == 4)
        //             return o.status == 200 ? r(o) : n("Unable to send log")
        //     }
        //     )
        // }
        // )
    }
}

const reporter = new Reporter();
export { reporter };
