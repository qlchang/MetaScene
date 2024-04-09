import XVideoRawYUV from "./XVideoRawYUV";
import Logger from "./Logger.js";
import XMaterialError from "./Error/XMaterialError";

const logger = new Logger("Material");
export default class XMaterialComponent {
  constructor(sceneManager, t) {
    this.yuvInfo
    this._panoInfo
    this._dynamic_size
    this._videoTexture
    this._videoElement
    this._lowModelShader
    this._defaultShader
    this._inputYUV420 = !0
    this._inputPanoYUV420 = !0
    this._isUpdateYUV = !0

    this._scenemanager = sceneManager
    this.scene = sceneManager.Scene
    this.engine = this.scene.getEngine()
    this.shaderMode = 1
    this._dynamic_textures = []
    this._dynamic_shaders = []
    this._dynamic_babylonpose = []
    this._videoRawYUVTexArray = new XVideoRawYUV(
      this.scene,
      t.videoResOriArray
    )
    this.shaderMode = t.shaderMode
    t.yuvInfo && (this.yuvInfo = t.yuvInfo),
    t.panoInfo && this.setPanoInfo(t.panoInfo);
  }

  initMaterial = async () => {
    return new Promise((resolve, t) => {
      this._initDefaultShader();
      if (this.shaderMode == 2) {
        this.initDynamicData(
          this._panoInfo.dynamicRange,
          this._panoInfo.width,
          this._panoInfo.height
        ).then(() => {
          this._initPureVideoShader();
          this._prepareRender(this.yuvInfo);
        });
      } else if (this.shaderMode == 1) {
        this._initPureVideoShader();
        this._prepareRender(this.yuvInfo);
      }
      // else if(this.shaderMode == 0){
      //     resolve(!0)
      // }
      resolve(!0);
      // this.shaderMode == 2 ? this.initDynamicData(this._panoInfo.dynamicRange, this._panoInfo.width, this._panoInfo.height).then(()=>{
      //     this._initPureVideoShader(),
      //     this._prepareRender(this.yuvInfo)
      // }
      // ) : this.shaderMode == 1 ? (this._initPureVideoShader(),
      // this._prepareRender(this.yuvInfo)) : this.shaderMode == 0,
      // resolve(!0)
    })
  }

  _initPureVideoContent = (focal_width_height) => {
    if (this._inputYUV420) {
      if (this._videoRawYUVTexArray.getVideoYUVTex(0) != null) {
        this._lowModelShader.setTexture(
          "texture_video",
          this._videoRawYUVTexArray.getVideoYUVTex(0)
        );
        this._lowModelShader.setFloat("isYUV", 1);
        BABYLON.Texture.WhenAllReady(
          [this._videoRawYUVTexArray.getVideoYUVTex(0)],
          () => {
            this._changePureVideoLowModelShaderCanvasSize(focal_width_height);
          }
        );
      }
    }
    // else{
    //     this._videoElement = e.videoElement;
    //     this._videoTexture || (this._videoTexture = new VideoTexture("InterVideoTexture",this._videoElement,this.scene,!0,!1));
    //     BABYLON.Texture.WhenAllReady([this._videoTexture], ()=>{
    //         this._changePureVideoLowModelShaderCanvasSize({
    //             width: this._videoElement.height,
    //             height: this._videoElement.width,
    //             fov: e.fov
    //         })
    //     });
    //     this._lowModelShader.setTexture("texture_video", this._videoTexture);
    //     this._lowModelShader.setFloat("isYUV", 0);
    // }
  }

  _changePureVideoLowModelShaderCanvasSize = (e) => {
    var lowModelShader;
    const fov = e.fov || 50;
    const width = e.width || 720;
    const height = e.height || 1280;
    const focus = width / (2 * Math.tan((Math.PI * fov) / 360));
    (lowModelShader = this._lowModelShader) == null ||
      lowModelShader.setVector3(
        "focal_width_height",
        new BABYLON.Vector3(focus, width, height)
      );
  }

