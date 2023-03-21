import {http1} from "./Http1.js"
import util from "./util.js"
import Logger from "./Logger.js"
import ParamError from "./error/ParamError.js"

const logger = new Logger('model-manager')
export default class ModelManager{
    constructor(e, t) {
        this.avatarModelList = []
        this.skinList = []
        this.applicationConfig = null;
        this.config = null
        this.appId = e,
        this.releaseId = t
    }
    static getInstance(e, t) {
    //getInstance(e, t) {
        return this.instance || (this.instance = new ModelManager(e,t)),
        this.instance
    }
    static findModels(e, t, r) {
    //findModels(e, t, r) {
        return e.filter(o=>o.typeName === t && o.className === r)
    }
    static findModel(e, t, r) {
    //findModel(e, t, r) {
        const n = e.filter(o=>o.typeName === t && o.className === r)[0];
        return n || null
    }
    async findSkinConfig(skinId) {
        let t = null;
        if (t = (this.skinList = await this.getSkinsList()).find(n=>n.id === skinId),
        t)
            return t;
        {
            const n = `skin is invalid: skinId: ${skinId}`;
            return Promise.reject(new ParamError(n))
        }
    }
    async findRoute(skinId, pathName) {
        const route = (await this.findSkinConfig(skinId)).routeList.find(o=>o.pathName === pathName);
        if (!route) {
            const errMessage = `find path failed: skinId: ${skinId}, pathName: ${pathName}`;
            return Promise.reject(new ParamError(errMessage))
        }
        return logger.debug("find route success", route),
        route
    }
    async findAssetList(e) {
        const r = (await this.findSkinConfig(e)).assetList;
        if (!r) {
            const n = `find path failed: skinId: ${e}`;
            return Promise.reject(new ParamError(n))
        }
        return logger.debug("find route success", r),
        r
    }
    async findAsset(e, t, r="id") {
        const n = await this.findSkinConfig(e);
        if (Array.isArray(t))
            return t.map(a=>n.models.find(s=>s[r] === a)).filter(Boolean);
        const o = n.models.find(a=>a[r] === t);
        if (!o) {
            const a = `find asset failed: skinId: ${e}, keyValue: ${t}`;
            return Promise.reject(new ParamError(a))
        }
        return logger.debug("find asset success", o),
        o
    }
    async findPoint(e, t) {
        const n = (await this.findSkinConfig(e)).pointList.find(o=>o.id === t);
        if (!n) {
            const o = `find point failed: skinId: ${e}, id: ${t}`;
            return Promise.reject(new ParamError(o))
        }
        return logger.debug("find point success", n),
        n
    }
    async requestConfig() {
        if (this.config)
            return this.config;
        // let e = `https://static.xverse.cn/console/config/${this.appId}/config.json`;
        // this.releaseId && (e = `https://static.xverse.cn/console/config/${this.appId}/${this.releaseId}/config.json`);
        // const t = Xverse.USE_TME_CDN ? "https://static.xverse.cn/tmeland/config/tme_config.json" : e;
        const t = './assets/config.json'
        try {
            const r = await http1.get({
                url: `${t}?t=${Date.now()}`,
                key: "config",
                timeout: 6e3,
                retry: 2
            });

            const {config: n, preload: o} = r.data.data || {};
            if (!n)
                throw new Error("config data parse error" + r.data);
            return this.config = {
                config: n,
                preload: o
            },
            logger.debug("get config success", this.config),
            this.config
        } catch (r) {
            return Promise.reject(r)
        }
    }
    async getApplicationConfig() {
        if (this.applicationConfig)
            return this.applicationConfig;
        try {
            const e = await this.requestConfig();
            return this.applicationConfig = e.config,
            this.applicationConfig
        } catch (e) {
            return Promise.reject(e)
        }
    }
    async getAvatarModelList() {
        if (this.avatarModelList.length)
            return this.avatarModelList;
        try {
            const {avatars: e} = await this.getApplicationConfig();
            return this.avatarModelList = e.map(t=>({
                name: t.name,
                id: t.id,
                modelUrl: t.url,
                gender: t.gender,
                components: t.components
            })),
            this.avatarModelList
        } catch (e) {
            return logger.error(e),
            []
        }
    }
    async getSkinsList() {
        if (this.skinList.length)
            return this.skinList;
        try {
            const {skins: e} = await this.getApplicationConfig();
            return this.skinList = e.map(t=>{
                var r;
                return {
                    name: t.name,
                    dataVersion: t.id + t.versionId,
                    id: t.id,
                    fov: parseInt(t.fov || 90),
                    models: t.assetList.map(n=>{
                        const {assetId: o, url: a, thumbnailUrl: s, typeName: l, className: u} = n;
                        return {
                            id: o,
                            modelUrl: a,
                            name: n.name,
                            thumbnailUrl: s,
                            typeName: l,
                            className: u === "\u4F4E\u6A21" ? "\u7C97\u6A21" : u    //低模    粗模
                        }
                    }
                    ),
                    routeList: (r = t.routeList) == null ? void 0 : r.map(n=>{
                        const {areaName: o, attitude: a, id: s, pathName: l, step: u, birthPointList: c} = n;
                        return {
                            areaName: o,
                            attitude: a,
                            id: s,
                            pathName: l,
                            step: u,
                            birthPointList: c.map(h=>({
                                camera: h.camera && {
                                    position: util.objectParseFloat(h.camera.position),
                                    angle: util.objectParseFloat(h.camera.rotation)
                                },
                                player: h.player && {
                                    position: util.objectParseFloat(h.player.position),
                                    angle: util.objectParseFloat(h.player.rotation)
                                }
                            }))
                        }
                    }
                    ),
                    pointList: t.pointList.map(n=>le(oe({}, n), {
                        position: util.objectParseFloat(n.position),
                        rotation: util.objectParseFloat(n.rotation)
                    })),
                    versionId: t.versionId,
                    isEnable: t.isEnable,
                    assetList: t.assetList,
                    visibleRules: t.visibleRules,
                    animationList: t.animationList
                }
            }
            ),
            this.skinList
        } catch (e) {
            return logger.error(e),
            []
        }
    }
    async getBreathPointTextrueList() {
        return [{
            url: TEXTURE_URL
        }]
    }
};

// const modelManager = new ModelManager();
// export { modelManager };
