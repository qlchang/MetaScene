export default class JoyStick {
    constructor(e) {
        this._zone = document.createElement("div")
        this._joystick = null
        this._room = e
    }
    init(e) {
        const { interval=33, triggerDistance=25, style={left:0, bottom:0} } = e

        const moveFunc = (u,c)=>{
            this._room.actionsHandler.joystick({
                degree: Math.floor(u),
                level: Math.floor(c / 5)
            })
        }
        const a = this._zone;

        document.body.appendChild(a),
        a.style.position = "absolute",
        a.style.width = style.width || "200px",
        a.style.height = style.height || "200px",
        a.style.left = String(style.left || 0),
        a.style.bottom = String(style.bottom || 0),
        a.style.zIndex = "999",
        a.style.userSelect = "none",
        a.style.webkitUserSelect = "none",
        this._joystick = nipplejs.create({
            zone: a,
            mode: "static",
            position: {
                left: "50%",
                top: "50%"
            },
            color: "white"
        });

        let s, l;
        this._joystick.on("move", (u,c)=>{
            s = c
        })
        this._joystick.on("start", ()=>{
            l = window.setInterval(()=>{
                s && s.distance > triggerDistance && moveFunc && moveFunc(s.angle.degree, s.distance)
            }
            , interval)
        })
        this._joystick.on("end", ()=>{
            l && window.clearInterval(l),
            l = void 0
        })

        return this._joystick
    }
    show() {
        if (!this._joystick)
            throw new Error("joystick is not created");
        this._zone.style.display = "block"
    }
    hide() {
        if (!this._joystick)
            throw new Error("joystick is not created");
        this._zone.style.display = "none"
    }
}