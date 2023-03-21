// import H264Worker from "./h264.worker.js";
import H264Worker from "web-worker:./h264.worker.js";
import YUVSurfaceShader from "./YUVSurfaceShader";
import Texture from "./Texture";

// import ChunkLoader from "./chunkLoader.js";
let tinyH264Worker = null;

let nroFrames = 0;
let start = 0;
let videoStreamId = 1;
let cacheBuffer = [];
const fetches = [];
let canvas = null;
let yuvSurfaceShader = null;
let yTexture = null;
let uTexture = null;
let vTexture = null;

// var Stream = (function stream() {
//   function constructor(url) {
//     this.url = url;
//   }

//   constructor.prototype = {
//     readAll: function (progress, complete) {
//       var xhr = new XMLHttpRequest();
//       var async = true;
//       xhr.open("GET", this.url, async);
//       xhr.responseType = "arraybuffer";
//       if (progress) {
//         xhr.onprogress = function (event) {
//           progress(xhr.response, event.loaded, event.total);
//         };
//       }
//       xhr.onreadystatechange = function (event) {
//         if (xhr.readyState === 4) {
//           complete(xhr.response);

//           // var byteArray = new Uint8Array(xhr.response);
//           // var array = Array.prototype.slice.apply(byteArray);
//           // complete(array);
//         }
//       };
//       xhr.send(null);
//     },
//   };
//   return constructor;
// })();

/**
 * @param {Uint8Array} h264Nal
 */
function decode(h264Nal) {
  tinyH264Worker.postMessage(
    {
      type: "decode",
      data: h264Nal.buffer,
      offset: h264Nal.byteOffset,
      length: h264Nal.byteLength,
      renderStateId: videoStreamId,
    },
    [h264Nal.buffer]
  );
}

function decodeNext() {
  const nextFrame = cacheBuffer.shift();
  // console.log("nextFrame", nextFrame);
  if (nextFrame != null) {
    decode(nextFrame);
  } else {
    const fps = (1000 / (Date.now() - start)) * nroFrames;

    window.alert(
      `Decoded ${nroFrames} (${canvas.width} x ${canvas.height} ) frames in ${Date.now() - start}ms @ ${
        fps >> 0
      }FPS`
    );
  }
}

// const vid1 = new ChunkLoader({
//   url: "./video/0_1_0.mp4",
// });

// console.log("vid1", vid1);
// vid1.read().then((data) => {
//   console.log("data", data);
// });

tinyH264Worker = new H264Worker();

function initWebGLCanvas() {
  canvas = document.createElement("canvas");
  canvas.id = "test_canvas";
  canvas.style = `position: fixed;top:0;left: 0;z-index: 100;`;
  const gl = canvas.getContext("webgl");
  yuvSurfaceShader = YUVSurfaceShader.create(gl);
  yTexture = Texture.create(gl, gl.LUMINANCE);
  uTexture = Texture.create(gl, gl.LUMINANCE);
  vTexture = Texture.create(gl, gl.LUMINANCE);

  document.body.append(canvas);
}

// debugger

tinyH264Worker.addEventListener("message", (e) => {
  const message =
    /** @type {{type:string, width:number, height:number, data:ArrayBuffer, renderStateId:number}} */ e.data;
  console.log("message", message.type);
  switch (message.type) {
    case "pictureReady":
      onPictureReady(message);
      break;
    case "decoderReady":
      initWebGLCanvas();
      for (let i = 0; i < 300; i++) {
        // https://laser-data.oss-cn-shenzhen.aliyuncs.com/test-video/earth/
        fetches.push(
          fetch(`https://laser-data.oss-cn-shenzhen.aliyuncs.com/test-video/earth/${i}`).then((response) => {
            return response.arrayBuffer().then(function (buffer) {
              //h264
              cacheBuffer[i] = new Uint8Array(buffer);
            });
          })
        );
      }
      Promise.all(fetches).then(() => {
        nroFrames = cacheBuffer.length;
        start = Date.now();
        // console.log("nroFrames", nroFrames);
        decodeNext();
      });

      break;
  }
});

/**
 * @param {{width:number, height:number, data: ArrayBuffer}}message
 */
function onPictureReady(message) {
  const { width, height, data } = message;
  // console.log("onPictureReady", message);
  onPicture(new Uint8Array(data), width, height);
}

/**
 * @param {Uint8Array}buffer
 * @param {number}width
 * @param {number}height
 */
function onPicture(buffer, width, height) {
  decodeNext();

  canvas.width = width;
  canvas.height = height;

  // the width & height returned are actually padded, so we have to use the frame size to get the real image dimension
  // when uploading to texture
  const stride = width; // stride
  // height is padded with filler rows

  // if we knew the size of the video before encoding, we could cut out the black filler pixels. We don't, so just set
  // it to the size after encoding
  const sourceWidth = width;
  const sourceHeight = height;
  const maxXTexCoord = sourceWidth / stride;
  const maxYTexCoord = sourceHeight / height;

  const lumaSize = stride * height;
  const chromaSize = lumaSize >> 2;

  const yBuffer = buffer.subarray(0, lumaSize);
  const uBuffer = buffer.subarray(lumaSize, lumaSize + chromaSize);
  const vBuffer = buffer.subarray(
    lumaSize + chromaSize,
    lumaSize + 2 * chromaSize
  );
  console.log('yBuffer',1)
  window.updateTexture( yBuffer );

  const chromaHeight = height >> 1;
  const chromaStride = stride >> 1;

  // we upload the entire image, including stride padding & filler rows. The actual visible image will be mapped
  // from texture coordinates as to crop out stride padding & filler rows using maxXTexCoord and maxYTexCoord.

  yTexture.image2dBuffer(yBuffer, stride, height);
  uTexture.image2dBuffer(uBuffer, chromaStride, chromaHeight);
  vTexture.image2dBuffer(vBuffer, chromaStride, chromaHeight);

  yuvSurfaceShader.setTexture(yTexture, uTexture, vTexture);
  yuvSurfaceShader.updateShaderData(
    { w: width, h: height },
    { maxXTexCoord, maxYTexCoord }
  );
  // debugger
    // data = window.changeTexture(data);
    // window.updateTexture( data );
   //yuvSurfaceShader.draw();
}

// steam1.readAll(null, function (buffer) {
//   console.log("buffer", buffer);
// });
