import util from "./util.js"
import {reporter} from "./Reporter.js"
import ModelManager from "./ModelManager.js"
import XverseRoom from "./XverseRoom.js"
import Preload from "./Preload.js"
import RenderType from "./enum/RenderType.js"
import Person from "./enum/Person.js"
import LoggerLevels from "./enum/LoggerLevels.js"
import Logger from "./Logger.js"

const logger = new Logger('4DMVS')
export default class Xverse{
    constructor(e) {
        e || (e = {});
        const {onLog: t, env: r, appId: n, releaseId: o, subPackageVersion: a} = e;
        this.NO_CACHE = !1,
        this.env = r || "PROD",
        this.SUB_PACKAGE_VERSION = a,
        this.debug && logger.setLevel(LoggerLevels.Debug);
        const s = this.pageSession = util.uuid();
        
        reporter.updateHeader({
            pageSession: s
        })

        // reporter.updateReportUrl(REPORT_URL[this.env])

        a && reporter.updateBody({
            sdkVersion: a
        })

        logger.infoAndReportMeasurement({
            type: "sdkInit",
            extraData: {
                version: a,
                enviroment: r,
                pageSession: s
            }
        })

        logger.debug("debug mode:", this.debug)

        reporter.on("report", l=>{
            t && t(l)
        })

        if (n) {
            this.appId = n,
            this.releaseId = o;
            const l = ModelManager.getInstance(n, o);
            this.preload = new Preload(l)
        }
    }
    get isSupported() {
        return isSupported()
    }
    disableLogUpload() {
        reporter.disable(),
        logger.debug("logger upload has been disabled")
    }
    async getSkinList() {
        return []
    }
    async getAvatarList() {
        return []
    }
    async getGiftList() {
        return [{
            id: "hack "
        }]
    }

    async joinRoom(e) {
        const t = e.pathName || "thirdwalk"
          , r = e.rotationRenderType || RenderType.RotationVideo
          , n = e.person || Person.Third
          , o = new XverseRoom(le(oe({}, e), {
            appId: e.appId || this.appId,
            releaseId: e.releaseId || this.releaseId,
            pageSession: this.pageSession,
            isAllSync: !0,
            rotationRenderType: r,
            syncByEvent: !0,
            pathName: t,
            person: n,
            role: e.role || "audience"
        }));
        return o.initRoom().then(()=>o)
    }
};