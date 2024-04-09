export default class Queue {
    constructor() {
        E(this, "queue", []);
        E(this, "currentAction")
    }
    async append(e) {
        var t, r;
        this.queue.length === 0 || ((t = this.currentAction) == null ? void 0 : t.type) === e.type && this.queue.length === 1 ? (this.queue = [],
        this.queue.push(e),
        await this.go()) : (((r = this.queue[this.queue.length - 1]) == null ? void 0 : r.type) === e.type && this.queue.pop(),
        this.queue.push(e))
    }
    async go() {
        if (this.queue.length !== 0) {
            const e = this.queue[0];
            this.currentAction = e,
            await e.action(),
            this.currentAction = void 0,
            this.queue.splice(0, 1),
            await this.go()
        }
    }
    async reject() {
        this.queue = []
    }
}