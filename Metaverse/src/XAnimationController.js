import {avatarLoader} from "./XAvatarLoader.js"
import AvatarAnimationError from "./error/AvatarAnimationError.js"
import Logger from "./Logger.js"

const logger = new Logger('AnimationController')
export default class XAnimationController {
    constructor(avatar) {
        this.iBodyAnim = void 0,
        this.animations = [],
        this.defaultAnimation = "Idle",
        this.onPlay = "Idle",
        this.loop = !0,
        this.animationExtras = [],
        this.enableBlend = !1,
        this.enableSkLod = !1,
        this._boneMap = new Map,
        this._lodMask = new Map,
        this.activeFaceAnimation = void 0,
        this.iFaceAnim = void 0,
        this.onPlayObservable = new Observable,

        this._avatar = avatar,
        this._scene = avatar.avatarManager.scene,
        this.animationExtras.push(action.Cheering.animName),
        this._boneMap = new Map
    }
    
    // aniType :0 身体动画 :1 脸部动画
    playAnimation = (animationName, isLoop, aniType=0, c, d, _)=>new Promise((resolve, reject)=>{
        // zeg 传入i为任意动画名即可播放该动画，比如"GiftClap"
        // window.room.avatarManager.avatars.get(window.room.userId).playAnimation({"animationName": "GiftClap", "loop":true})
        if (
            this._isPlaying(animationName, aniType) || 
            (this._registerAnimInfo(animationName, isLoop, aniType, c, d, _), !this._isAnimate())
        ) 
        return resolve(null);

        this._prerocess(animationName, isLoop),
        this._avatar.avatarManager.loadAnimation(this._avatar.avatarType, animationName).then(skeleton => {
            if (!skeleton) return reject(new AvatarAnimationError("animation group does not exist"));

            // skeleton是AnimationGroup类型
            skeleton = this._mappingSkeleton(skeleton);
            if (!skeleton) return reject(new AvatarAnimationError("mapping animation failed"))
            
            if (skeleton && this._isAnimationValid(skeleton))
                return skeleton.dispose(),
                reject(new AvatarAnimationError("mapping animation failed"));

            this.enableSkLod && this.skeletonMask(skeleton, aniType)
            this.detachAnimation(aniType)   // 停止当前动画
            aniType == 0 && (this.iBodyAnim.animGroup = skeleton) 
            aniType == 1 && (this.iFaceAnim.animGroup = skeleton)

            if (!this._playAnimation(aniType)) return reject(
                new AvatarAnimationError("[Engine] play animation failed, animtion resource does not match current character"));
            
            this._playEffect(),
            this.postObserver = skeleton.onAnimationEndObservable.addOnce(()=>(
                this._postprocess(aniType),
                resolve(null)
            ))
        })
    })
    
    stopAnimation = (i=0)=>{
        var o, s, c, d;
        switch (i) {
        case 0:
            this.iBodyAnim && this.iBodyAnim.animGroup && ((o = this.iBodyAnim) == null || o.animGroup.stop());
            break;
        case 1:
            this.iFaceAnim && this.iFaceAnim.animGroup && ((s = this.iFaceAnim) == null || s.animGroup.stop());
            break;
        case 2:
            this.iBodyAnim && this.iBodyAnim.animGroup && ((c = this.iBodyAnim) == null || c.animGroup.stop()),
            this.iFaceAnim && this.iFaceAnim.animGroup && ((d = this.iFaceAnim) == null || d.animGroup.stop());
            break
        }
    }
    
    pauseAnimation = (i=0)=>{
        var o, s, c, d;
        switch (i) {
        case 0:
            this.iBodyAnim && this.iBodyAnim.animGroup && ((o = this.iBodyAnim) == null || o.animGroup.pause());
            break;
        case 1:
            this.iFaceAnim && this.iFaceAnim.animGroup && ((s = this.iFaceAnim) == null || s.animGroup.pause());
            break;
        case 2:
            this.iBodyAnim && this.iBodyAnim.animGroup && ((c = this.iBodyAnim) == null || c.animGroup.pause()),
            this.iFaceAnim && this.iFaceAnim.animGroup && ((d = this.iFaceAnim) == null || d.animGroup.pause());
            break
        }
    }

    resetAnimation = (i=0)=>{
        var o, s, c, d;
        switch (i) {
        case 0:
            this.iBodyAnim && this.iBodyAnim.animGroup && ((o = this.iBodyAnim) == null || o.animGroup.reset());
            break;
        case 1:
            this.iFaceAnim && this.iFaceAnim.animGroup && ((s = this.iFaceAnim) == null || s.animGroup.reset());
            break;
        case 2:
            this.iBodyAnim && this.iBodyAnim.animGroup && ((c = this.iBodyAnim) == null || c.animGroup.reset()),
            this.iFaceAnim && this.iFaceAnim.animGroup && ((d = this.iFaceAnim) == null || d.animGroup.reset());
            break
        }
    }

