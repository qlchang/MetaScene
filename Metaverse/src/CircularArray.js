function add(i, e) {
    return e == -1 && (e = 0),
    i + e
}

function max(i, e) {
    return Math.max(i, e)
}

function count_sd(i, e) {
    function t(r, n) {
        let o = 0;
        return n == -1 ? o = 0 : o = (n - e) * (n - e),
        r + o
    }
    return Math.sqrt(i.reduce(t, 0) / i.reduce(count_valid, 0)) || 0
}

function count_valid(i, e) {
    let t = 0;
    return e != -1 && (t = 1),
    i + t
}

function count_less(i, e) {
    function t(r, n) {
        let o = 0;
        return n != -1 && n < e && (o = 1),
        r + o
    }
    return i.reduce(t, 0)
}

export default class CircularArray {
    constructor(circularLength, t, lessThreshes) {
        this.sum = 0,
        this.incomingSum = 0,
        this.count = 0,
        this.incomingCount = 0,
        this.max = 0,
        this.incomingMax = 0,
        this.goodLess = 0,
        this.wellLess = 0,
        this.fairLess = 0,
        this.badLess = 0,
        this.countLess = !1,
        this.lessThreshes = [],
        this.incomingData = [],
        this.circularData = Array(circularLength).fill(-1),
        this.circularPtr = 0,
        this.circularLength = circularLength,
        t && (this.countLess = !0,this.lessThreshes = lessThreshes)
    }
    add(e) {
        if(this.circularData[this.circularPtr] != -1){
            this.sum -= this.circularData[this.circularPtr]
            if(Math.abs(this.circularData[this.circularPtr] - this.max) < .01) {
                this.circularData[this.circularPtr] = -1
                this.max = this.getMax(!1)
            }
        }
        else{
            this.count += 1
        }

        this.sum += e;
        this.incomingSum += e;
        this.incomingCount += 1;
        this.max < e && (this.max = e);
        this.incomingMax < e && (this.incomingMax = e);
        this.circularData[this.circularPtr] = e;
        this.circularPtr = (this.circularPtr + 1) % this.circularLength;
        this.incomingData.push(e);
        if(this.incomingData.length > this.circularLength){
            this.clearIncoming();
            this.incomingCount = 0;
            this.incomingSum = 0;
        }
    }
    computeAvg(e) {
        return e.reduce(add, 0) / e.reduce(count_valid, 0) || 0
    }
    computeMax(e) {
        return e.reduce(max, 0) || 0
    }
    computeThreshPercent(e) {
        if (this.countLess) {
            const t = count_less(e, this.lessThreshes[0]) || 0
              , r = count_less(e, this.lessThreshes[1]) || 0
              , n = count_less(e, this.lessThreshes[2]) || 0
              , o = count_less(e, this.lessThreshes[3]) || 0
              , a = e.reduce(count_valid, 0);
            return [t, r, n, o, a]
        } else
            return [0, 0, 0, 0, 0]
    }
    getAvg() {
        const e = this.sum / this.count || 0
          , t = this.computeAvg(this.circularData) || 0;
        return Math.abs(e - t) > .01 && console.error("avg value mismatch: ", e, t),
        this.computeAvg(this.circularData) || 0
    }
    getMax(e=!0) {
        const t = this.computeMax(this.circularData) || 0;
        return e && Math.abs(t - this.max) > .01 && console.error("max value mismatch: ", this.max, t),
        this.computeMax(this.circularData) || 0
    }
    getStandardDeviation() {
        return count_sd(this.circularData, this.getAvg())
    }
    getThreshPercent() {
        return this.computeThreshPercent(this.circularData)
    }
    getIncomingMax() {
        return this.computeMax(this.incomingData) || 0
    }
    getIncomingAvg() {
        return this.computeAvg(this.incomingData) || 0
    }
    getIncomingStandardDeviation() {
        return count_sd(this.incomingData, this.getIncomingAvg())
    }
    getIncomingThreshPercent() {
        return this.computeThreshPercent(this.incomingData)
    }
    clearFastComputeItem() {
        this.sum = 0,
        this.incomingSum = 0,
        this.count = 0,
        this.incomingCount = 0,
        this.max = 0,
        this.incomingMax = 0,
        this.goodLess = 0,
        this.wellLess = 0,
        this.fairLess = 0,
        this.badLess = 0
    }
    clearIncoming() {
        for (; this.incomingData.length > 0; )
            this.incomingData.pop()
    }
    clear() {
        this.circularData.fill(-1),
        this.circularPtr = 0,
        this.clearFastComputeItem(),
        this.clearIncoming()
    }
}