  updateRawYUVData = (stream, width, height, fov = -1) => {
    fov == -1 && (fov = this.yuvInfo.fov);

    if (this._isUpdateYUV == !0) {
      //console.log('执行：updateRawYUVData')
      const yuvInfo = { width, height, fov }
      const videosResOriArrayIndex = this._videoRawYUVTexArray.findId(width, height)
      const currentVideoId = this._videoRawYUVTexArray.getCurrentVideoTexId();

      if (currentVideoId < 0 || videosResOriArrayIndex != currentVideoId || fov != this.yuvInfo.fov) {
        this.yuvInfo.width = width;
        this.yuvInfo.height = height;
        this.yuvInfo.fov = fov;

        this._videoRawYUVTexArray.setCurrentVideoTexId(videosResOriArrayIndex);
        this._changeVideoRes(videosResOriArrayIndex);   // 设置texture_video
        this._changePureVideoLowModelShaderCanvasSize(yuvInfo); // 设置focal_width_height
        this._scenemanager.cameraComponent.cameraFovChange(yuvInfo);
        this._scenemanager.yuvInfo = yuvInfo;
      }

      let VideoTexture = this._videoRawYUVTexArray.getVideoYUVTex(videosResOriArrayIndex)
      if (VideoTexture != null) {
        // 更新视频流
        VideoTexture.update(stream)
        VideoTexture.updateSamplingMode(BABYLON.Texture.BILINEAR_SAMPLINGMODE)
      }

      //var o, a
      //(o = this._videoRawYUVTexArray.getVideoYUVTex(videosResOriArrayIndex)) == null || o.update(stream),
      //(a = this._videoRawYUVTexArray.getVideoYUVTex(videosResOriArrayIndex)) == null || a.updateSamplingMode(BABYLON.Texture.BILINEAR_SAMPLINGMODE)
    }
  }

  _changeVideoRes = (e) => {
    this._lowModelShader.setTexture(
      "texture_video",
      this._videoRawYUVTexArray.getVideoYUVTex(e)
    );
  }

  initDynamicData = (dynamicRange, width, height) => {
    return new Promise((resolve, reject) => {
      this.setDynamicSize(dynamicRange).then((a) => {
        if (a) {
          for (let s = 0; s < dynamicRange; ++s)
            ((l) => {
              this.initDynamicTexture(l, width, height),
                this.initDynamicShaders(l).then(() => {
                  this._updatePanoShaderInput(l);
                });
            })(s);
          resolve(!0);
        } else
          reject(
            new XMaterialError(
              `[Engine] DynamicRoomSize (${dynamicRange}) is too small`
            )
          );
      });
    }).catch((n) => logger.error(`[Engine] ${n}`))
  }

  _initDefaultShader = () => {
    if(this._defaultShader == null) {
      this._defaultShader = new BABYLON.GridMaterial(
        "GridShader",
        this.scene
      )
      this._defaultShader.gridRatio = 50
      this._defaultShader.lineColor = new BABYLON.Color3(0, 0, 0.5)
      this._defaultShader.majorUnitFrequency = 1
      this._defaultShader.mainColor = new BABYLON.Color3(0.6, 0.6, 0.6)
      this._defaultShader.backFaceCulling = !1
    }
  }

  _initPureVideoShader = () => {
    if (this._lowModelShader == null) {
      const material = new BABYLON.ShaderMaterial(
        "PureVideoShader",
        this.scene, {
          vertexSource: pureVideoVertex,
          fragmentSource: pureVideoFragment,
        }, {
          attributes: ["uv", "position", "world0", "world1", "world2", "world3"],
          uniforms: ["view", "projection", "worldViewProjection", "world"],
          defines: ["#define SHADOWFULLFLOAT"],
        }
      );
      material.setTexture("shadowSampler", null)
      material.setMatrix("lightSpaceMatrix", null)
      material.setFloat("haveShadowLight", 0)
      material.setTexture("texture_video", null)
      material.setFloat("isYUV", this._inputYUV420 ? 1 : 0)
      material.setFloat("fireworkLight", 0)
      material.setVector3("fireworkLightPosition", new BABYLON.Vector3(0, 0, 0))
      material.setVector3(
        "focal_width_height",
        new BABYLON.Vector3(772.022491, 720, 1280)
      )
      material.backFaceCulling = !1
      
      this._lowModelShader = material
    }
  }

