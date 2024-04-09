export default class Timeout {
    constructor(e, t, r=!0) {
        this._timeout = null
        this._fn = e,
        this._delay = t,
        r && this.start()
    }
    get delay() {
        return this._delay
    }
    get isSet() {
        return !!this._timeout
    }
    setDelay(e) {
        this._delay = e
    }
    start() {
        this.isSet || (this._timeout = window.setTimeout(()=>{
            const e = this._fn;
            this.clear(),
            e()
        }
        , this._delay))
    }
    clear() {
        window.clearTimeout(this._timeout),
        this._timeout = void 0
    }
    reset() {
        this.clear(),
        this.start()
    }
}