const DEFAULT_LOGGER = {
    debug: console.log,
    info: console.log,
    warn: console.warn,
    error: console.error
}

export default class defaultLog{
    constructor(e) {
        E(this, "module");
        this.module = e
    }
    static setLogger(e) {
        defaultLog.instance = e
    }
    debug(...e) {
        return Logger1.instance.debug(...e)
    }
    info(...e) {
        return Logger1.instance.info(...e)
    }
    warn(...e) {
        return Logger1.instance.warn(...e)
    }
    error(...e) {
        return Logger1.instance.error(...e)
    }
};
E(defaultLog, "instance", DEFAULT_LOGGER);