  setDynamicSize = (e) => {
    return new Promise((t, r) => {
      e >= 1 && e <= 100
        ? ((this._dynamic_size = e), t(!0))
        : ((this._dynamic_size = 1), t(!1));
    })
  }

  _isInDynamicRange = (e) => {
    return e < this._dynamic_size && e >= 0
  }

  initDynamicTexture = (e, t, r) => {
    this._isInDynamicRange(e) &&
      (
        this._dynamic_textures[e] != null && (
          this._dynamic_textures[e].dispose(),
          (this._dynamic_textures[e] = null)
        ), (
          this._dynamic_textures[e] = new BABYLON.RawTexture(
            null,
            t,
            r * 1.5,
            BABYLON.Engine.TEXTUREFORMAT_LUMINANCE,
            this.scene,
            !1,
            !0,
            BABYLON.Texture.NEAREST_SAMPLINGMODE,
            BABYLON.Engine.TEXTURETYPE_UNSIGNED_BYTE
          )
        ), (
          this._dynamic_textures[e].name =
          "Pano_Dynamic_" + e + "_" + Date.now()
        )
      );
  }

  initDynamicShaders = (e) => {
    logger.info("[Engine] Material init dynamic shader.")
    return new Promise((resolve, r) => {
      this._dynamic_shaders[e] != null && this._dynamic_shaders[e].dispose();

      const material = new BABYLON.ShaderMaterial(
        "Pano_Shader_" + e,
        this.scene, {
          vertexSource: panoVertex,
          fragmentSource: panoFragment,
        }, {
          attributes: ["uv", "position", "world0", "world1", "world2", "world3"],
          uniforms: ["view", "projection", "worldViewProjection", "world"],
          defines: ["#define SHADOWFULLFLOAT"],
        }
      );
      material.setTexture("texture_pano", null)
      material.setVector3("centre_pose", new BABYLON.Vector3(0, 0, 0))
      material.setFloat("isYUV", this._inputPanoYUV420 ? 1 : 0)
      material.setTexture("shadowSampler", null)
      material.setMatrix("lightSpaceMatrix", null)
      material.setFloat("haveShadowLight", 0)
      material.setFloat("fireworkLight", 0)
      material.setVector3("fireworkLightPosition", new BABYLON.Vector3(0, 0, 0))
      material.backFaceCulling = !1

      this._dynamic_shaders[e] = material
      resolve(!0);
    })
  }

