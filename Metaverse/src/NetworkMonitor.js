export default class NetworkMonitor {
    constructor(e) {
        this._listener = e
    }
    get isOnline() {
        const e = window.navigator;
        return typeof e.onLine == "boolean" ? e.onLine : !0
    }
    start() {
        window.addEventListener("online", this._listener),
        window.addEventListener("offline", this._listener)
    }
    stop() {
        window.removeEventListener("online", this._listener),
        window.removeEventListener("offline", this._listener)
    }
}