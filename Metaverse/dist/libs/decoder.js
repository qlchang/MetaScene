var decoder = `/* eslint-disable no-inner-declarations */
/* eslint-disable default-case */
/* eslint-disable no-restricted-globals */

// import { arrayBuffer } from "stream/consumers"
// import { addSyntheticLeadingComment, textChangeRangeIsUnchanged } from "typescript"

/* eslint-disable no-undef */
const CACHE_BUF_LENGTH = 16
const YUV_BUF_LENGTH = 16
if ('function' === typeof importScripts) {
  const startTime = Date.now()
  // self.importScripts('https://static.xverse.cn/wasm/zx_test_exclusive/v2/libxv265dec.js')
  // printConsole.log('Decoder update time is 2021/10/14 12:13 ')
  const YUVArray = []
  const mediaArray = []
  let IframesReceived = 0
  let IframesDecoded = 0
  let lastReceivePts = 0
  let lastProcessPts = 0
  let framesReturned = 0
  let send_out_buffer = 0
  let lastPoc = 0
  let cachedFirstFrame = undefined
  let cachedPanoramaFirstFrame = undefined

  const printConsole = {
    log: (msg) => self.postMessage({ t: MessageEvent.ConsoleLog, printMsg: msg }),
    error: (msg, code) => self.postMessage({ t: MessageEvent.ConsoleError, printMsg: msg, code: code }),
  }

  const MessageEvent = {
    DecodeMessage: 0,
    UpdateStats: 1,
    WASMReady: 2,
    CacheFrame: 3,
    RecordVideo: 4,
    OnlyEmitSignal: 5,
    WASMReadyCost: 6,
    PanoramaMessage: 7,
    RequestIFrame: 8,
    ConsoleLog: 9,
    ConsoleError: 10,
  }

  let lastReceiveContentPts = 0

  let saveMediaBytes = 0 // Just for test use
  const IFrameCacheBuffer = {}

  for (var i = 0; i < CACHE_BUF_LENGTH; ++i) {
    mediaArray.push({
      pts: -1,
      receive_ts: 0,
      decode_ts: 0,
      yuv_ts: 0,
      render_ts: 0,
      media: null,
      meta: null,
      isIDR: false,
    })
  }

  let downloadBlob = (data, fileName, mimeType) => {
    const blob = new Blob([data], {
      type: mimeType,
    })
    const url = URL.createObjectURL(blob)
    self.postMessage({ t: MessageEvent.RecordVideo, fileObj: blob, link: url })
    //downloadURL(url, fileName)
    setTimeout(function () {
      return URL.revokeObjectURL(url)
    }, 3000)
  }

  function Decoder() {
    this.expected_frameCnt = 1
    this.inited = false
    this.wasminited = false
    this.cacheMap = new Map()

    this.receivedMedia = 0
    this.receivedFrame = 0
    this.receivedYUV = 0
    this.receivedEmit = 0
    this.lastReceivedEmit = 0
    this.mediaBytesReceived = 0
    this.metaBytesReceived = 0
    this.prevSeq = 0
    this.packetsLost = 0
    this.packetsDrop = 0
    this.dtpf = 0
    this.dtmf = 0

    this.getFrameInterval = 10
    this.jumpI = false
    this.startEmit = false

    this.JankTimes = 0
    this.bigJankTimes = 0

    this.mediaCacheBuffer = new Uint8Array(1024 * 1024 * 10) // 10MB for video recording
    this.errorCacheBuffer = new Uint8Array(1024 * 1024 * 10) // 10MB for error stream recording
    this.mediaCacheSize = 0
    this.errorCacheSize = 0

    this.startRecord = false
    this.saveRecord = false

    this.requestingIFrame = false

    this.decoderId = 0 // 0 for 720p, 1 for 480p.

    this.DecodablePts = 0
    this.BlockedFrames = []

    this.decodeTimeCircular = Array(120).fill(-1)
    this.dtcPtr = 0

    this.readPtr = 1
    this.writePtr = 1
    this.cntBufInc = 0
    this.prevBufNum = 0
    this.MAX_TRY_TO_DEC_BUFNUM = 3
    this.skipFrameUntilI = true
    this.enable_logging = false

    this.framesReceivedBetweenTimerInterval = 0
    this.maxFramesReceivedBetweenTimerInterval = 0

    this.isFirstFrame = 1
    this.consumerPrevPts = -1
    this.consumerCurrPts = -1
    this.consumerWaitingIDR = false
    this.lastObj = null

    this.bufferIFrame = 0
    this.passiveJitterLength = 0
  }

  //refactor:
  Decoder.prototype.isBufEmpty = function () {
    return this.readPtr == this.writePtr
  }

  Decoder.prototype.isBufFull = function () {
    return (this.writePtr + 1) % CACHE_BUF_LENGTH == this.readPtr
  }

  Decoder.prototype.getNumOfPktToBeDec = function () {
    return (this.writePtr + CACHE_BUF_LENGTH - this.readPtr) % CACHE_BUF_LENGTH
  }

  Decoder.prototype.getNumOfEmptySlot = function () {
    return CACHE_BUF_LENGTH - this.getNumOfPktToBeDec() - 1
  }

  Decoder.prototype.aheadof = function (a, b) {
    return (a - b + 65536) % 65536 > 65536 / 2
  }

  Decoder.prototype.distance = function (a, b) {
    var res
    if (this.aheadof(a, b)) {
      res = this.seqDiff(b, a, 65536)
    } else {
      res = this.seqDiff(a, b, 65536)
    }
    return res
  }

  Decoder.prototype.isSeqJump = function (a, b) {
    return this.distance(a, b) >= CACHE_BUF_LENGTH - 1
  }

  Decoder.prototype.seqDiff = function (a, b, mod) {
    return (a + mod - b) % mod
  }

  //notice: n could be nagative
  Decoder.prototype.seqAdd = function (seq, n, mod) {
    return (seq + mod + n) % mod
  }
  //end refactor

  Decoder.prototype.resetDecoder = function () {
    this.isFirstFrame = 1
    this.expected_frameCnt = 1

    this.receivedMedia = 0
    this.receivedYUV = 0
    this.receivedEmit = 0
    this.lastReceivedEmit = 0
    this.mediaBytesReceived = 0
    this.metaBytesReceived = 0
    this.prevSeq = 0

    this.packetsLost = 0
    this.packetsDrop = 0
    this.dtpf = 0
    this.dtmf = 0

    this.JankTimes = 0
    this.bigJankTimes = 0

    this.getFrameInterval = 10
    this.jumpI = false
    IframesReceived = 0
    IframesDecoded = 0
    lastReceivePts = 0
    lastProcessPts = 0
    lastReceiveContentPts = 0

    this.requestingIFrame = false
    this.DecodablePts = 0
    this.BlockedFrames = []

    this.decodeTimeCircular.fill(-1)
    this.dtcPtr = 0

    for (var i = 0; i < CACHE_BUF_LENGTH; ++i) {
      mediaArray[i].media = null
      mediaArray[i].meta = null
      mediaArray[i] = {
        pts: -1,
        receive_ts: 0,
        decode_ts: 0,
        yuv_ts: 0,
        render_ts: 0,
        media: null,
        meta: null,
        isIDR: false,
      }
    }
    //refactor:
    this.readPtr = this.writePtr = 1
    this.cntBufInc = 0
    this.prevBufNum = 0
    this.MAX_TRY_TO_DEC_BUFNUM = 3
    this.skipFrameUntilI = true

    this.consumerPrevPts = -1
    this.consumerCurrPts = -1

    this.consumerWaitingIDR = false
    this.lastObj = null
    this.bufferIFrame = 0
    //end refactor
  }

  //refactor:

  Decoder.prototype.changeLogSwitch = function (status) {
    this.enable_logging = status
  }

  const MAX_LOG_NUM = 128
  logBufQueue = []

  Decoder.prototype.dumpLogBuf = function () {
    while (logBufQueue.length > 0) {
      console.log(logBufQueue.shift())
    }
  }

  Decoder.prototype.dumpJitterBufInfo = function (label, pts = -1) {
    // if (!this.enable_logging) {
    //   return
    // }

    logInfo =
      'WritePtr: ' +
      this.writePtr +
      ', ReadPtr: ' +
      this.readPtr +
      '\\n' +
      ', Producer Prev/Curr: ' +
      this.prevSeq +
      '/' +
      pts +
      '\\n' +
      ', Consumer Prev/Curr: ' +
      this.consumerPrevPts +
      '/' +
      this.consumerCurrPts +
      '\\n' +
      'awaitingBuf: ' +
      this.getNumOfPktToBeDec() +
      ', emptySlotNum: ' +
      this.getNumOfEmptySlot() +
      ', skipFrameUntilI: ' +
      this.skipFrameUntilI +
      '\\n' +
      ' framesReceivedBetweenTimerInterval: ' +
      this.framesReceivedBetweenTimerInterval +
      ', maxFramesReceivedBetweenTimerInterval: ' +
      this.maxFramesReceivedBetweenTimerInterval +
      '\\n' +
      ' label: ' +
      label +
      '\\n'

    if (pts != -1) {
      logInfo += ' this.notEnoughSlots(' + pts + '): ' + this.notEnoughSlots(pts) + '\\n'
    }

    if (this.enable_logging) {
      console.log(logInfo)
    } else {
      logBufQueue.push(logInfo)
      if (logBufQueue.length > MAX_LOG_NUM) {
        logBufQueue.shift()
      }
    }
  }

  Decoder.prototype.resetBufItem = function (index) {
    mediaArray[index].media = null
    mediaArray[index].meta = null
    if (mediaArray[index].isIDR == true) {
      this.bufferIFrame -= 1
    }
    mediaArray[index] = {
      pts: -1,
      receive_ts: 0,
      decode_ts: 0,
      yuv_ts: 0,
      render_ts: 0,
      media: null,
      meta: null,
      isIDR: false,
    }
    this.readPtr = this.seqAdd(this.readPtr, 1, CACHE_BUF_LENGTH)
  }

  Decoder.prototype.checkPktOrderInConsumer = function (index) {
    if (this.consumerPrevPts == -1) {
      if (!this.isSlotEmpty(index)) {
        this.consumerPrevPts = mediaArray[index].pts
      }
      return true
    }
    if (this.isSlotEmpty(index)) {
      //lost
      // debugger
      // console.log("[xmedia] return on SLOT EMPTY, prev: %s", prev)
      this.consumerWaitingIDR = true
      this.consumerPrevPts = this.seqAdd(this.consumerPrevPts, 1, 65536)
      return true
    }

    if (!this.slotHasMedia(index)) {
      // pure meta
      // debugger
      // console.log("[xmedia] return on meta, prev: %s, cur: %s", this., mediaArray[index].pts)
      this.consumerPrevPts = mediaArray[index].pts
      return true
    }

    this.consumerCurrPts = mediaArray[index].pts

    if (this.consumerWaitingIDR || this.seqDiff(this.consumerCurrPts, this.consumerPrevPts, 65536) != 1) {
      // if (!mediaArray[index].isIDR && mediaArray[index].media.byteLength!=0) {
      if (this.isPFrame(mediaArray[index].isIDR, mediaArray[index].media.byteLength)) {
        console.error('[INFO][XMEDIA] optimize to further reduce clutter chance. copy console log to developer')
        this.dumpLogBuf()
        this.dumpJitterBufInfo('go away.')
        // debugger
        this.consumerPrevPts = -1
        // this.resetDecoder()
        return false
      }
    }

    // console.log("[xmedia] return finally, prev: %s, cur: %s", prev, cur)
    this.consumerPrevPts = this.consumerCurrPts

    this.consumerWaitingIDR = false
    return true
  }

  Decoder.prototype.slotHasMedia = function (index) {
    return mediaArray[index].media != null && mediaArray[index].media.byteLength != 0
  }

  Decoder.prototype.slotHasContent = function (index) {
    return mediaArray[index].media != null && mediaArray[index].meta != null && mediaArray[index].pts != -1
  }

  Decoder.prototype.procBufItem = function (index) {
    this.dumpJitterBufInfo('Entering Decoder.prototype.procBufItem')
    // console.log('[][Core][WASM], pts: %s, isIDR: %s, length: %s', mediaArray[index].pts, mediaArray[index].isIDR, mediaArray[index].media.length)
    // var loginfo = 'pts: %s, isIDR: %s, length: %s', mediaArray[index].pts, mediaArray[index].isIDR, mediaArray[index].media.length

    needToSkip = this.skipFrameUntilI && !mediaArray[index].isIDR
    var loginfo =
      'pts: ' +
      mediaArray[index].pts +
      ', isidr: ' +
      mediaArray[index].isIDR +
      ', slotHasMedia: ' +
      this.slotHasMedia(index) +
      ', slotHasMeta: ' +
      (mediaArray[index].meta != null) +
      ', needToSkip: ' +
      needToSkip

    if (this.slotHasContent(index) && !needToSkip) {
      // console.log("[xmedia] %s ------------ 001", mediaArray[index].pts)
      let objData = {
        media: mediaArray[index].media,
        frameCnt: mediaArray[index].pts,
        meta: mediaArray[index].meta,
        metadata: mediaArray[index].metadata,
        isIDR: mediaArray[index].isIDR,
      }

      // -------------------
      if (this.checkPktOrderInConsumer(index)) {
        // console.log("[xmedia] %s ------------ 002", mediaArray[index].pts)
        this.decodeFrame(objData)
      }

      if (mediaArray[index].isIDR) {
        // console.log("[xmedia] %s ------------ 003", mediaArray[index].pts)
        // console.log("mediaArray[index].isIDR: this.skipFrameUntilI = false")
        this.skipFrameUntilI = false
      }
    } else {
      // console.log("[xmedia] %s ------------ 004", mediaArray[index].pts)
      if (this.slotHasMedia(index)) {
        // console.log("[xmedia] %s ------------ 005", mediaArray[index].pts)
        //need to skip, waiting I Frame
        //dropCache++
        this.dropPkt += 1
        // MARKER META1META2
        // self.postMessage({ t: MessageEvent.OnlyEmitSignal, meta_only: true, meta: mediaArray[index].meta, metadata: mediaArray[index].metadata })
      } else {
        // console.log("[xmedia] %s ------------ 006", mediaArray[index].pts)
        // no media
        if (mediaArray[index].meta != null) {
          this.checkPktOrderInConsumer(index)
          // console.log("[xmedia] %s ------------ 007", mediaArray[index].pts)
          // Still frame
          // console.log('[send signal]', mediaArray[index].pts)
          self.postMessage({
            t: MessageEvent.OnlyEmitSignal,
            meta_only: true,
            meta: mediaArray[index].meta,
            metadata: mediaArray[index].metadata,
          })
        } else {
          // console.log("[xmedia] %s ------------ 008", mediaArray[index].pts)
          // Lost_rcv++
          // console.log("lost_rcv++: this.skipFrameUntilI = true")
          // console.info('[xmedia] FFFFF This code should not be executed!!!!')
          console.info('[xmedia] null pkt sneaked into profBufItem without harm')
          this.skipFrameUntilI = true
        }
      }
    }
    this.dumpJitterBufInfo('Leaving Decoder.prototype.procBufItem, ' + loginfo)
    this.lastObj = mediaArray[index]
    this.resetBufItem(index)
  }

  Decoder.prototype.flushBuffer = function (untilIDR) {
    this.dumpJitterBufInfo('Entering Decoder.prototype.flushBuffer')
    this.skipFrameUntilI = true
    var breakWhenIDR = false
    while (this.getNumOfPktToBeDec() > 0) {
      index = this.readPtr
      if (this.slotHasMedia(index)) {
        // dropMedia until IDR // \u6765\u4E0D\u53CA\u89E3\u7801\u4E22\u5E27
        this.packetsDrop += 1
        if (untilIDR) {
          if (mediaArray[index].isIDR == true) {
            breakWhenIDR = true
            break
          }
        }
      } else if (mediaArray[index].meta != null) {
        self.postMessage({
          t: MessageEvent.OnlyEmitSignal,
          meta_only: true,
          meta: mediaArray[index].meta,
          metadata: mediaArray[index].metadata,
        })
      }
      this.resetBufItem(index)
    }
    if (!breakWhenIDR) {
      this.isFirstFrame = true
    }
    this.dumpJitterBufInfo('Leaving Decoder.prototype.flushBuffer')
    return this.isFirstFrame
  }
  // var cnt = 0
  Decoder.prototype.getFrameToDecode = function () {
    this.dumpJitterBufInfo('Entering Decoder.prototype.getFrameToDecode')

    if (this.getNumOfPktToBeDec() == 0) {
      return false
    }

    //bufNum awaiting increase counter
    // while (this.getNumOfPktToBeDec() > CACHE_BUF_LENGTH / 2) {
    //   needToCheck = true
    //   if (this.cntBufInc > this.MAX_TRY_TO_DEC_BUFNUM) {
    //     console.log('ringbuffer is deteriorating, flush until IDR')
    //     var untilIDR = true
    //     this.flushBuffer(untilIDR)
    //     this.cntBufInc = 0
    //     break
    //   }

    //   this.procBufItem(this.readPtr)
    // }

    // if (this.getNumOfPktToBeDec() == 0) {
    //   return false
    // }
    let IFrmInBuffer = 0
    let frmInBuffer = 0
    for (var i = 0; i < CACHE_BUF_LENGTH; ++i) {
      if (mediaArray[i].isIDR) {
        IFrmInBuffer += 1
      }
      if (this.slotHasMedia(i)) {
        frmInBuffer += 1
      }
    }
    if (!this.slotHasContent(this.readPtr) && IFrmInBuffer == 0) {
      if (frmInBuffer > 0) {
        // There is P frame in buffer but cannot be decoded.
        // Due to ordered data channel, this is packet loss.
        // So request for I frame here.
        printConsole.log('detect packet lost. Request for I frame.')
        self.postMessage({ t: MessageEvent.RequestIFrame })
      }
      return false
    }
    this.procBufItem(this.readPtr)

    // if (this.getNumOfPktToBeDec() > this.prevBufNum) {
    //   this.cntBufInc++
    // } else {
    //   if (this.cntBufInc > 2) {
    //     // aimd
    //     this.cntBufInc / 2
    //   }
    // }

    // this.prevBufNum = this.getNumOfPktToBeDec()

    this.dumpJitterBufInfo('Leaving Decoder.prototype.getFrameToDecode')
    return true
  }
  //refactor end:

  var cacheBuffer
  var resultBuffer

  Decoder.prototype.startDecoding = function () {
    function iterative_getFrameToDecode() {
      self.decoder.framesReceivedBetweenTimerInterval = 0
      self.decoder.dumpJitterBufInfo('Entering Decoder.prototype.iterative_getFrameToDecode')
      var start_ts = Date.now()
      let hasDecodeFrame = self.decoder.getFrameToDecode()
      var end_ts = Date.now()

      // refactor
      let expect_interval =
        1000 / (30 + Math.max(self.decoder.getNumOfPktToBeDec() - self.decoder.passiveJitterLength, 0))
      //let expect_interval = 1000 / (Decoder.prototype.getNumOfPktToBeDec() + 30)
      if (hasDecodeFrame) {
        let usedTime = end_ts - start_ts
        self.decoder.getFrameInterval = expect_interval - Math.max(usedTime, self.decoder.dtpf)
        if (self.decoder.getFrameInterval < 1) {
          self.decoder.getFrameInterval = 0
        }
      } else {
        self.decoder.getFrameInterval = 5
      }

      // let usedTime = end_ts - start_ts
      // FPS = 30
      // if (usedTime * FPS < 1000) {
      //   self.decoder.getFrameInterval = 1000 / (FPS + Decoder.prototype.getNumOfPktToBeDec())
      // } else {
      //   self.decoder.getFrameInterval = 1 //ms
      // }
      // if (Decoder.prototype.getNumOfPktToBeDec() == 0) {
      //   //Hinse: have to get buf to send asap.
      //   self.decoder.getFrameInterval = 5 //ms
      // }
      setTimeout(iterative_getFrameToDecode, self.decoder.getFrameInterval)
      self.decoder.dumpJitterBufInfo('Leaving Decoder.prototype.iterative_getFrameToDecode')
      // refactor end
    }
    function postStats() {
      function add(accumulator, a) {
        if (a == -1) {
          a = 0
        }
        return accumulator + a
      }
      function count_valid(accumulator, a) {
        let non_zero = 0
        if (a != -1) {
          non_zero = 1
        }
        return accumulator + non_zero
      }
      function max(maxer, a) {
        return Math.max(maxer, a)
      }
      const dtpf =
        self.decoder.decodeTimeCircular.reduce(add, 0) / self.decoder.decodeTimeCircular.reduce(count_valid, 0) || 0
      const dtmf = self.decoder.decodeTimeCircular.reduce(max, 0)
      let objData = {
        t: MessageEvent.UpdateStats,
        mediaBytesReceived: self.decoder.mediaBytesReceived,
        metaBytesReceived: self.decoder.metaBytesReceived,
        packetsLost: self.decoder.packetsLost, // \u7F51\u7EDC\u4E22\u5E27
        packetsDrop: self.decoder.packetsDrop, // \u6765\u4E0D\u53CA\u89E3\u7801\u4E22\u5E27
        framesReceived: self.decoder.receivedMedia,
        framesDecoded: self.decoder.receivedYUV,
        framesRendered: self.decoder.receivedEmit,
        framesReturned: framesReturned,
        // framesAwait: leastReceivePts - lastProcessPts,
        framesAwait: self.decoder.getNumOfPktToBeDec(), // \u7B49\u5F85\u89E3\u7801\u7684\u5E27
        decodeTimePerFrame: dtpf,
        decodeTimeMaxFrame: dtmf,
        sendOutBuffer: send_out_buffer,
        JankTimes: self.decoder.JankTimes,
        bigJankTimes: self.decoder.bigJankTimes,
        receivedIframe: self.decoder.IframesReceived,
        decodedIframe: self.decoder.IframesDecoded,
      }
      self.postMessage(objData)
      self.decoder.dtmf = 0
    }
    setTimeout(iterative_getFrameToDecode, this.getFrameInterval)
    setInterval(postStats, 1000)
  }

  Decoder.prototype.initAll = function (config) {
    if (typeof wasmSource != 'undefined') {
      if (wasmSource == 0) {
        // Load from indexedDB
        // console.log('Load WASM from indexedDB')
        printConsole.log('Load WASM from indexedDB')
        wasmSource = undefined
      } else if (wasmSource == 1) {
        // Load by fetch
        // console.log('Load WASM by fetch')
        printConsole.log('Load WASM by fetch')
        wasmSource = undefined
      } else {
        printConsole.log('WASM not ready now, wait for 200 ms.')
      }
    } else {
      printConsole.log('wasm variable is not defined. Probably libffmpeg.js file is not loaded properly.')
    }
    if (typeof wasmTable === 'undefined') {
      setTimeout(self.decoder.initAll, 200, config)
      return 0
    }

    cacheBuffer = Module._malloc(1024 * 1024)

    resultBuffer = Module._malloc(64)

    self.postMessage({
      t: MessageEvent.WASMReadyCost,
      type: 'report',
      data: {
        metric: 'wasmDownloadCost',
        value: Date.now() - startTime,
        group: 'costs',
      },
    })

    // WASM already initialized. Now  we open decoder.
    const LOG_LEVEL_WASM = 2
    const DECODER_H264 = 0
    const decoder_type = DECODER_H264
    for (var j = 0; j < YUV_BUF_LENGTH; ++j) {
      YUVArray.push({ status: 0, buffer: new Uint8Array((config.width * config.height * 3) / 2) })
    }
    printConsole.log('Going to open decoder ' + String(Date.now()))
    var ret0 = Module._openDecoder(0, decoder_type, LOG_LEVEL_WASM)
    if (ret0 == 0) {
      self.decoder.startDecoding()
      self.postMessage({ t: MessageEvent.WASMReady, wasm_ready: true, updateStats: false })
    } else {
      printConsole.error('openDecoder failed with error ' + String(ret0), '5001')
      return 1
    }

    return 0
  }

  Decoder.prototype.cacheFrame = function (data) {
    if (data.position != undefined) {
      var media = data.data.subarray(data.metaLen, data.metaLen + data.mediaLen)
      if (IFrameCacheBuffer[JSON.stringify(data.position)] == undefined) {
        for (var key in IFrameCacheBuffer) delete IFrameCacheBuffer[key] // Clear Frame Cache
        IFrameCacheBuffer[JSON.stringify(data.position)] = {}
      }
      IFrameCacheBuffer[JSON.stringify(data.position)][data.cachedKey] = media
      self.postMessage({
        t: MessageEvent.CacheFrame,
        cacheFrame: true,
        cachedKey: data.cachedKey,
        metadata: data.metadata,
      })
    }
  }

  Decoder.prototype.updateMediaMetaStats = function (data) {
    this.metaBytesReceived += data.metaLen
    this.mediaBytesReceived += data.mediaLen
    if (data.mediaLen != 0) {
      this.receivedMedia++
    }
  }

  Decoder.prototype.isIFrame = function (isIDR, mediaLen) {
    // return data.isIDR && media.byteLength !=0
    return isIDR && mediaLen != 0
  }

  Decoder.prototype.isPFrame = function (isIDR, mediaLen) {
    // return !data.isIDR && media.byteLength !=0
    return !isIDR && mediaLen != 0
  }

  Decoder.prototype.isPureMeta = function (metaLen, mediaLen) {
    // return media.byteLength == 0 && meta.byteLength !=0
    return mediaLen == 0 && metaLen != 0
  }

  Decoder.prototype.isInvalidPkt = function (isIDR, mediaLen, metaLen) {
    return !this.isIFrame(isIDR, mediaLen) && !this.isPFrame(isIDR, mediaLen) && !this.isPureMeta(metaLen, mediaLen)
  }

  Decoder.prototype.isSlotEmpty = function (index) {
    return !this.slotHasMedia(index) && mediaArray[index].meta == null
  }

  Decoder.prototype.handleNewPktOnFlush = function (isIDR, mediaLen) {
    var dropPkt = false

    // console.log("[xmedia] 000-1 isFirstFrame %s", this.isFirstFrame)
    if (this.isFirstFrame) {
      // let IDR/meta pass
      // console.log("[xmedia] 000-2 isIDR: %s, mediaLen: %s", isIDR, mediaLen)
      // console.log("[xmedia] 000-3 this.isPFrame(isIDR, mediaLen): %s", this.isPFrame(isIDR, mediaLen))
      if (this.isPFrame(isIDR, mediaLen)) {
        // console.log("[xmedia] 001: isPFrame TRUE")
        this.packetsDrop += 1
        // MARKER META1META2
        dropPkt = true
      }
      if (this.isIFrame(isIDR, mediaLen)) {
        // console.log("[xmedia] 002: isIFrame TRUE")
        this.isFirstFrame = false
      }
    }
    // console.log("[xmedia] 003: dropPkt: %s", dropPkt)
    return dropPkt
  }

  Decoder.prototype.notEnoughSlots = function (pts) {
    return this.isBufFull() || this.seqDiff(pts, this.prevSeq, CACHE_BUF_LENGTH) > this.getNumOfEmptySlot()
  }

  Decoder.prototype.receiveFrame = function (data) {
    var key = data.cachedKey
    var pts = data.frameCnt
    var meta = data.data.subarray(0, data.metaLen)
    var media

    if (data.cached) {
      media = IFrameCacheBuffer[JSON.stringify(data.position)][key]
    } else if (data.cacheRequest) {
      media = data.data.subarray(data.metaLen, data.metaLen + data.mediaLen)
      self.decoder.cacheFrame(data)
    } else {
      media = data.data.subarray(data.metaLen, data.metaLen + data.mediaLen)
    }

    this.updateMediaMetaStats(data)

    if (this.isFirstFrame) {
      // console.log('[xmedia] isFirstFrame = true. pts:%s', pts)
      if (this.isPFrame(data.isIDR, media.byteLength)) {
        // MARKER META1META2
        this.packetsDrop += 1
        return
      }
      this.prevSeq = this.seqDiff(pts, 1, 65536)
      this.readPtr = this.writePtr = pts % CACHE_BUF_LENGTH
      if (data.isIDR) {
        this.isFirstFrame = false
      }
    }
    if (pts !== this.seqAdd(this.prevSeq, 1, 65536) && pts !== this.prevSeq) {
      this.packetsLost += 1
    }

    const index = pts % CACHE_BUF_LENGTH
    if (this.startRecord) {
      this.mediaCacheBuffer.set(media, this.mediaCacheSize)
      this.mediaCacheSize += media.byteLength
    }
    if (this.saveRecord) {
      downloadBlob(this.mediaCacheBuffer.subarray(0, this.mediaCacheSize), 'test.264', 'application/octet-stream')
      this.mediaCacheSize = 0
      this.saveRecord = false
      this.startRecord = false
    }
    //refactor:
    // Step 1, big jump detected. we cannot handle it, flush all.
    var untilIDR, pktDrop
    if (this.isSeqJump(this.prevSeq, pts)) {
      // console.log('[resetdecoder] Fatal: decoder seq jump from ' + this.prevSeq + ' to ' + pts)
      untilIDR = false
      this.flushBuffer(untilIDR)
      pktDrop = this.handleNewPktOnFlush(data.isIDR, media.byteLength)
      if (pktDrop) return
    }
    this.dumpJitterBufInfo('Entering Decoder.prototype.receiveFrame', pts)
    // console.log("--->> this.notEnoughSlots(pts): %s", this.notEnoughSlots(pts))

    // Step 2,
    if (this.aheadof(pts, this.prevSeq)) {
      // pts before prevSeq
      // pkts in wrong order
      if (this.packetsLost > 0) {
        this.packetsLost -= 1
        // this.packetdisorder +=1
      }
      // console.log("[xmedia] disorder frame received. preSeq: %s, pts: %s", this.prevSeq, pts)
      if (this.seqDiff(this.prevSeq, pts, 65536) < this.getNumOfPktToBeDec()) {
        // slot for pts is not handled yet. just put it back:
        // console.log('put disorder frame to enc_queue, pkt:%s, prevPts: %s, numOfPktToBeDec: %s', pts, this.prevSeq, this.getNumOfPktToBeDec())
      } else {
        //dropDisorder++
        console.error(
          'drop disorder pkt:%s, prevPts: %s, numOfPktToBeDec: %s',
          pts,
          this.prevSeq,
          this.getNumOfPktToBeDec(),
        )
        this.packetsDrop += 1
        // ---------------------
        // Note:
        //
        // Three principles for meta data:
        //           step 1                        step 2
        // 1. backend -----> frontend (decoder.js) -----> frontend (worker.js), meta pkts must be kept in order in the whole pipeline
        // 2. if media presents and needs to be dropped, the meta companion needs to be dropped together.
        // 3. if media is absent (media.bytelength == 0), send meta anyway
        // ---------------------
        // According to rule 1, drop meta at this point is reasonable.
        return
      }
    } else {
      // pts after prevSeq
      // make sure the ringbuffer has empty slot for new pkt
      if (this.notEnoughSlots(pts)) {
        this.dumpJitterBufInfo('Fatal: decoder buf is full', pts)
        //dropIncoming
        untilIDR = true
        this.flushBuffer(untilIDR)

        if (this.notEnoughSlots(pts)) {
          untilIDR = false
          this.flushBuffer(untilIDR)
        }
        pktDrop = this.handleNewPktOnFlush(data.isIDR, media.byteLength)
        if (pktDrop) return
      }
    }

    mediaArray[index] = {
      pts: pts,
      receive_ts: Date.now(),
      decode_ts: 0,
      yuv_ts: 0,
      render_ts: 0,
      media: media,
      meta: meta,
      metadata: data.metadata,
      isIDR: data.isIDR,
    }

    if (data.isIDR == true) {
      this.bufferIFrame += 1
    }

    this.framesReceivedBetweenTimerInterval += 1
    if (this.framesReceivedBetweenTimerInterval > this.maxFramesReceivedBetweenTimerInterval) {
      this.maxFramesReceivedBetweenTimerInterval = this.framesReceivedBetweenTimerInterval
    }

    if (!this.aheadof(pts, this.prevSeq)) {
      // writePtr += (cur - prev)
      this.writePtr = this.seqAdd(this.writePtr, this.seqDiff(pts, this.prevSeq, CACHE_BUF_LENGTH), CACHE_BUF_LENGTH)

      if (this.seqAdd(index, 1, CACHE_BUF_LENGTH) != this.writePtr) {
        this.dumpJitterBufInfo('dec worker internal info: index (' + index + ') != write_ptr (' + this.writePtr + ')')
        // debugger
      }
      this.prevSeq = pts
    }

    this.dumpJitterBufInfo('Leaving Decoder.prototype.receiveFrame')
    //refactor end
  }

  Decoder.prototype.startEmiter = function () {
    self.decoder.startEmit = true
    if (cachedFirstFrame != undefined) {
      self.postMessage(cachedFirstFrame, [cachedFirstFrame.data.buffer])
      send_out_buffer += 1
      this.receivedEmit++
      cachedFirstFrame = undefined
    }
    if (cachedPanoramaFirstFrame != undefined) {
      self.postMessage(cachedPanoramaFirstFrame)
      send_out_buffer += 1
      this.receivedEmit++
      cachedPanoramaFirstFrame = undefined
    }
  }

  Decoder.prototype.decodePanorama = function (data) {
    console.log('upload pano data')
    var content = data.data.data
    var content_size = data.data.mediaLen
    // var cacheBuffer = Module._malloc(content_size)
    // var resultBuffer = Module._malloc(64)
    Module.HEAPU8.set(content, cacheBuffer)
    let ret = 0
    try {
      ret = Module._decodeData(0, 0, cacheBuffer, content_size, resultBuffer)
      // // console.log('[][Core][WASM] return value %s',ret)
      // if(ret!=0){
      //   // console.log('[][Core][WASM],-abcdefg-----> ', ret)

      //   var ret_close = Module._closeDecoder(0)
      //   // eslint-disable-next-line no-empty
      //   if (ret_close === 0) {
      //     // console.log('[][Core][WASM] decoder closed for restart')
      //   } else {
      //     printConsole.error('close decoder failed after decode pano.')
      //     return 1
      //   }
      //   var ret0 = Module._openDecoder(0, 0, 2)
      //   // console.log('[][Core][WASM] decoder restart success')
      //   // var ret1 = Module._openDecoder(1, decoder_type, LOG_LEVEL_WASM)
      //   if (ret0 === 0) {
      //     ret = Module._decodeData(0, 0, cacheBuffer, content_size, resultBuffer)
      //   } else {
      //     printConsole.error('openDecoder failed with error ' + String(ret0) , '5001')
      //     return 1
      //   }
      // }
    } catch (e) {
      console.log('catch error ', e)
      printConsole.error(e.message, '5002')
    }
    // let ret = Module._decodeData(0, 0, cacheBuffer, content_size, resultBuffer)
    var width = Module.getValue(resultBuffer, 'i32')
    var height = Module.getValue(resultBuffer + 4, 'i32')
    var stride_y = Module.getValue(resultBuffer + 20, 'i32')
    var stride_u = Module.getValue(resultBuffer + 24, 'i32')
    var stride_v = Module.getValue(resultBuffer + 28, 'i32')
    var addr_y = Module.getValue(resultBuffer + 8, 'i32')
    var addr_u = Module.getValue(resultBuffer + 12, 'i32')
    var addr_v = Module.getValue(resultBuffer + 16, 'i32')
    var poc = Module.getValue(resultBuffer + 32, 'i32')
    if (ret != 0) {
      printConsole.log(
        'Decode Data error for panorama, ret value is ' + String(ret) + ', frame content size: ' + String(content_size),
      )
      return
    }

    var yuv_data = new Uint8Array((width * height * 3) / 2)
    let pos = 0
    for (let i = 0; i < height; i++) {
      let src = addr_y + i * stride_y
      let tmp = HEAPU8.subarray(src, src + width)
      tmp = new Uint8Array(tmp)
      yuv_data.set(tmp, pos)
      pos += tmp.length
    }
    for (let i = 0; i < height / 2; i++) {
      let src = addr_u + i * stride_u
      let tmp = HEAPU8.subarray(src, src + width / 2)
      tmp = new Uint8Array(tmp)
      yuv_data.set(tmp, pos)
      pos += tmp.length

      let src2 = addr_v + i * stride_v
      let tmp2 = HEAPU8.subarray(src2, src2 + width / 2)
      tmp2 = new Uint8Array(tmp2)
      yuv_data.set(tmp2, pos)
      pos += tmp2.length
    }

    const objData = {
      t: MessageEvent.PanoramaMessage,
      tileId: data.data.tileId,
      uuid: data.data.uuid,
      data: yuv_data,
      x: data.data.x,
      y: data.data.y,
      z: data.data.z,
    }
    //TODO: remove debug
    if (this.startEmit) {
      self.postMessage(objData)
    } else {
      cachedPanoramaFirstFrame = objData
    }

    // console.log('upload pano data with dataLength:', len(yuv_data))
    var ret_close = Module._closeDecoder(0)
    // eslint-disable-next-line no-empty
    if (ret_close === 0) {
      // console.log('[][Core][WASM] decoder closed for restart')
    } else {
      printConsole.error('close decoder failed after decode pano.')
      return 1
    }
    var ret0 = Module._openDecoder(0, 0, 2)
    // var ret1 = Module._openDecoder(1, decoder_type, LOG_LEVEL_WASM)
    if (ret0 === 0) {
      // console.log('[][Core][WASM] decoder restart success')
      self.decoder.startDecoding()
      self.postMessage({ t: MessageEvent.WASMReady, wasm_ready: true, updateStats: false })
    } else {
      printConsole.error('openDecoder failed with error ' + String(ret0), '5001')
      return 1
    }
  }

  Decoder.prototype.decodeFrame = function (data) {
    var content = data.media
    if (typeof content == 'undefined') {
      printConsole.error('null content in decoder', '5999')
      return
    }
    var content_size = content.byteLength
    // var cacheBuffer = Module._malloc(content_size)
    // var resultBuffer = Module._malloc(64)
    Module.HEAPU8.set(content, cacheBuffer)
    const index = data.frameCnt % CACHE_BUF_LENGTH
    mediaArray[index].decode_ts = Date.now()
    var objData
    if (content_size != 0) {
      // var date = Date.now()
      // var curDate = Date.now()
      // while (curDate - date < 100) {
      //   curDate = Date.now()
      // }

      // TODO: Enable/Disable it by config
      if (data.isIDR) {
        this.errorCacheSize = 0
      }
      // Guarantee that stream start from I frame
      if (this.errorCacheSize != 0 || data.isIDR) {
        this.errorCacheBuffer.set(content, this.mediaCacheSize)
        this.errorCacheSize += content.byteLength
      }

      let start_ts = Date.now()
      let ret = 0
      try {
        ret = Module._decodeData(0, data.frameCnt, cacheBuffer, content_size, resultBuffer)
        // if(ret==8){
        //   // console.log('[][Core][WASM],-abcdefg-----> ', ret)

        //   var ret_close = Module._closeDecoder(0)
        //   // eslint-disable-next-line no-empty
        //   if (ret_close === 0) {
        //     // console.log('[][Core][WASM] decoder closed for restart')
        //   } else {
        //     printConsole.error('close decoder failed after decode pano.')
        //     return 1
        //   }
        //   var ret0 = Module._openDecoder(0, 0, 2)
        //   // console.log('[][Core][WASM] decoder restart success')
        //   // var ret1 = Module._openDecoder(1, decoder_type, LOG_LEVEL_WASM)
        //   if (ret0 === 0) {
        //     ret = Module._decodeData(0, data.frameCnt, cacheBuffer, content_size, resultBuffer)
        //   } else {
        //     printConsole.error('openDecoder failed with error ' + String(ret0) , '5001')
        //     return 1
        //   }
        // }
      } catch (e) {
        console.log('catch error ', e)
        if (this.errorCacheSize > 0) {
          downloadBlob(this.errorCacheBuffer.subarray(0, this.errorCacheSize), 'error.264', 'application/octet-stream')
          this.errorCacheSize = 0
        }
        printConsole.error(e.message, '5002')
      }
      var width = Module.getValue(resultBuffer, 'i32')
      var height = Module.getValue(resultBuffer + 4, 'i32')
      var stride_y = Module.getValue(resultBuffer + 20, 'i32')
      var stride_u = Module.getValue(resultBuffer + 24, 'i32')
      var stride_v = Module.getValue(resultBuffer + 28, 'i32')
      var addr_y = Module.getValue(resultBuffer + 8, 'i32')
      var addr_u = Module.getValue(resultBuffer + 12, 'i32')
      var addr_v = Module.getValue(resultBuffer + 16, 'i32')
      var poc = Module.getValue(resultBuffer + 32, 'i32')
      var pts = data.frameCnt
      if (ret != 0) {
        printConsole.log(
          'Decode Data error for video stream, ret value is ' +
            String(ret) +
            ', frame content size: ' +
            String(content_size),
        )
        if (this.errorCacheSize > 0) {
          downloadBlob(this.errorCacheBuffer.subarray(0, this.errorCacheSize), 'error.264', 'application/octet-stream')
          this.errorCacheSize = 0
        }
        printConsole.log('current poc is ' + String(poc) + ', last poc is ' + String(lastPoc))
        return
      }
      lastPoc = poc
      this.receivedYUV++
      let end_ts = Date.now()
      fdt = end_ts - start_ts
      if (fdt + self.decoder.getFrameInterval > 84) {
        this.JankTimes++
      }
      if (fdt + self.decoder.getFrameInterval > 125) {
        this.bigJankTimes++
      }
      self.decoder.dtpf = self.decoder.dtpf * 0.9 + fdt * 0.1
      // if (fdt > self.decoder.dtmf) {
      //   self.decoder.dtmf = fdt
      // }
      self.decoder.decodeTimeCircular[self.decoder.dtcPtr] = fdt
      self.decoder.dtcPtr = (self.decoder.dtcPtr + 1) % self.decoder.decodeTimeCircular.length

      if (YUVArray.length <= 0) {
        // printConsole.error('No buffer to save YUV after decoding, pts is ' + String(pts), '5002')
        return
      }
      var first_available_buffer = YUVArray.shift()
      var yuv_data = first_available_buffer.buffer

      let pos = 0
      for (let i = 0; i < height; i++) {
        let src = addr_y + i * stride_y
        let tmp = HEAPU8.subarray(src, src + width)
        tmp = new Uint8Array(tmp)
        yuv_data.set(tmp, pos)
        pos += tmp.length
      }
      for (let i = 0; i < height / 2; i++) {
        let src = addr_u + i * stride_u
        let tmp = HEAPU8.subarray(src, src + width / 2)
        tmp = new Uint8Array(tmp)
        yuv_data.set(tmp, pos)
        pos += tmp.length

        let src2 = addr_v + i * stride_v
        let tmp2 = HEAPU8.subarray(src2, src2 + width / 2)
        tmp2 = new Uint8Array(tmp2)
        yuv_data.set(tmp2, pos)
        pos += tmp2.length
      }
      objData = {
        t: MessageEvent.DecodeMessage,
        data: yuv_data,
        width: width,
        height: height,
        pts: data.frameCnt,
        yuv_ts: Date.now(),
        meta: data.meta,
        metadata: data.metadata,
      }
    } else {
      objData = {
        t: MessageEvent.DecodeMessage,
        data: null,
        width: 0,
        height: 0,
        pts: data.frameCnt,
        yuv_ts: Date.now(),
        meta: data.meta,
        metadata: data.metadata,
      }
    }
    if (this.startEmit) {
      if (objData.data != null) {
        self.postMessage(objData, [objData.data.buffer])
        send_out_buffer += 1
        this.receivedEmit++
      } else {
        self.postMessage(objData)
        this.receivedEmit++
      }
    } else {
      if (objData.data != null) {
        cachedFirstFrame = objData
      }
    }
    // if (cacheBuffer != null) {
    //   Module._free(cacheBuffer)
    //   cacheBuffer = null
    // }
    // if (resultBuffer != null) {
    //   Module._free(resultBuffer)
    //   resultBuffer = null
    // }

    return
  }

  Decoder.prototype.receiveBuffer = function (data) {
    framesReturned++
    send_out_buffer -= 1
    YUVArray.push({ status: 0, buffer: data.buffer })
  }

  Decoder.prototype.setPassiveJitter = function (len) {
    this.passiveJitterLength = len
  }

  Decoder.prototype.uninitDecoder = function () {
    printConsole.log('Going to uninit decoder.')
  }

  Decoder.prototype.StartRecord = function () {
    printConsole.log('Start Record')
    this.startRecord = true
  }

  Decoder.prototype.SaveRecord = function () {
    printConsole.log('Save Record')
    this.saveRecord = true
  }

  Decoder.prototype.ReceivePanorama = function (data) {
    self.decoder.resetDecoder()
    self.decoder.decodePanorama(data)
  }

  Decoder.prototype.LoadWASM = function (url) {
    printConsole.log('Load WASM from ' + String(url))
    try {
      self.importScripts(url)
    } catch (e) {
      console.log('catch error ', e)
      printConsole.error(e.message, '5003')
    }
  }

  // self.incoming_pkt_queue = new array()

  function getRandomInt(max) {
    return Math.floor(Math.random() * max)
  }

  // console.log(getRandomInt(30));

  self.decoder = new Decoder()

  netArray = []

  var gTmpIdx = 0
  var gLossCnt = 0
  self.onmessage = function (evt) {
    switch (evt.data.t) {
      case 1: // Init Message
        self.decoder.initAll(evt.data.config)
        break
      case 0: // Decode Message
        // console.log('[][Core][WASM],------> ', evt.data)
        gTmpIdx += 1

        randLen = 16
        // randLen = getRandomInt(30)

        // eslint-disable-next-line no-constant-condition
        if (gTmpIdx > 100 && false) {
          var test_jitter_buffer = true
          if (test_jitter_buffer == true) {
            if (netArray.length % 5 == 4) {
              // netArray.insert(netArray.length -1, evt.data)
              netArray.splice(netArray.length - 1, 0, evt.data)
            } else {
              netArray.push(evt.data)
            }
            if (netArray.length > randLen) {
              // 1. jitter
              while (netArray.length > 0) {
                // console.log("[xmedia] array len: %s", netArray.length)
                gLossCnt += 1

                var pkt = netArray.shift()
                // lose pkt
                var dropInterval = 50
                var dropContinousPkts = 3
                if (gLossCnt % dropInterval < dropContinousPkts) {
                  if (gLossCnt == dropInterval + dropContinousPkts - 1) {
                    gLossCnt = 0
                  }
                } else {
                  self.decoder.receiveFrame(pkt)
                }
              }
              // // 2. disorder
              // if (incoming_pkt_queue.length % 3) {
              //   in[0]
              //   in[2]
              //   in[1]
              // }
            }
          } else {
            self.decoder.receiveFrame(evt.data)
          }
        } else {
          self.decoder.receiveFrame(evt.data)
        }
        break
      case 2: // Receive used buffer
        self.decoder.receiveBuffer(evt.data)
        break
      case 3: // Unint Message
        self.decoder.uninitDecoder()
        break
      case 4: // Reset status
        self.decoder.resetDecoder()
        break
      case 5: // Start emit
        self.decoder.startEmiter()
        break
      case 6: // Start Record
        self.decoder.StartRecord()
        break
      case 7: // Save Record
        self.decoder.SaveRecord()
        break
      case 8: // Panorama Decode Message
        self.decoder.ReceivePanorama(evt.data)
        break
      case 9: // Select WASM Version
        self.decoder.setPassiveJitter(evt.data.jitterLength)
        self.decoder.LoadWASM(evt.data.url)
        break
      case 100: // change decoder worker status
        self.decoder.changeLogSwitch(evt.data.status)
        break
    }
  }
}
`;