  stopYUVUpdate() {
    this._isUpdateYUV = !1;
  }
  allowYUVUpdate() {
    this._isUpdateYUV = !0;
  }
  setPanoInfo(e) {
    this._panoInfo = e;
  }
  _prepareRender(focal_width_height) {
    if (focal_width_height) {
      this._initPureVideoContent(focal_width_height);
      this._updatePureVideoShaderInput();
    }
  }
  getPureVideoShader() {
    return this._lowModelShader;
  }
  getDefaultShader() {
    return this._defaultShader;
  }
  updatePanoPartYUV(e, t, r) {
    const n = t.subarray(0, r.width * r.height),
      o = t.subarray(r.width * r.height, r.width * r.height * 1.25),
      a = t.subarray(r.width * r.height * 1.25),
      s = this._panoInfo.width,
      l = this._panoInfo.height;
    if (this._dynamic_textures[e] != null) {
      const u = this._dynamic_textures[e].getInternalTexture();
      if (u != null && u != null) {
        const c = this.engine._getTextureTarget(u);
        this.engine._bindTextureDirectly(c, u, !0),
          this.engine.updateTextureData(
            u,
            n,
            r.startX,
            l * 1.5 - r.startY - r.height,
            r.width,
            r.height
          ),
          this.engine.updateTextureData(
            u,
            o,
            r.startX * 0.5,
            (l - r.startY - r.height) * 0.5,
            r.width * 0.5 - 1,
            r.height * 0.5 - 1
          ),
          this.engine.updateTextureData(
            u,
            a,
            r.startX * 0.5 + s * 0.5,
            (l - r.startY - r.height) * 0.5,
            r.width * 0.5,
            r.height * 0.5
          ),
          this.engine._bindTextureDirectly(c, null);
      }
    }
  }
  changePanoImg(e, t) {
    if (
      (logger.info(
        `[Engine] changePanoImg, id=${e}, pose=${t.pose.position.x},${t.pose.position.y},${t.pose.position.z}`
      ),
        !this._isInDynamicRange(e))
    )
      return (
        logger.error(
          `[Engine] ${e} is bigger than dynamic size set in PanoInfo`
        ),
        Promise.reject(
          new XMaterialError(
            `[Engine] ${e} is bigger than dynamic size set in PanoInfo`
          )
        )
      );
    const r = ue4Position2Xverse(t.pose.position);
    return (
      r &&
      (this._dynamic_babylonpose[e] = {
        position: r,
      }),
      new Promise((n, o) => {
        try {
          typeof t.data == "string"
            ? (this.setPanoYUV420(!1),
              this._dynamic_textures[e].updateURL(t.data, null, () => {
                this._dynamic_textures[e].updateSamplingMode(
                  BABYLON.Texture.NEAREST_SAMPLINGMODE
                );
              }))
            : (this.isPanoYUV420() == !1 &&
              this.initDynamicTexture(
                e,
                this._panoInfo.width,
                this._panoInfo.height
              ),
              this.setPanoYUV420(!0),
              this._dynamic_textures[e].update(t.data),
              this._dynamic_textures[e].updateSamplingMode(
                BABYLON.Texture.NEAREST_SAMPLINGMODE
              )),
            n(this);
        } catch (a) {
          o(new XMaterialError(`[Engine] ChangePanoImg Error! ${a}`));
        }
      }).then(
        (n) => (
          t.fov != null &&
          this._scenemanager.cameraComponent.changeCameraFov(
            (t.fov * Math.PI) / 180
          ),
          this._dynamic_shaders[e].setFloat(
            "isYUV",
            this._inputPanoYUV420 ? 1 : 0
          ),
          this._dynamic_shaders[e].setTexture(
            "texture_pano",
            this._dynamic_textures[e]
          ),
          this._dynamic_shaders[e].setVector3(
            "centre_pose",
            this._dynamic_babylonpose[e].position
          ),
          !0
        )
      )
    );
  }
  setYUV420(e) {
    this._inputYUV420 = e;
  }
  isYUV420() {
    return this._inputYUV420;
  }
  setPanoYUV420(e) {
    this._inputPanoYUV420 = e;
  }
  isPanoYUV420() {
    return this._inputPanoYUV420;
  }
  getDynamicShader(e) {
    return this._dynamic_shaders[e];
  }
  _updatePureVideoShaderInput() {
    /*
        var e, t, r, n, o, a, s, l, u, c;

        if(this.scene.getLightByName("AvatarLight")){
            (e = this._lowModelShader) == null || e.setFloat("haveShadowLight", 1);

            n = this._lowModelShader
            if(n != null){
                t = this.scene.getLightByName("AvatarLight")
                if(t == null){
                    r = void 0
                }
                else{
                    r = t.getShadowGenerator()
                }

                if(r == null){
                    n.setTexture("shadowSampler",void 0)
                }
                else{
                    n.setTexture("shadowSampler",r.getShadowMapForRendering())
                }
            }

            //(n = this._lowModelShader) == null || n.setTexture("shadowSampler", (r = (t = this.scene.getLightByName("AvatarLight")) == null ? void 0 : t.getShadowGenerator()) == null ? void 0 : r.getShadowMapForRendering());

            s = this._lowModelShader
            if(s != null){
                o = this.scene.getLightByName("AvatarLight")
                if(o == null){
                    a = void 0
                }
                else{
                    a = o.getShadowGenerator()
                }

                if(a == null){
                    s.setMatrix("lightSpaceMatrix",void 0)
                }
                else{
                    s.setMatrix("lightSpaceMatrix",a.getTransformMatrix())
                }
            }
            //(s = this._lowModelShader) == null || s.setMatrix("lightSpaceMatrix", (a = (o = this.scene.getLightByName("AvatarLight")) == null ? void 0 : o.getShadowGenerator()) == null ? void 0 : a.getTransformMatrix())
        }
        else{
            (l = this._lowModelShader) == null || l.setTexture("shadowSampler", this._videoTexture);
            (u = this._lowModelShader) == null || u.setMatrix("lightSpaceMatrix", new Matrix);
            (c = this._lowModelShader) == null || c.setFloat("haveShadowLight", 0);
        }
        */

    let lowModelShader = this._lowModelShader;
    if (lowModelShader != null) {
      if (this.scene.getLightByName("AvatarLight")) {
        lowModelShader.setFloat("haveShadowLight", 1);

        let avatarLight = this.scene.getLightByName("AvatarLight");
        let shadow = void 0;
        if (avatarLight != null) {
          shadow = avatarLight.getShadowGenerator();
        }

        if (shadow == null) {
          lowModelShader.setTexture("shadowSampler", void 0);
          lowModelShader.setMatrix("lightSpaceMatrix", void 0);
        } else {
          lowModelShader.setTexture(
            "shadowSampler",
            shadow.getShadowMapForRendering()
          );
          lowModelShader.setMatrix(
            "lightSpaceMatrix",
            shadow.getTransformMatrix()
          );
        }
      } else {
        lowModelShader.setTexture("shadowSampler", this._videoTexture);
        lowModelShader.setMatrix("lightSpaceMatrix", new Matrix());
        lowModelShader.setFloat("haveShadowLight", 0);
      }
    }

    if (this.scene.getLightByName("fireworkLight")) {
      this.scene.registerBeforeRender(() => {
        this._lowModelShader.setFloat(
          "fireworkLight",
          this.scene.getLightByName("fireworkLight").getScaledIntensity()
        );
        var fireworkLight = this.scene.getLightByName("fireworkLight");
        if (fireworkLight == null) {
          this._lowModelShader.setVector3("fireworkLightPosition", void 0);
        } else {
          this._lowModelShader.setVector3(
            "fireworkLightPosition",
            fireworkLight.position
          );
        }
        //this._lowModelShader.setVector3("fireworkLightPosition", (h = this.scene.getLightByName("fireworkLight")) == null ? void 0 : h.position);
      });
    } else {
      const pointLight = new BABYLON.PointLight(
        "fireworkLight",
        new BABYLON.Vector3(0, 0, 0),
        this.scene
      );
      pointLight.intensity = 0;
    }
  }

