import EventEmitter from "eventemitter3";
import H264Worker from "web-worker:./h264.worker.js";
import { range, isArray } from "lodash-es";
import { v4 as uuidv4 } from "uuid";

export class VDecoder extends EventEmitter {
  constructor({ chunkSize = 256 * 1024, maxChip = 100 }) {
    super();
    // this.cacheSegmentCount = cacheSegmentCount;
    // this.chunkSize = chunkSize;
    this.cacheBuffer = [];
    this.cacheBufferTotal = null;
    this.worker = new H264Worker();
    this.initWorker();
    this.tempVideos = [];
    this.ready = false;
    this.decoding = false;
    this.decodingId = null;
    this.start = null;
    this.maxChip = maxChip;
  }

  static isSupport() {
    return !!(
      // UC and Quark browser (iOS/Android) support wasm/asm limited,
      // its iOS version make wasm/asm performance very slow （maybe hook something）
      // its Android version removed support for wasm/asm, it just run pure javascript codes,
      // so it is very easy to cause memory leaks
      (
        !/UCBrowser|Quark/.test(window.navigator.userAgent) &&
        window.fetch &&
        window.ReadableStream &&
        window.Promise &&
        window.URL &&
        window.URL.createObjectURL &&
        window.Blob &&
        window.Worker &&
        !!new Audio().canPlayType("audio/aac;").replace(/^no$/, "") &&
        (window.AudioContext || window.webkitAudioContext)
      )
    );
  }
  initWorker() {
    this.worker.addEventListener("message", (e) => {
      const message =
        /** @type {{type:string, width:number, height:number, data:ArrayBuffer, renderStateId:number}} */ e.data;

      switch (message.type) {
        case "pictureReady":
          //   onPictureReady(message);
          // console.log(
          //   "[VDecoder]::decodeData",
          //   Object.assign(message, { clipId: this.decodingId })
          // );
          this.emit(
            "decodeData",
            Object.assign(message, { clipId: this.decodingId })
          );

          if (this.decoding && this.decodingId) {
            this.decodeNext(this.decodingId);
          }
          break;
        case "decoderReady":
          this.ready = true;
          this.emit("ready");
          break;
      }
    });
  }

  /**
   *
   * @param {*} rangeArray array [2,100]
   */
  fetch({ path, range: rangeArray, decode = true }) {
    if (!this.ready) {
      throw new Error("decoder is not ready");
    }
    const url = path;
    if (!(isArray(rangeArray) && rangeArray.length === 2)) {
      throw new Error("range must is an array!");
    }

    if (this.tempVideos.length > this.maxChip) {
      this.flush();
      console.log("flush");
    }

    let rangeFetch = [];

    if (rangeArray[0] < 0 || rangeArray[1] < 0) {
      console.error("[VDecoder]:range: 非法", `${[rangeArray[0], rangeArray[1]]}`);
      return
    }

    if (rangeArray[0] < rangeArray[1]) {
      rangeFetch = range(rangeArray[0], rangeArray[1] + 1);
      console.log("[VDecoder]:顺时 +", rangeFetch);
    } else {
      rangeFetch = range(rangeArray[1], rangeArray[0] + 1).reverse();
      console.log("[VDecoder]:逆时 -", rangeFetch);
    }

    const allFetch = rangeFetch.map((i) => {
      return fetch(`${url}/${i}`).then((response) => {
        return response.arrayBuffer().then(function (buffer) {
          return new Uint8Array(buffer);
        });
      });
    });

    return Promise.all(allFetch)
      .then((data) => {
        const clip = { id: uuidv4(), data: data };
        if (data.length > 0) {
          this.emit("fetchDone", clip);
          this.cacheBuffer = data.slice();
          this.tempVideos.push(clip);
          console.log("[VDecoder]:获取clip,", clip);
          if (decode) {
            this.start = Date.now();
            this.cacheBufferTotal = clip.data.length;
            this.decodeNext(clip.id);
          }
          return Promise.resolve(clip);
        } else {
          console.warn("[VDecoder]:fetch取帧为空", rangeFetch);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  }
  /**
   * @param {Uint8Array} h264Nal
   */
  decode(h264Nal, id) {
    this.worker.postMessage(
      {
        type: "decode",
        data: h264Nal.buffer,
        offset: h264Nal.byteOffset,
        length: h264Nal.byteLength,
        renderStateId: id,
      },
      [h264Nal.buffer]
    );
  }

  decodeNext(clipId) {
    const nextFrame = this.cacheBuffer.shift();
    this.decodingId = clipId;
    this.decoding = true;
    let tempId = this.cacheBufferTotal - this.cacheBuffer.length - 1;

    if (nextFrame) {
      this.decode(nextFrame, tempId);
    } else {
      console.log("tempVideos", this.tempVideos.length);
      const clip = this.tempVideos.find(({ id }) => id === this.decodingId);
      if (clip) {
        const fps = (1000 / (Date.now() - this.start)) * clip.data.length;
        console.log(
          `Decoded ${clip.data.length} frames in ${
            Date.now() - this.start
          }ms @ ${fps >> 0}FPS`
        );
      } else {
        console.warn("不存在clip");
      }

      this.decoding = false;
      // this.decodingId = null;
      tempId = 0;
      clip && clip.id && this.emit("decodeDone", clip.id);
    }
  }
  flush() {
    this.tempVideos = [];
  }

  preloader(preload) {}
}
