class XParticleManager{
    constructor(e) {
        E(this, "_scene");
        E(this, "_particles");
        E(this, "_light");
        E(this, "load", (e,t,r)=>new Promise(n=>{
            ParticleSystemSet.BaseAssetsUrl = e;
            const o = new XMLHttpRequest;
            o.open("get", e + "/" + t),
            o.send(null),
            o.onload = ()=>{
                if (o.status == 200) {
                    const a = JSON.parse(o.responseText);
                    let s = null;
                    if (Object.keys(a).find(l=>l == "systems") == null) {
                        const l = ParticleSystem.Parse(a, this._scene, e);
                        s = new ParticleSystemSet,
                        s.systems.push(l)
                    } else
                        s = ParticleSystemSet.Parse(a, this._scene, !1);
                    n(s)
                }
            }
        }
        ));
        E(this, "get", e=>this._particles.get(e));
        E(this, "start", e=>{
            const t = this._particles.get(e);
            t && t.start()
        }
        );
        E(this, "stop", e=>{
            var r;
            const t = ((r = this._particles.get(e)) == null ? void 0 : r.systems) || [];
            for (let n = 0; n < t.length; n++)
                t[n].stop()
        }
        );
        E(this, "remove", e=>{
            const t = this._particles.get(e);
            t && t.dispose()
        }
        );
        E(this, "setParticlePosition", (e,t)=>{
            const r = this._particles.get(e);
            r && (r.emitterNode = t)
        }
        );
        E(this, "setParticleScalingInPlace", (e,t)=>{
            const r = this._particles.get(e);
            r == null || r.systems.forEach(n=>{
                de.scalingInPlace(n, t)
            }
            )
        }
        );
        if (this._scene = e,
        this._particles = new Map,
        this._light = null,
        this._scene.getLightByName("fireworkLight"))
            this._light = this._scene.getLightByName("fireworkLight");
        else {
            const t = new PointLight("fireworkLight",new BABYLON.Vector3(0,0,0),e);
            t.intensity = 0,
            this._light = t
        }
    }
    _flashBang(e=200) {
        const t = this._scene.getLightByName("fireworkLight");
        t.intensity = 1,
        setTimeout(()=>{
            t.intensity = 0
        }
        , e)
    }
}
;

E(XParticleManager, "disposeParticleSysSet", e=>{
    !e.systems || (e.systems.forEach(t=>{
        de.disposeParticleSystem(t)
    }
    ),
    e.dispose())
}
),
E(XParticleManager, "disposeParticleSystem", e=>{
    e.particleSystem && (e = e.particleSystem),
    e.subEmitters && e.subEmitters.forEach(t=>{
        t instanceof Array ? t.forEach(r=>{
            de.disposeParticleSystem(r)
        }
        ) : de.disposeParticleSystem(t)
    }
    ),
    e.dispose()
}
),
E(XParticleManager, "scalingInPlace", (e,t)=>{
    e.getClassName() === "ParticleSystem" && (e.minSize *= t,
    e.maxSize *= t,
    e.subEmitters != null && e.subEmitters.forEach(r=>{
        r instanceof SubEmitter && de.scalingInPlace(r.particleSystem, t),
        r instanceof ParticleSystem && de.scalingInPlace(r, t),
        r instanceof Array && r.forEach(n=>{
            de.scalingInPlace(n.particleSystem, t)
        }
        )
    }
    ))
}
);