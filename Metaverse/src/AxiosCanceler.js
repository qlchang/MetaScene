export default class AxiosCanceler {
    constructor() {
        this.pendingMap = new Map
    }
    addPending(e) {
        return new axios.CancelToken(t=>{
            this.pendingMap.has(e) || this.pendingMap.set(e, t)
        }
        )
    }
    removeAllPending() {
        this.pendingMap.forEach(e=>{
            e && isFunction(e) && e()
        }
        ),
        this.pendingMap.clear()
    }
    removePending(e) {
        if (this.pendingMap.has(e)) {
            const t = this.pendingMap.get(e);
            t && t(e),
            this.pendingMap.delete(e)
        }
    }
    removeCancelToken(e) {
        this.pendingMap.has(e) && this.pendingMap.delete(e)
    }
    reset() {
        this.pendingMap = new Map
    }
}