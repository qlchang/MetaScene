
import XSubSequence from "./XSubSequence.js"

export default class XRain extends XSubSequence {
    constructor(e, t, r) {
        super(e, t, r);
        this.onLoadedObserverable.addOnce(()=>{
            this._particleGroups.forEach(n=>{
                const o = n.systems[0];
                o.getClassName() == "ParticleSystem" && (o.startPositionFunction = function(a, s) {
                    const u = 2 * Math.random() * Math.PI
                      , c = Math.random() * 15 * Math.sin(u)
                      , h = this.minEmitBox.y
                      , f = Math.random() * 15 * Math.cos(u);
                      BABYLON.Vector3.TransformCoordinatesFromFloatsToRef(c, h, f, a, s)
                }
                )
            }
            )
        }
        )
    }
}