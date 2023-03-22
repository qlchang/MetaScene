import PoolObject from "./PoolObject.js"

export default class Pool {
    constructor(e, t, r, n, ...o) {
        this.lastFree = null
        this.nextFree = null
        this._pool = [],
        this.objCreator = e,
        this.objReseter = t;
        for (let a = 0; a < n; a++)
            this.addNewObject(this.newPoolObject(...o));
        this.capacity = r
    }
    addNewObject(e) {
        return this._pool.push(e),
        this.release(e),
        e
    }
    release(e) {
        e.free = !0,
        e.nextFree = null,
        e.previousFree = this.lastFree,
        this.lastFree ? this.lastFree.nextFree = e : this.nextFree = e,
        this.lastFree = e,
        this.objReseter(e)
    }
    getFree(...e) {
        const t = this.nextFree ? this.nextFree : this.addNewObject(this.newPoolObject(...e));
        return t.free = !1,
        this.nextFree = t.nextFree,
        this.nextFree || (this.lastFree = null),
        t
    }
    newPoolObject(...e) {
        const t = this.objCreator(...e);
        return new PoolObject(t,this.nextFree,this.lastFree)
    }
    releaseAll() {
        this._pool.forEach(e=>this.release(e))
    }
    clean(e=0, ...t) {
        let r = this.nextFree;
        if (!r)
            return;
        let n = 0;
        for (; r; )
            n += 1,
            r = r.nextFree;
        let o = !1;
        if (n > e && this._pool.length > this.capacity && (o = !0),
        o)
            for (r = this.nextFree; r; ) {
                r.free = !1,
                this.nextFree = r.nextFree;
                const a = this._pool.indexOf(r);
                this._pool.splice(a, 1),
                this.nextFree || (this.lastFree = null),
                r == null || r.dispose(),
                r = this.nextFree
            }
    }
}