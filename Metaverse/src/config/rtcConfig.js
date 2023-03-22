export default {
  WASM_Version: "h264",
  DECODER_VERSION: "v0.9.3",
  WASM_URLS: {
    h264: "https://metaverse.4dage.com/wasm/lib_ff264dec_no_idb_with_wasm_tbundle.js",
    xv265:
      "https://metaverse.4dage.com/wasm/libxv265dec.js",
    h265: "",
  },
  STUCK_STAGE_GOOD: 45,
  STUCK_STAGE_WELL: 85,
  STUCK_STAGE_FAIR: 125,
  STUCK_STAGE_BAD: 165,
  DECODER_PASSIVE_JITTER: 0,
};