  _updatePanoShaderInput(e) {
    var n, s;
    if (this._isInDynamicRange(e)) {
      let shader = this._dynamic_shaders[e]
      let avatarLight = this.scene.getLightByName("AvatarLight")

      shader == null || (avatarLight ? (
        shader.setFloat("haveShadowLight", 1),
        shader.setTexture("shadowSampler", (n = avatarLight == null ? void 0 : avatarLight.getShadowGenerator()) == null ? void 0 : n.getShadowMapForRendering()),
        shader.setMatrix("lightSpaceMatrix", (s = avatarLight == null ? void 0 : avatarLight.getShadowGenerator()) == null ? void 0 : s.getTransformMatrix())
      ) : (
        shader.setTexture("shadowSampler", null),
        shader.setMatrix("lightSpaceMatrix", new Matrix),
        shader.setFloat("haveShadowLight", 0)
      ))

      let fireworkLight = this.scene.getLightByName("fireworkLight")
      if (fireworkLight) {
        this.scene.registerBeforeRender(() => {
          shader.setFloat("fireworkLight", fireworkLight.getScaledIntensity()),
            shader.setVector3("fireworkLightPosition", fireworkLight == null ? void 0 : fireworkLight.position)
        });
      } else {
        const f = new BABYLON.PointLight("fireworkLight", new BABYLON.Vector3(0, 0, 0), this.scene);
        f.intensity = 0
      }
    }
  }
}