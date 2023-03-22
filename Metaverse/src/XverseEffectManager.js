import Logger from "./Logger.js"

const logger = new Logger('4DMVS_EffectManager')
export default class XverseEffectManager extends EventEmitter {
    constructor(e) {
        super();
        E(this, "effects", new Map);
        E(this, "room");
        this.room = e
    }
    async addEffect(e) {
        var o;
        const {jsonPath: t, id: r, type: n=IEffectType.SubSequence} = e;
        try {
            this.effects.get(r) && ((o = this.effects.get(r)) == null || o.dispose());
            const a = new Ae.subEffect({
                id: r,
                jsonPath: t,
                type: n,
                room: this.room
            });
            return this.effects.set(r, a),
            await a.init(),
            a
        } catch (a) {
            return this.effects.delete(r),
            logger.error(a),
            Promise.reject(a)
        }
    }
    clearEffects() {
        this.effects.forEach(e=>{
            e.dispose(),
            this.effects.delete(e.id)
        }
        )
    }
    removeEffect(e) {
        const t = this.effects.get(e);
        t == null || t.dispose(),
        t && this.effects.delete(t.id)
    }
}
;
