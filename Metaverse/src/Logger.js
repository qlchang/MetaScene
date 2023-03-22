import Codes from "./enum/Codes.js"
import {reporter} from "./Reporter.js"
import util from "./util.js"

export default class Logger{
    constructor(e) {
        this.level = 3
        this.module = e
    }
    static setLevel(e) {
        this.level = e
    }
    setLevel(e) {
        this.level = e
    }
    atleast(e) {
        return e >= this.level && e >= this.level
    }
    print(e, t, ...r) {
        if (this.atleast(t)) {
            const n = e == "debug" ? "info" : e
              , o = this.prefix(e);
            console[n].call(null, o, ...r)
        }
        if (e !== "debug" && e !== "info") {
            const n = r.map(o=>{
                if (o instanceof Object)
                    try {
                        return JSON.stringify(o)
                    } catch {
                        return o
                    }
                else
                    return o
            }
            ).join(",");
            reporter.report("log", {
                message: n,
                level: e,
                module: this.module
            })
        }
    }
    debug(...e) {
        //return this.print("debug", 1, ...e)
    }
    info(...e) {
        //return this.print("info", 2, ...e)
    }
    infoAndReportLog(e, ...t) {
        const {reportOptions: r} = e;
        delete e.reportOptions,
        reporter.report("log", e, r),
        t.length || (t = [e.message]),
        this.debug(...t)
    }
    infoAndReportMeasurement(e, ...t) {
        // var n;
        // const {reportOptions: r} = e;
        // if (e.startTime) {
        //     const o = Date.now();
        //     e.value === void 0 && (e.endTime = o),
        //     e.value === void 0 && (e.value = o - e.startTime)
        // }
        // if (e.error ? e.code = ((n = e.error) == null ? void 0 : n.code) || Codes.Internal : e.code = Codes.Success,
        // reporter.report("measurement", e, r),
        // t.length || (t = [e]),
        // e.level === 4 || e.error) {
        //     this.error(...t);
        //     return
        // }
        // this.warn(...t)
    }
    warn(...e) {
        //return this.print("warn", 3, ...e)
    }
    error(...e) {
        //return this.print("error", 4, ...e)
    }
    // console前缀
    prefix(e) {
        return `[${this.module}] [${util.getFormattedDate(new Date)}]`
    }
};