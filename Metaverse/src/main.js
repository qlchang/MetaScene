import Xverse from "./Xverse.js"
import Codes from "./enum/Codes.js"
import Tip from "./Tip.js";

const xverse = new Xverse({
    env: "DEV",
    appId:"10016",
    releaseId:'2203181838_1375a0'
});

const l = async()=>{
    var R;

    try {
        await ((R = xverse.preload) == null ? void 0 : R.start('full', (M,x)=>{
            const I = `(${M}/${x})`;
            //s(I)
        }
        ))
    } catch (M) {
        if (console.error(M),
        M.code === Codes.PreloadCanceled) {
            toast("\u9884\u52A0\u8F7D\u88AB\u53D6\u6D88");   //预加载被取消
            return
        }
        toast("\u8FDB\u5165\u5931\u8D25, \u8BF7\u91CD\u8BD5");   //进入失败, 请重试
        return
    }
    let nickname = Math.random().toString(16).slice(2)
    try {
 
        let room = await xverse.joinRoom({
            canvas: document.getElementById('canvas'),
            skinId: '0000000001',
            //skinId: '10089',
            avatarId: 'My_Actor',
            roomId: 'aea5406a-3099-48db-b428-30917872e58a',
            userId: nickname,
            //wsServerUrl: 'wss://uat-eks.xverse.cn/ws',
            // wsServerUrl: "ws://localhost:6688/ws",
            // wsServerUrl: "ws://192.168.0.186:6688/ws",
            // wsServerUrl: "wss://meta-socket.4dage.com/ws",
            // wsServerUrl: "wss://meta-socket1.4dage.com/ws",
            wsServerUrl: "wss://meta-socket2.4dage.com/ws",
            //appId: "10016",
            appId: "0000000007",    //"0000000003",    //"0000000007",
            token: " ",
            nickname: nickname,
            firends: ["user1"],
            viewMode: "full",
            resolution: {
                width: 1728,
                height: 720
            },
            pathName: 'thirdwalk',
            objectFit: null,
            hasAvatar: !0,
            syncToOthers: !0
        });
        window.room = room;

        u();
        c();
        // f(); // 添加视频模型
        
        //e(!1);
    } catch (M) {
        M = String(M).split(",")[1]
        console.error(M);
        new Tip(M)  // alert(M);
        return
    }
}

const u = ()=>{
    window.room.on("_coreClick", ({point: f})=>{
        window.room._userAvatar.moveTo({
            point: f
        })
    }
    )
}

const c = ()=>{
    window.room.on("repeatLogin", function() {
        toast("\u8BE5\u7528\u6237\u5DF2\u7ECF\u5728\u5176\u4ED6\u5730\u70B9\u767B\u5F55", {    //该用户已经在其他地点登录
            duration: 1e4
        })
    }),
    window.room.on("reconnecting", function({count: f}) {
        toast(`\u5C1D\u8BD5\u7B2C${f}\u6B21\u91CD\u8FDE`)    //尝试第 ${f} 次重连
    }),
    window.room.on("reconnected", function() {
        toast("\u91CD\u8FDE\u6210\u529F")                   //重连成功
    }),
    window.room.on("disconnected", function() {
        const f = toast("\u8FDE\u63A5\u5931\u8D25\uFF0C\u624B\u52A8\u70B9\u51FB\u91CD\u8BD5", {    //连接失败，手动点击重试
            duration: 1e5,
            onClick() {
                f.hideToast(),
                window.room.reconnect()
            }
        })
    })
}

const f = async ()=>{
    const T = (await room.modelManager.findAssetList(String(room.skinId))).filter(E=>E.typeName === "MEDIA").map(E=>E.url);
    // a(T),
    room.tv && room.tv.setUrl({
        url: "./assets/4.mp4",
        loop: !0
    }).then(async()=>{
        try {
            if(room.tv.videoElement) {
                // room.tv.videoElement.muted = false
                await room.tv.videoElement.play()
                console.log("\u64AD\u653E\u6210\u529F")     // 播放成功
            }
        } catch (S) {
            console.log("\u64AD\u653E\u5931\u8D25\uFF1A", S)    // 播放失败
            document.addEventListener("touchstart", () => {
                room.tv.videoElement.play()
            })
        }
    }).catch(E=>{
        console.error(E)
    })
}

l();