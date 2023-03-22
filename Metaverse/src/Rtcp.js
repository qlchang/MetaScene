import Workers from "./Workers.js"
import Heartbeat from "./Heartbeat.js"
import Logger from "./Logger.js"

const logger = new Logger('rtcp')
window.JoyStickDelyTime = null;
export default class Rtcp extends EventEmitter {
    constructor(e) {
        
        super();
        E(this, "connection", null);
        E(this, "inputChannel", null);
        E(this, "mediaStream");
        E(this, "socket");
        E(this, "connected", !1);
        E(this, "candidates", []);
        E(this, "isAnswered", !1);
        E(this, "isFlushing", !1);
        E(this, "inputReady", !1);
        E(this, "workers");
        E(this, "actived", !0);
        E(this, "heartbeat");
        E(this, "onIcecandidate", e=>{
            if (e.candidate != null) {
                const t = JSON.stringify(e.candidate);
                logger.debug(`Got ice candidate: ${t}`),
                this.network.socket.send({
                    id: "ice_candidate",
                    data: btoa(t)
                })
            }
        }
        );
        E(this, "onIcecandidateerror", e=>{
            logger.error("onicecandidateerror", e.errorCode, e.errorText, e)
        }
        );
        E(this, "onIceStateChange", e=>{
            switch (e.target.iceGatheringState) {
            case "gathering":
                logger.info("ice gathering");
                break;
            case "complete":
                logger.info("Ice gathering completed")
            }
        }
        );
        E(this, "onIceConnectionStateChange", ()=>{
            if (!!this.connection)
            {
                logger.info(`iceConnectionState: ${this.connection.iceConnectionState}`);
                switch (this.connection.iceConnectionState) {
                    case "connected":
                    {
                        this.connected = !0;
                        break
                    }
                    case "disconnected":
                    {
                        this.connected = !1,
                        this.emit("rtcDisconnected");
                        break
                    }
                    case "failed":
                    {
                        this.emit("rtcDisconnected"),
                        this.connected = !1;
                        break
                    }
                }
            }
        }
        );
        E(this, "setRemoteDescription", async(e,t)=>{
            var a, s, l;
            if (!this.connection)
                return;
            const r = JSON.parse(atob(e))
              , n = new RTCSessionDescription(r);
            await this.connection.setRemoteDescription(n);
            const o = await this.connection.createAnswer();
            if (o.sdp = (a = o.sdp) == null ? void 0 : a.replace(/(a=fmtp:111 .*)/g, "$1;stereo=1;sprop-stereo=1"),
            ((l = (s = o.sdp) == null ? void 0 : s.match(/a=mid:1/g)) == null ? void 0 : l.length) == 2) {
                const u = o.sdp.lastIndexOf("a=mid:1");
                o.sdp = o.sdp.slice(0, u) + "a=mid:2" + o.sdp.slice(u + 7)
            }
            try {
                await this.connection.setLocalDescription(o)
            } catch (u) {
                logger.error("error", u)
            }
            this.isAnswered = !0,
            this.network.rtcp.flushCandidate(),
            this.network.socket.send({
                id: "answer",
                data: btoa(JSON.stringify(o))
            }),
            t.srcObject = this.mediaStream
        }
        );
        E(this, "flushCandidate", ()=>{
            this.isFlushing || !this.isAnswered || (this.isFlushing = !0,
            this.candidates.forEach(e=>{
                const t = atob(e)
                  , r = JSON.parse(t);
                if (/172\./.test(r.candidate))
                    return;
                const n = new RTCIceCandidate(r);
                this.connection && this.connection.addIceCandidate(n).then(()=>{}
                , o=>{
                    logger.info("add candidate failed", o)
                }
                )
            }
            ),
            this.isFlushing = !1)
        }
        );
        E(this, "input", e=>{
            var o = this.inputChannel;
			if(!this.actived || !this.inputChannel || this.inputChannel.readyState === "open"){
				if(o != null){
					//console.log('发送webrtc数据：'+e)
					o.send(e)
				}
			}
        }
        );
        this.network = e,
        this.workers = new Workers(this,logger),
        this.workers.registerLogger(logger),
        this.workers.registerFunction("data", t=>{
            this.emit("data", t)
        }
        ),
        this.heartbeat = new Heartbeat({
            ping: t=>{
                e.room.actionsHandler.echo(t)
            }
            ,
            pong(t, r) {
                var n;
                r && t > 500 && logger.warn(`high hb value ${t}, traceId:` + r),
                (n = e.room.stats) == null || n.assign({
                    hb: t
                })
            }
        })
    }

   

