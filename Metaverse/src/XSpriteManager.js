let log$A = new Logger$1("subSequence")
  , DEFAULT_FRAME_RATE = 30
  , ROOT_MESH_ANIM_PROPERTY = ["scaling", "position", "rotation"]
  , MESH_TAG = "XSubSequence";
class XSpriteManager extends SpriteManager {
    constructor(e, t, r, n, o) {
        super(e, t, r, n, o);
        E(this, "originalPositions");
        this.originalPositions = new Array,
        this.sprites.forEach(a=>{
            this.originalPositions.push(a.position)
        }
        )
    }
    static Parse(e, t, r) {
        const n = new XSpriteManager(e.name,"",e.capacity,{
            width: e.cellWidth,
            height: e.cellHeight
        },t);
        e.texture ? n.texture = BABYLON.Texture.Parse(e.texture, t, r) : e.textureName && (n.texture = new BABYLON.Texture(r + e.textureUrl,t,!0,e.invertY !== void 0 ? e.invertY : !0));
        for (const o of e.sprites) {
            const a = Sprite.Parse(o, n);
            n.originalPositions.push(a.position)
        }
        return n
    }
}