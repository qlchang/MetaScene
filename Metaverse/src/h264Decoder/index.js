// vDecoder example
import { VDecoder } from "./VDecoder.js";
// 测试用
import { initWebGLCanvas, draw } from "../video/test.js";

// decoder

const socket = io("ws://192.168.0.150:3000", {
  reconnectionDelayMax: 10000,
});
socket.on("connect", (data) => {
  console.log("socket connect");
});

const vDecoder = new VDecoder({
  maxChip: 100,
});

vDecoder.on("ready", () => {
  console.log("ready");
  // 测试canvas
  initWebGLCanvas();

  //   vDecoder.fetch({
  //     path: "https://laser-data.oss-cn-shenzhen.aliyuncs.com/test-video/1011",
  //     range: [0, 66],
  //   });

  vDecoder.on("fetchDone", (clip) => {
    console.log("fetchDone", clip);
  });
  //监听 decodeData
  vDecoder.on("decodeData", (data) => {
    // console.log("decodeData", data);
    const { width, height, data: buffer } = data;
    draw(new Uint8Array(buffer), width, height);
    // window.updateTexture( new Uint8Array(buffer) );
    // window.up
  });

  vDecoder.on("decodeDone", async (id) => {
    let clipId = null;
    // vDecoder.flush();
    // vDecoder.fetch({
    //   path: "https://laser-data.oss-cn-shenzhen.aliyuncs.com/test-video/1011",
    //   range: [0, 66],
    // });
    // console.log("clipId", clipId);
  });
});

const rtc = new RTCPeerConnection();

socket.on("offer", async (data) => {;
  let offer = new RTCSessionDescription({ sdp: data.sdp, type: data.type });
  console.log("offer", offer);
  rtc.setRemoteDescription(offer);
  const answer = await rtc.createAnswer();
  console.log("send-answer", answer);
  rtc.setLocalDescription(answer);
  socket.emit("answer", JSON.stringify(answer));
});
socket.on("candidate", (data) => {
  console;
  if (/172\./.test(data.candidate)) return;
  let candidate = new RTCIceCandidate(data);
  rtc.addIceCandidate(candidate);
  console.log("candidate", candidate);
});

rtc.ondatachannel = function (data) {
  console.log("DataChannel from ", data);
  let inputChannel = data.channel;
  inputChannel.onopen = (data) => {
    console.warn("onopen", data);
  };
  inputChannel.onmessage = (data) => {
    var id = 0;
    if (data.data) {
      const h264Nal = new Uint8Array(data.data);
      // console.warn("onmessage", data);
      vDecoder.worker.postMessage(
        {
          type: "decode",
          data: h264Nal.buffer,
          offset: h264Nal.byteOffset,
          length: h264Nal.byteLength,
          renderStateId: id,
        },
        [h264Nal.buffer]
      );
      id++;
    }
  };
  inputChannel.onclose = (data) => {
    console.warn("onclose", data);
  };
};
console.log("rtc", rtc);
rtc.oniceconnectionstatechange = function (data) {
  console.log("oniceconnectionstatechange", data);
};
rtc.onicegatheringstatechange = function (data) {
  console.log("onicegatheringstatechange", data);
};
rtc.onicecandidate = function (data) {
  console.log("onicecandidate", data);
  socket.emit("ice_candidate", data.candidate);
};
