import MotionType from "./enum/MotionType.js"

export default class PathManager {
    constructor() {
        this.currentArea = ''
        this.currentPathName = ''
        this.currentAttitude = ''
        this.speed = 0
    }
    getSpeed(e) {
        const t = {
            guangchang: {
                [MotionType.Walk]: 17,
                [MotionType.Run]: 51
            },
            tower: {
                [MotionType.Walk]: 12.5,
                [MotionType.Run]: 25
            },
            zhiboting: {
                [MotionType.Walk]: 12.5,
                [MotionType.Run]: 25
            },
            youxiting: {
                [MotionType.Walk]: 12.5,
                [MotionType.Run]: 25
            },
            diqing: {
                [MotionType.Walk]: 12.5,
                [MotionType.Run]: 25
            }
        }
          , r = t[this.currentArea] || t.guangchang;
        return this.speed = r[e] * 30,
        this.speed
    }
}