    _isPlaying(e, i) {
        return i == 0 && this.iBodyAnim != null && this.iBodyAnim.animGroup && e == this.iBodyAnim.name ? !0 : !!(i == 1 && this.iFaceAnim != null && this.iFaceAnim.animGroup && e == this.iFaceAnim.name)
    }
    activeAnimation(e=0) {
        var i, o;
        switch (e) {
        case 0:
            return (i = this.iBodyAnim) == null ? void 0 : i.animGroup;
        case 1:
            return (o = this.iFaceAnim) == null ? void 0 : o.animGroup;
        default:
            return
        }
    }
    enableAnimationBlend(e=.1, i=0) {
        var o, s, c, d;
        if (i == 0 && ((o = this.iBodyAnim) == null ? void 0 : o.animGroup))
            for (const _ of (s = this.iBodyAnim) == null ? void 0 : s.animGroup.targetedAnimations)
                _.animation.enableBlending = !0,
                _.animation.blendingSpeed = e;
        else if (i == 0 && ((c = this.iFaceAnim) == null ? void 0 : c.animGroup))
            for (const _ of (d = this.iFaceAnim) == null ? void 0 : d.animGroup.targetedAnimations)
                _.animation.enableBlending = !0,
                _.animation.blendingSpeed = e
    }
    disableAnimationBlend(e=0) {
        var i, o, s, c;
        if (e == 0 && ((i = this.iBodyAnim) == null ? void 0 : i.animGroup))
            for (const d of (o = this.iBodyAnim) == null ? void 0 : o.animGroup.targetedAnimations)
                d.animation.enableBlending = !1;
        else if (e == 0 && ((s = this.iFaceAnim) == null ? void 0 : s.animGroup))
            for (const d of (c = this.iFaceAnim) == null ? void 0 : c.animGroup.targetedAnimations)
                d.animation.enableBlending = !1
    }
    skeletonMask(e, aniType=0) {
        if (aniType == 0) {
            const o = this._lodMask.get(this._avatar.distLevel);
            if (o)
                for (let s = 0; s < e.targetedAnimations.length; ++s)
                    o.includes(e.targetedAnimations[s].target.name) || (
                        e.targetedAnimations.splice(s, 1),
                        s--
                    );
            return !0
        }
        return !1
    }
    detachAnimation(aniType=2) {
        switch (aniType) {
        case 0:
            // 身体动画
            this.iBodyAnim && this.iBodyAnim.animGroup && (
                this.iBodyAnim.animGroup._parentContainer.xReferenceCount && this.iBodyAnim.animGroup._parentContainer.xReferenceCount--,
                this.iBodyAnim.animGroup.stop(),
                this.iBodyAnim.animGroup.dispose(),
                this.iBodyAnim.animGroup = void 0
            );
            break;
        case 1:
            // 脸部动画
            this.iFaceAnim && this.iFaceAnim.animGroup && (
                this.iFaceAnim.animGroup._parentContainer.xReferenceCount && this.iFaceAnim.animGroup._parentContainer.xReferenceCount--,
                this.iFaceAnim.animGroup.stop(),
                this.iFaceAnim.animGroup.dispose(),
                this.iFaceAnim.animGroup = void 0
            );
            break;
        case 2:
            this.iBodyAnim && this.iBodyAnim.animGroup && (
                this.iBodyAnim.animGroup._parentContainer.xReferenceCount && this.iBodyAnim.animGroup._parentContainer.xReferenceCount--,
                this.iBodyAnim.animGroup.stop(),
                this.iBodyAnim.animGroup.dispose(),
                this.iBodyAnim.animGroup = void 0
            ),
            this.iFaceAnim && this.iFaceAnim.animGroup && (
                this.iFaceAnim.animGroup._parentContainer.xReferenceCount && this.iFaceAnim.animGroup._parentContainer.xReferenceCount--,
                this.iFaceAnim.animGroup.stop(),
                this.iFaceAnim.animGroup.dispose(),
                this.iFaceAnim.animGroup = void 0
            );
            break
        }
    }
    blendAnimation() {}
    getAnimation(e, i) {
        return avatarLoader.animations.get(getAnimationKey(i, e))
    }
    _mappingSkeleton(animationGroup) {
        if (animationGroup) {
            const animationGroupClone = animationGroup.clone(animationGroup.name, boneOld => {
                const name = boneOld.name.split(" ").length > 2 ? boneOld.name.split(" ")[2] : boneOld.name;
                if (this._boneMap.size === (this._avatar.skeleton && this._avatar.skeleton.bones.length)) return this._boneMap.get(name);
                {
                    let bone0 = this._avatar.skeleton && 
                                this._avatar.skeleton.bones.find(bone => bone.name === boneOld.name || bone.name === boneOld.name.split(" ")[2])
                    const bone = bone0 && bone0.getTransformNode();
                    bone && (
                        bone.name = name,
                        this._boneMap.set(name, bone)
                    )
                    return bone
                }
            });
            animationGroupClone._parentContainer = animationGroup._parentContainer
            return animationGroupClone
        } else
            return
    }
    removeAnimation(e) {
        const i = avatarLoader.containers.get(e.name);
        i && (i.dispose(),
        avatarLoader.containers.delete(e.name),
        avatarLoader.animations.delete(getAnimationKey(e.name, e.skType)))
    }
    _setPosition(e, i) {
        this._avatar.priority === 0 && this._avatar.isRender && e === this.defaultAnimation && e != this.onPlay && !this._avatar.isSelected && this._avatar.setPosition(this._avatar.position, !0)
    }
    _registerAnimInfo(e, i, o=0, s, c, d) {
        const _ = {
            name: e,
            skType: this._avatar.avatarType,
            loop: i,
            playSpeed: s,
            currentFrame: 0,
            startFrame: c,
            endFrame: d
        };
        o == 0 ? this.iBodyAnim == null ? this.iBodyAnim = _ : (this.iBodyAnim.name = e,
        this.iBodyAnim.skType = this._avatar.avatarType,
        this.iBodyAnim.loop = i,
        this.iBodyAnim.playSpeed = s,
        this.iBodyAnim.currentFrame = 0,
        this.iBodyAnim.startFrame = c,
        this.iBodyAnim.endFrame = d) : o == 1 && (this.iFaceAnim == null ? this.iFaceAnim = _ : (this.iFaceAnim.name = e,
        this.iFaceAnim.skType = this._avatar.avatarType,
        this.iFaceAnim.loop = i,
        this.iFaceAnim.playSpeed = s,
        this.iFaceAnim.currentFrame = 0,
        this.iFaceAnim.startFrame = c,
        this.iFaceAnim.endFrame = d)),
        this.onPlay = e,
        this.loop = i
    }
    _isAnimate() {
        var e;
        return !(!this._avatar.isRender || !this._avatar.skeleton || ((e = this._avatar.rootNode) == null ? void 0 : e.getChildMeshes().length) == 0)
    }
    _prerocess(animationName, isLoop) {
        this._avatar.isRayCastEnable && this._setPosition(animationName, isLoop),
        this._avatar.priority === 0 && logger.info(`start play animation: ${animationName} on avatar ${this._avatar.id}`)
    }
    _playEffect() {
        this.animationExtras.indexOf(this.iBodyAnim.name) != -1 && action.Cheering.attachPair.forEach(i=>{
            this._avatar.attachExtraProp(i.obj, i.bone, new Vector3(i.offset.x,i.offset.y,i.offset.z), new Vector3(i.rotate.x,i.rotate.y,i.rotate.z)),
            this._avatar.showExtra(i.obj)
        }
        )
    }
    _playAnimation(aniType=0) {
        if(aniType == 0 && this.iBodyAnim && this.iBodyAnim.animGroup) {
            // 身体动画
            this.onPlayObservable.notifyObservers(this._scene)
            // todo 这里报错
            try {
                this.iBodyAnim.animGroup.start(this.loop, this.iBodyAnim.playSpeed, this.iBodyAnim.startFrame, this.iBodyAnim.endFrame, !1)
            } catch(e) {}
            return true
        } else if(aniType == 1 && this.iFaceAnim && this.iFaceAnim.animGroup) {
            // 脸部动画
            this.iFaceAnim.animGroup.start(this.loop, this.iFaceAnim.playSpeed, this.iFaceAnim.startFrame, this.iFaceAnim.endFrame, !1)
            return true
        } else 
            return false
    }
    _postprocess(e) {
        var o, s;
        let i;
        e == 0 ? i = (o = this.iBodyAnim) == null ? void 0 : o.name : e == 1 && (i = (s = this.iFaceAnim) == null ? void 0 : s.name),
        i === action.Cheering.animName && this._avatar.disposeExtra()
    }
    _isAnimationValid(skeleton) {
        for (let i = 0; i < skeleton.targetedAnimations.length; ++i)
            if (skeleton.targetedAnimations[i].target)
                return !1;
        return !0
    }
}