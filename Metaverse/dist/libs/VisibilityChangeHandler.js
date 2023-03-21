function VisibilityChangeHandler() {
    this.subscribers = [],
    this.bindFunc = void 0,
    this.id = 1,
    this.addListener()
}
VisibilityChangeHandler.prototype = {
    subscribe(i) {
        if (!i)
            return;
        const e = ++this.id
          , t = {
            id: e,
            handler: i
        };
        return this.subscribers.push(t),
        ()=>{
            this.subscribers = this.subscribers.filter(n=>n.id == e)
        }
    },
    destroy() {
        !this.bindFunc || (document.hidden !== void 0 ? document.removeEventListener("visibilitychange", this.bindFunc, !1) : document.webkitHidden && document.removeEventListener("webkitvisibilitychange", this.bindFunc, !1))
    },
    broadcast(i) {
        this.subscribers.forEach(e=>e.handler(i))
    },
    addListener() {
        document.hidden !== void 0 ? (this.bindFunc = ()=>this.broadcast(document.hidden),
        document.addEventListener("visibilitychange", this.bindFunc, !1)) : document.webkitHidden && (this.bindFunc = ()=>this.broadcast(document.webkitHidden),
        document.addEventListener("webkitvisibilitychange", this.bindFunc, !1))
    }
};