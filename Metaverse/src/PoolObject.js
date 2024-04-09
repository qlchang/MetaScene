export default class PoolObject {
    constructor(e, t, r, n=!0) {
        E(this, "data");
        E(this, "nextFree");
        E(this, "previousFree");
        E(this, "free");
        this.data = e,
        this.nextFree = t,
        this.previousFree = r,
        this.free = n
    }
    dispose() {
        this.data && this.data instanceof BABYLON.Mesh && this.data.dispose(!0, !0),
        this.previousFree = null,
        this.nextFree = null,
        this.data = null
    }
}