export default {
  fileType: ".glb",
  lodType: "_lod",
  lod: [
    {
      level: "lod0",
      fileName: ".glb",
      quota: 5,
      dist: 1e3,
    },
    {
      level: "lod1",
      fileName: "_lod2.glb",
      quota: 5,
      dist: 2e3,
    },
    {
      level: "lod2",
      fileName: "_lod4.glb",
      quota: 0,
      dist: 7500,
    },
  ],
  isRayCastEnable: !0,
  maxAvatarNum: 40,
  maxBillBoardDist: 7500,
  body: "body",
  head: "head",
  hair: "hair",
  suit: "suit",
  pants: "pants",
  shoes: "shoes",
  clothes: "clothes",
  animations: "animations",
  defaultIdle: "Idle",
  cullingDistance: 200,
  defaultMove: "Walking",
};

