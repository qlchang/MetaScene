import JoyStick from "./JoyStick.js"
import Xverse_Room from "./Xverse_Room.js"

export default class XverseRoom extends Xverse_Room {
    constructor(e) {
        super(e);
        this.joyStick = new JoyStick(this)
    }
    afterJoinRoomHook() {
        this.joyStick.init({
            style: {
                width: "150px",
                height: "150px"
            }
        })
    }
}