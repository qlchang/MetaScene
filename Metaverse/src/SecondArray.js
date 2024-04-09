export default class SecondArray {
    constructor() {
        this.circularData = []
    }
    add(e) {
        this.circularData.push(e)
    }
    getAvg() {
        let e = 0;
        for (let i = 0; i < this.circularData.length; i++) e += this.circularData[i];
        return {
            sum: e,
            avg: e / this.circularData.length || 0
        }
    }
    getMax() {
        let e = 0;
        for (let i = 0; i < this.circularData.length; i++) e < this.circularData[i] && (e = this.circularData[i]);
        return e || 0
    }
    clear() {
        this.circularData = []
    }
    getStat() {
        const e = this.getAvg(),
            i = {
                sum: e.sum,
                avg: e.avg,
                max: this.getMax()
            };
        return this.clear(), i
    }
}