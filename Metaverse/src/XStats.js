export default class XStats {
    constructor(e) {
        E(this, "scene");
        E(this, "sceneInstrumentation");
        E(this, "engineInstrumentation");
        E(this, "caps");
        E(this, "engine");
        E(this, "_canvas");
        E(this, "_osversion");
        E(this, "_scenemanager");
        this._scenemanager = e,
        this.scene = e.Scene,
        this._canvas = e.canvas,
        this.initSceneInstrument()
    }
    initSceneInstrument() {
        this.sceneInstrumentation = new BABYLON.SceneInstrumentation(this.scene);
        this.sceneInstrumentation.captureCameraRenderTime = !0;
        this.sceneInstrumentation.captureActiveMeshesEvaluationTime = !0;
        this.sceneInstrumentation.captureRenderTargetsRenderTime = !0;
        this.sceneInstrumentation.captureFrameTime = !0;
        this.sceneInstrumentation.captureRenderTime = !0;
        this.sceneInstrumentation.captureInterFrameTime = !0;
        this.sceneInstrumentation.captureParticlesRenderTime = !0;
        this.sceneInstrumentation.captureSpritesRenderTime = !0;
        this.sceneInstrumentation.capturePhysicsTime = !0;
        this.sceneInstrumentation.captureAnimationsTime = !0;
        this.engineInstrumentation = new BABYLON.EngineInstrumentation(this.scene.getEngine());
        this.caps = this.scene.getEngine().getCaps();
        this.engine = this.scene.getEngine();
        this._osversion = this.osVersion();
    }
    getFrameTimeCounter() {
        return this.sceneInstrumentation.frameTimeCounter.current
    }
    getInterFrameTimeCounter() {
        return this.sceneInstrumentation.interFrameTimeCounter.current
    }
    getActiveMeshEvaluationTime() {
        return this.sceneInstrumentation.activeMeshesEvaluationTimeCounter.current
    }
    getDrawCall() {
        return this.sceneInstrumentation.drawCallsCounter.current
    }
    getDrawCallTime() {
        return this.sceneInstrumentation.renderTimeCounter.current
    }
    getAnimationTime() {
        return this.sceneInstrumentation.animationsTimeCounter.current
    }
    getActiveMesh() {
        return this.scene.getActiveMeshes().length
    }
    getActiveFaces() {
        return Math.round(this.scene.getActiveIndices() / 3)
    }
    getActiveBones() {
        return this.scene.getActiveBones()
    }
    getActiveAnimation() {
        return this.scene._activeAnimatables.length
    }
    getActiveParticles() {
        return this.scene.getActiveParticles()
    }
    getTotalMaterials() {
        return this.scene.materials.length
    }
    getTotalTextures() {
        return this.scene.textures.length
    }
    getTotalGeometries() {
        return this.scene.geometries.length
    }
    getTotalMeshes() {
        return this.scene.meshes.length
    }
    getCameraRenderTime() {
        return this.sceneInstrumentation.cameraRenderTimeCounter.current
    }
    getTotalRootNodes() {
        return this.scene.rootNodes.length
    }
    getRenderTargetRenderTime() {
        const e = this.getDrawCallTime()
          , t = this.getActiveMeshEvaluationTime()
          , r = this.getCameraRenderTime() - (t + e);
        return this.getRTT1Time() + r
    }
    getRegisterBeforeRenderTime() {
        return this.sceneInstrumentation.registerBeforeTimeCounter.current
    }
    getRegisterAfterRenderTime() {
        return this.sceneInstrumentation.registerAfterTimeCounter.current
    }
    getRTT1Time() {
        return this.sceneInstrumentation.getRTT1TimeCounter.current
    }
    getRegisterBeforeRenderObserverLength() {
        return this.scene.onBeforeRenderObservable.observers.length
    }
    getRegisterAfterRenderObserverLength() {
        return this.scene.onAfterRenderObservable.observers.length
    }
    getTotalMeshByType() {
        const e = new Map;
        return this.scene.meshes.forEach(t=>{
            e.has(t.xtype) ? e.set(t.xtype, e.get(t.xtype) + 1) : e.set(t.xtype, 1)
        }
        ),
        e
    }
    getHardwareRenderInfo() {
        return {
            maxTexturesUnits: this.caps.maxTexturesImageUnits,
            maxVertexTextureImageUnits: this.caps.maxVertexTextureImageUnits,
            maxCombinedTexturesImageUnits: this.caps.maxCombinedTexturesImageUnits,
            maxTextureSize: this.caps.maxTextureSize,
            maxSamples: this.caps.maxSamples,
            maxCubemapTextureSize: this.caps.maxCubemapTextureSize,
            maxRenderTextureSize: this.caps.maxRenderTextureSize,
            maxVertexAttribs: this.caps.maxVertexAttribs,
            maxVaryingVectors: this.caps.maxVaryingVectors,
            maxVertexUniformVectors: this.caps.maxVertexUniformVectors,
            maxFragmentUniformVectors: this.caps.maxFragmentUniformVectors,
            standardDerivatives: this.caps.standardDerivatives,
            supportTextureCompress: {
                s3tc: this.caps.s3tc !== void 0,
                s3tc_srgb: this.caps.s3tc_srgb !== void 0,
                pvrtc: this.caps.pvrtc !== void 0,
                etc1: this.caps.etc1 !== void 0,
                etc2: this.caps.etc2 !== void 0,
                astc: this.caps.astc !== void 0,
                bptc: this.caps.bptc !== void 0
            },
            textureFloat: this.caps.textureFloat,
            vertexArrayObject: this.caps.vertexArrayObject,
            textureAnisotropicFilterExtension: this.caps.textureAnisotropicFilterExtension !== void 0,
            maxAnisotropy: this.caps.maxAnisotropy,
            instancedArrays: this.caps.instancedArrays,
            uintIndices: this.caps.uintIndices,
            highPrecisionShaders: this.caps.highPrecisionShaderSupported,
            fragmentDepth: this.caps.fragmentDepthSupported,
            textureFloatLinearFiltering: this.caps.textureFloatLinearFiltering,
            renderToTextureFloat: this.caps.textureFloatRender,
            textureHalfFloat: this.caps.textureHalfFloat,
            textureHalfFloatLinearFiltering: this.caps.textureHalfFloatLinearFiltering,
            textureHalfFloatRender: this.caps.textureHalfFloatRender,
            textureLOD: this.caps.textureLOD,
            drawBuffersExtension: this.caps.drawBuffersExtension,
            depthTextureExtension: this.caps.depthTextureExtension,
            colorBufferFloat: this.caps.colorBufferFloat,
            supportTimerQuery: this.caps.timerQuery !== void 0,
            canUseTimestampForTimerQuery: this.caps.canUseTimestampForTimerQuery,
            supportOcclusionQuery: this.caps.supportOcclusionQuery,
            multiview: this.caps.multiview,
            oculusMultiview: this.caps.oculusMultiview,
            maxMSAASamples: this.caps.maxMSAASamples,
            blendMinMax: this.caps.blendMinMax,
            canUseGLInstanceID: this.caps.canUseGLInstanceID,
            canUseGLVertexID: this.caps.canUseGLVertexID,
            supportComputeShaders: this.caps.supportComputeShaders,
            supportSRGBBuffers: this.caps.supportSRGBBuffers,
            supportStencil: this.engine.isStencilEnable
        }
    }
    getSystemInfo() {
        return {
            resolution: "real: " + this.engine.getRenderWidth() + "x" + this.engine.getRenderHeight() + "	 cavs: " + this._canvas.clientWidth + "x" + this._canvas.clientHeight,
            hardwareScalingLevel: this.engine.getHardwareScalingLevel().toFixed(2).toString() + "_" + this._scenemanager.initEngineScaleNumber.toFixed(2).toString(),
            driver: this.engine.getGlInfo().renderer,
            vender: this.engine.getGlInfo().vendor,
            version: this.engine.getGlInfo().version,
            os: this._osversion
        }
    }
    getFps() {
        const e = this.sceneInstrumentation.frameTimeCounter.lastSecAverage
          , t = this.sceneInstrumentation.interFrameTimeCounter.lastSecAverage;
        return 1e3 / (e + t)
    }
    osVersion() {
        const e = window.navigator.userAgent;
        let t;
        return /iphone|ipad|ipod/gi.test(e) ? t = e.match(/OS (\d+)_(\d+)_?(\d+)?/) : /android/gi.test(e) && (t = e.match(/Android (\d+)/)),
        t != null && t.length > 0 ? t[0] : null
    }
}