    start() {
        this.connection = new RTCPeerConnection;
        const e = Date.now();
        this.connection.ondatachannel = t=>{
            logger.info(`ondatachannel: ${t.channel.label}`);
           
            this.inputChannel = t.channel;
            this.inputChannel.onopen = ()=>{
                var r;
                logger.info("The input channel has opened, id:", (r = this.inputChannel) == null ? void 0 : r.id),
                this.inputReady = !0,
                this.emit("rtcConnected"),
                this.network.room.currentNetworkOptions.reconnect || (logger.infoAndReportMeasurement({
                    type: "datachannelOpenedAt",
                    group: "joinRoom"
                }),
                logger.infoAndReportMeasurement({
                    type: "datachannelOpenedCost",
                    group: "joinRoom"
                }))
                console.log('this.inputChannel',this.inputChannel)
            }
            ,
            this.inputChannel.onclose = ()=>{
                var r;
                return logger.info("The input channel has closed, id:", (r = this.inputChannel) == null ? void 0 : r.id)
            },
            this.inputChannel.onmessage = r=>{
                this.workers.dataHandle(r.data)
            }
        }
        ,
        this.connection.oniceconnectionstatechange = this.onIceConnectionStateChange,
        this.connection.onicegatheringstatechange = this.onIceStateChange,
        this.connection.onicecandidate = this.onIcecandidate,
        this.connection.onicecandidateerror = this.onIcecandidateerror,
        this.network.socket.send({
            id: "init_webrtc",
            data: JSON.stringify({
                is_mobile: !0
            })
        })
    }
    addCandidate(e) {
        e === "" ? this.network.rtcp.flushCandidate() : this.candidates.push(e)
    }
    disconnect() {
        var i, o, s;
        this.heartbeat.stop(), logger.info("ready to close datachannel, id", (i = this.inputChannel) == null ? void 0 : i.id), (o = this.inputChannel) == null || o.close(), (s = this.connection) == null || s.close(), this.connection = null, this.inputChannel = null
    }
    sendStringData(e) {
        this.input(e)
    }
    sendData(e) {
        let t = "";
        try {
            if(e.action_type != 1009 && e.action_type != 1024){
                if(e.action_type == 15){
                    console.log('发送：action_type:'+e.action_type+',trace_id:'+e.trace_id+',joystick_action'+JSON.stringify(e.dir_action)+',playPosition：'+JSON.stringify(window.room.avatars[0].xAvatar.position)+',时间：'+new Date().getTime());
                    if(window.JoyStickDelyTime == null){
                        window.JoyStickDelyTime = {
                            trace_id:e.trace_id,
                            sendTime:new Date().getTime()
                        }
                    }
        
                    if(window.JoyStickDelyTime.time_delay){
                        e.time_delay = window.JoyStickDelyTime.time_delay;
                        window.JoyStickDelyTime = null;
                    }
                }
                else{
                    console.log('发送：action_type:'+e.action_type+',trace_id:'+e.trace_id+',playPosition：'+JSON.stringify(window.room.avatars[0].xAvatar.position)+',时间：'+new Date().getTime());
                }
            }
            t = JSON.stringify(e)
        } catch (r) {
            logger.error(r);
            return
        }
        this.input(t)
    }
}