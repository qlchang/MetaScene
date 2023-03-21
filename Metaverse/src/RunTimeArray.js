export default class RunTimeArray {
    constructor() {
        E(this, "circularData");
        this.circularData = []
    }
    add(e) {
        this.circularData.length > 1e3 && this.circularData.shift(),
        this.circularData.push(e)
    }
    getAvg() {
        let e = 0;
        for (let t = 0; t < this.circularData.length; t++)
            e += this.circularData[t];
        return {
            sum: e,
            avg: e / this.circularData.length || 0
        }
    }
    getMax() {
        let e = 0;
        for (let t = 0; t < this.circularData.length; t++)
            e < this.circularData[t] && (e = this.circularData[t]);
        return e || 0
    }
    clear() {
        this.circularData = []
    }
    getStat() {
        const e = this.getAvg()
          , t = {
            sum: e.sum,
            avg: e.avg,
            max: this.getMax()
        };
        return this.clear(),
        t
    }
}