import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, Client } from '@nestjs/microservices';
import { grpcClientOptions } from './grpc-scene.options';
import { Inject } from '@nestjs/common';
import { DataChannel, PeerConnection } from 'node-datachannel';
import { BehaviorSubject } from 'rxjs';
// import * as streamBuffers from 'stream-buffers';
import { ActionType } from './actionType';
import { CacheService } from 'src/cache/cache.service';
import { StreamService } from './stream/stream.service';
// import { InjectQueue } from '@nestjs/bull';
// import { Queue } from 'bull';
import { RotateService } from 'src/rotate/rotate.service';
// import { DelayQueue, RxQueue, DebounceQueue } from 'rx-queue';
import { DelayQueue, RxQueue, DebounceQueue } from '../queue/mod';
import { MoveService } from 'src/move/move.service';
import { GetRouterService } from 'src/get-router/get-router.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
// import ShareData from 'src/ShareData';
// interface UserInfo {
//   userId: string;
//   roomId: string;
// }

const seqExeAsyncFn = (asyncFn) => {
  let runPromise = null;
  return function seq(...args) {
    if (!runPromise) {
      runPromise = asyncFn.apply(this, args);
      runPromise.then(() => (runPromise = null));
      return runPromise;
    } else {
      return runPromise.then(() => seq.apply(this, args));
    }
  };
};
@Injectable()
export class SceneService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private configService: ConfigService,
    private cacheService: CacheService,
    private streamService: StreamService,
    private rotateService: RotateService,
    private moveService: MoveService,
    private getRouterService: GetRouterService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}
  @Client(grpcClientOptions) private readonly client: ClientGrpc;

  public _frameInteval: NodeJS.Timeout;
  public _frameTimeout: NodeJS.Timeout;
  public _rotateTimeout: NodeJS.Timeout;
  public _moveTimeout: NodeJS.Timeout;
  public _JoyStickingSteamTimeout: NodeJS.Timeout;
  public _packFrameTimeout: NodeJS.Timeout;
  public startSteaming = new BehaviorSubject<boolean>(false);
  public onRotating = new BehaviorSubject<boolean>(false);
  public onMoving = new BehaviorSubject<boolean>(false);
  public onJoysticking = new BehaviorSubject<boolean>(false);
  public frameCnt = new BehaviorSubject<number>(-1);
  private rotateframeCnt = -1;
  private moveframeCnt = -1;
  private joystickFrameCnt = -1;
  private rotateFirstIDR = true;
  private rotateStopThrottle = false; //防止多次瞬间解触发
  private rotateTimeStamp: number;

  private channel: DataChannel;
  private peer: PeerConnection;
  // private logger: Logger = new Logger('SceneService');
  private frameCntInterval = 1000;
  private user_id: string;
  private roomId: string;
  private onSteaming = false;

  private mockserverTime = Date.now() - 1653000000478;
  private lastRenderMedia = '';
  private frameCntSubscription: any;

  private roQueueSubscription: any;
  private moveQueueSubscription: any;
  private walkingSub: any;

  private _rotateCountFame = -1;
  private _rotateStartFame = new BehaviorSubject<number>(-1);
  private _rotateCount = -1;

  private streamServiceSub: any;
  // private roRequestQueue: RxQueue = new DelayQueue(20);
  // private roQueue: RxQueue = new DelayQueue(
  //   Number(this.configService.get('queueConfig.rotate')) || 20,
  // );
  private moveQueue: RxQueue = new DelayQueue(
    Number(this.configService.get('queueConfig.move')) || 20,
  );
  private requestIFrameQueue: RxQueue = new DebounceQueue(2000);

  private requestIFrameQueueSub: any;
  private roRequestQueueSub: any;

  private rewalking = false;
  private firstRender = false;

  private lastMovingPointArray: MovingLastUpdateType[] = [];
  private latestRotateRequest: any; // 最新Rotate的接收值
  private latestWalkingRequest: any; // 最新waking的接收值
  private hasJoystickMoveRequest = false; // 最新joystick的接收值
  private stopRotated = false;

  private moveSliceLastFrame = new BehaviorSubject<MovingLastUpdateType>(null);
  private moveSliceLastFrameSub: any;

  public lastMoveStreamFrame = new BehaviorSubject<StreamFrameType>({
    frame: -1,
    clipPath: '',
    metaData: '',
  });

  public testTimer = 0;

  private isJoystickHasStream = false;
  private hasJoystickFocusRepeat = false;
  private startSub: any;
  public sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  private globalOptLock = false;
  private isStopJointing = false;

  onModuleInit(): void {
    this.streamServiceSub = this.streamService.onSteaming.subscribe((val) => {
      this.onSteaming = val;
    });
    Number.prototype.padLeft = function (n, str) {
      return Array(n - String(this).length + 1).join(str || '0') + this;
    };
    // this.logger.info('roQueue-period :' + Number(this.roQueue.period));
    this.logger.info('moveQueue-period :' + Number(this.moveQueue.period));
  }

  public isHeaderOrLast(index: number, length: number): boolean {
    if (index === 0 || index === length) {
      return true;
    } else {
      return false;
    }
  }

  public getConfig() {
    return {
      userId: this.user_id,
      roomId: this.roomId,
    };
  }

  public startStream(): void {
    clearInterval(this._frameInteval);
    if (this.frameCnt.value === -1) {
      this._frameInteval = setInterval(async () => {
        const next = this.frameCnt.value + 1;
        this.frameCnt.next(next);
      }, 1000);
    }
  }

  public holdSteam(): void {
    clearInterval(this._frameInteval);
  }

  public resumeStream(): void {
    this.onMoving.next(false);
    this.onRotating.next(false);
    this.onJoysticking.next(false);
    this.moveframeCnt = -1;
    this.rotateframeCnt = -1;
    this.globalOptLock = false;
    clearInterval(this._frameInteval);
    this._frameInteval = setInterval(async () => {
      const next = this.frameCnt.getValue() + 1;
      this.frameCnt.next(next);
    }, 1000);
  }

  public stopStream(): void {
    if (this.frameCntSubscription) {
      this.frameCntSubscription.unsubscribe();
      this.frameCntSubscription = null;
    }
    if (this.roQueueSubscription) {
      this.roQueueSubscription.unsubscribe();
      this.roQueueSubscription = null;
    }
    if (this.moveQueueSubscription) {
      this.moveQueueSubscription.unsubscribe();
      this.moveQueueSubscription = null;
    }
    this.frameCnt.next(-1);
    clearInterval(this._frameInteval);
    this.rotateframeCnt = -1;
  }

  setConfig(user_id: string, roomId: string): void {
    this.user_id = user_id;
    this.roomId = roomId;
  }

  onModuleDestroy() {
    if ('unsubscribe' in this.streamServiceSub) {
      this.streamService.onSteaming.unsubscribe();
    }
  }

  init(request: InitRequest) {
    try {
      this.rotateService.init(
        request.app_id,
        request.user_id,
        request.skin_id,
        request.roomId,
        request.avatar_id,
      );
      this.cacheService.getClient();
      console.log('rotateService::init');
      this.startSub = this.startSteaming.subscribe((flag) => {
        if (flag) {
          console.log('初始推流：：');
          this.startStream();
          this.handleStream();
        }
      });
      // 加载
    } catch (error) {
      this.logger.error('error', error);
    }
  }

  async exit() {
    this.frameCnt.next(-1);
    this.rotateService.deleteUser(this.user_id);
    this.hasJoystickFocusRepeat = false;
    const userId = this.user_id;
    const roomId = this.roomId;
    const roomKey =
      process.env.NODE_ENV === 'development'
        ? `test-room:${roomId}`
        : `room:${roomId}`;
    this.cacheService.hDel(roomKey, userId);
    if (this.startSub) {
      this.startSub.unsubscribe();
      this.startSub = null;
    }
  }

  async rotate(request: RotateRequest) {
    if (this.isHasWalkingJoints()) {
      this.globalOptLock = true;
    } else {
      console.log('开锁rotate或正常rotate');
    }
    this.latestRotateRequest = request;
    // if (
    //   this.onMoving.getValue() &&
    //   this.globalOptLock &&
    //   // this._rotateCount > 5 &&
    //   !this.rotateStopThrottle
    // ) {
    //   this.handleRotateStop(request);
    //   // debugger;
    // }
    this.handleRotate(request);
    this._rotateCount += 1;
  }
  /**
   * rotate请求队列
   */

  async handleRotate(request) {
    // try {
    const rotateUnlock = this.firstRender && !this.globalOptLock;
    console.log('rotateUnlock条件--->' + rotateUnlock, this.globalOptLock);
    if (rotateUnlock && this._rotateCount > 2) {
      const start = performance.now();
      // 当move时处理 _rotateCount是移动端同时触发的问题,rotateStopThrottle是减少重复抖动stop的处理。
      this.holdSteam();
      const redisMeta: StreamReplyType = await this.rotateService.seqExeRotate(
        request,
      );

      if (redisMeta && 'mediaSrc' in redisMeta) {
        if (redisMeta.mediaSrc?.length) {
          const src = redisMeta.mediaSrc.split('?')[0];
          if (src.length > 0) {
            this.lastRenderMedia = src;
            const clipPath = this.configService.get('app.prefix') + src;
            delete redisMeta.mediaSrc;
            const stream: StreamFrameType = {
              frame: -1,
              clipPath: clipPath,
              metaData: JSON.stringify(redisMeta),
              serverTime: this.mockserverTime,
              DIR: 3,
            };

            const stop = performance.now();
            const inMillSeconds = stop - start;
            const rounded = Number(inMillSeconds).toFixed(3);
            this.logger.info(
              `[timer]-rotate-入队列前: ${rounded}ms -->` +
                JSON.stringify(stream),
            );
            if (!this.stopRotated) {
              await this.seqExehandleRotateStream(stream);
            }
            // this.roQueue.next(stream);
          } else {
            this.onRotating.next(false);
          }
        }
      }
    } else {
      return;
    }
    // } catch (error) {
    //   this.logger.error('rotate', error.message);
    //   console.error('error', error);
    // }
  }

  handleStopRotate() {
    this.stopRotated = true;
  }

  resumeRotate() {
    this.stopRotated = false;
  }

  seqExehandleRotateStream = seqExeAsyncFn(this.handleRotateStream);

  /**
   * rotate 推送seq(不存在队列，直推)
   */
  async handleRotateStream(stream: StreamFrameType) {
    this.rotateTimeStamp = Date.now();
    this.holdSteam();
    // 在未开始前开始
    if (!this.onRotating.value) {
      this._rotateStartFame.next(this.frameCnt.value);
      console.log('旋转开始记录帧:::--->', this._rotateStartFame.value);
    }

    this.onRotating.next(true);
    stream.frame = this.frameCnt.value + 1;
    // 从记录第一帧到最新一帧
    this._rotateCountFame = stream.frame - this._rotateStartFame.value;
    const IDRflag = this._rotateCountFame % 5 === 0 ? 1 : 3;
    stream.DIR = this.rotateFirstIDR ? 1 : IDRflag;

    console.log(
      '[旋转信息:::info--->]:clipPath: %s, main-frameCnt: %s, stream.frame %s ,_rotateStartFame: %s, _rotateCountFame: %s, IDRflag： %s,time: %s',
      stream.clipPath,
      // this._rotateStartFame.value,
      this.frameCnt.value,
      stream.frame,
      this._rotateStartFame.value,
      this._rotateCountFame,
      // this.rotateframeCnt,
      IDRflag,
      new Date().getTime(),
    );

    const user = this.moveService.users[this.user_id];
    user.isMoving = JSON.parse(stream.metaData)['newUserStates'][0].renderInfo.isMoving
    const res = await this.streamService.pushFrameToSteam(stream);
    if (res.done) {
      this.frameCnt.next(res.frame);
      if (this.rotateFirstIDR) {
        this.rotateFirstIDR = false;
      }

      console.log('[旋转信息:::info:::done--->]', res);

      clearTimeout(this._rotateTimeout);
      this._rotateTimeout = setTimeout(() => {
        this.logger.info('rotate end', Date.now());
        this.rotateframeCnt = -1;
        this._rotateCountFame = -1;
        this._rotateCount = 0;
        this.latestRotateRequest = null;
        this.rotateFirstIDR = true;
        this.resumeStream();
      }, 200);
    } else {
      console.error('流地址有误::', res.frame, JSON.stringify(res));
      this.logger.error('流地址有误::', res.frame, JSON.stringify(res));
      this.resumeStream();
    }
  }

  // /**
  //  * rotate 推送队列 --backup
  //  */
  // handleRotateStream() {
  //   if (!this.roQueueSubscription) {
  //     this.roQueueSubscription = this.roQueue.subscribe(
  //       async (stream: StreamFrameType) => {
  //         this.rotateTimeStamp = Date.now();
  //         if (this.rotateframeCnt === -1) {
  //           this.rotateframeCnt = this.frameCnt.value;
  //         }
  //         this.rotateframeCnt += 1;

  //         stream.frame = this.rotateframeCnt;
  //         this._rotateCountFame += 1;

  //         const IDRflag = this._rotateCountFame % 5 === 0 ? 1 : 3;
  //         this.logger.info(
  //           `当前rotate ,mainframeCnt:${this.frameCnt.getValue()}, _rotateCountFame:${this._rotateCountFame
  //           } IDRflag:${IDRflag}`,
  //         );
  //         stream.DIR = this.rotateFirstIDR ? 1 : IDRflag;
  //         if (this.rotateFirstIDR) {
  //           this.rotateFirstIDR = false;
  //         }

  //         this.logger.info(
  //           '[media-rotate]: ' +
  //           ', frame: ' +
  //           stream.frame +
  //           ', rotateframeCnt: ' +
  //           this.rotateframeCnt +
  //           ', clipPath: ' +
  //           stream.clipPath,
  //           // stream.metaData,
  //         );
  //         // this.logger.info(
  //         //   `roQueueSubscription:frame:${this.rotateframeCnt}  ` +
  //         //   JSON.stringify(stream.metaData),
  //         // );

  //         const res = await this.streamService.pushFrameToSteam(stream);
  //         if (res.done) {
  //           clearTimeout(this._rotateTimeout);
  //           this._rotateTimeout = setTimeout(() => {
  //             this.logger.info('rotate end', Date.now());
  //             this.frameCnt.next(res.frame);
  //             this.rotateframeCnt = -1;
  //             this._rotateCountFame = -1;
  //             // this.onMoving.next(false);
  //             // this.onRotating.next(false);
  //             this.latestRotateRequest = null;
  //             this.rotateFirstIDR = true;
  //             this.resumeStream();
  //             //TODO rotate完后清除request队列
  //             if (this.roRequestQueueSub) {
  //               this.roRequestQueueSub.unsubscribe();
  //               this.roRequestQueueSub = null;
  //             }
  //           }, 100);
  //         } else {
  //           console.error('流地址有误::', res.frame, JSON.stringify(res));
  //           this.logger.error('流地址有误::', res.frame, JSON.stringify(res));
  //           this.resumeStream();
  //         }
  //       },
  //     );
  //   }
  // }

  /**
   * 旋转中断逻辑
   * 1. 行走间
   * 1.1 行走间中断只能在每段最后一帧，当前段一定要消费掉，在未消费，globalOptLock锁rotate,消费完 rotate
   * 1.2 消费完要处理点位上传，清除当前段往后的都要清掉，回调各种stop function
   * 2.joystick间 complementFrame pools 解锁就可以
   */
  async handleRotateOrWalkingStop(request): Promise<boolean> {
    this.rotateStopThrottle = true;
    this.isStopJointing = true;
    const lastStreamFrame = this.lastMoveStreamFrame.getValue();
    this.logger.info(
      'handleRotateOrWalkingStop-frame',
      JSON.stringify(lastStreamFrame),
    );

    const metaData: StreamReplyType = JSON.parse(
      lastStreamFrame.metaData,
    ) as any as StreamReplyType;
    if (!metaData.endBreakPointId) {
    }
    console.log('stop-4', metaData.traceIds[0]);
    console.log('stop-5', request.trace_id);
    //判断request是否是新的
    if (metaData.traceIds.indexOf(request.trace_id) > -1) {
      return Promise.resolve(false);
    }
    console.log('currentUser-user_id', this.user_id);
    const newUserStates: NewUserStatesType = metaData.newUserStates.find(
      (item) => item.userId === this.user_id,
    );

    const trace_id = metaData.traceIds[0];
    const userId = newUserStates.userId;
    //TODO 临时，可能数据会不对
    const breakPointId = metaData.endBreakPointId || metaData.breakPointId;
    const cameraAngle = newUserStates.playerState.camera.angle;
    const playerAngle = newUserStates.playerState.player.angle;
    this.logger.info(
      'stop-data-0' +
        'trace_id: ' +
        trace_id +
        'userId:' +
        userId +
        'breakPointId :' +
        breakPointId +
        'cameraAngle :' +
        JSON.stringify(cameraAngle) +
        'playerAngle: ' +
        JSON.stringify(playerAngle),
    );
    //debugger;
    console.log('moveService.stop-1:' + breakPointId);
    //console.log('20220627test:handleRotateOrWalkingStop-stop');
    const redisMeta = await this.moveService.stop(
      trace_id,
      userId,
      breakPointId,
      cameraAngle,
      playerAngle,
    );
    this.logger.info('stop-redisMeta-frame', JSON.stringify(redisMeta));
    if (redisMeta) {
      const src = redisMeta.mediaSrc.split('?')[0];
      const mediaSrc = this.configService.get('app.prefix') + src;
      const streamData: StreamFrameType = {
        frame: this.frameCnt.value + 1,
        clipPath: mediaSrc,
        metaData: JSON.stringify(redisMeta),
        serverTime: this.mockserverTime,
        DIR: 1,
      };
      //推最后一个 STOP Frame
      const hasPush = await this.streamService.pushFrameToSteam(streamData);
      if (hasPush.done) {
        //console.log('20220627test:handleRotateOrWalkingStop-stop:'+streamData.clipPath+'**'+streamData.frame);
        this.frameCnt.next(hasPush.frame);
        this.isStopJointing = false;
        // this.onMoving.next(false);
        // this.cleanMoveSteam();
        return Promise.resolve(true);
        // this.resumeStream();
      } else {
        console.error(
          '暂停STOP::帧有问题',
          hasPush.frame,
          JSON.stringify(streamData),
        );
        return Promise.resolve(false);
      }
    }
  }

  async getSimplestCameraInfo(appId, userId) {
    if (this.moveService.cameraInfos.length > 20) {
      const startBreakPointId =
        this.moveService.cameraInfos[0].startBreakPointId;
      const endBreakPointId =
        this.moveService.cameraInfos[this.moveService.cameraInfos.length - 1]
          .endBreakPointId;

      const path = this.getRouterService.searchRoad2(
        startBreakPointId,
        endBreakPointId,
      );
      if (path == null) {
        //可以清空cameraInfos
        this.moveService.cameraInfos = [];
      } else {
        await this.moveService.updateCameraInfoForDely(appId, userId, path);
      }
    }
  }

  /**
   * 行走动作
   *
   * @param request
   */
  async walking(request: MoveRequest) {
    this.latestWalkingRequest = request;
    this.logger.info('walking-trace_id', request.trace_id);

    // if (this.isHasWalkingJoints()) {
    //   console.log('lock-锁-walking', this.latestWalkingRequest);
    //   this.globalOptLock = true;
    // }

    // 进入正常walking流程
    if (!this.onMoving.getValue()) {
      console.log('walking-step-main-1', request.trace_id);
      this.latestWalkingRequest = null;
      this.handleWalking(request);
    } else {
      this.globalOptLock = true;
      console.log('lock-锁-walking', this.latestWalkingRequest);
    }
    this.handleWalkingJoints();
  }
  /**
   * 一段walking每个Joints关节点
   * @param request
   */
  handleWalkingJoints() {
    // 每个关节点
    if (!this.moveSliceLastFrameSub) {
      this.moveSliceLastFrameSub = this.moveSliceLastFrame.subscribe(
        async (frame: MovingLastUpdateType) => {
          //TODO 正在行走时，有新的reqest
          if (frame) {
            // console.log('unlock-Joints', JSON.stringify(frame));
            this.logger.info('Joints', JSON.stringify(frame));
            this.resumeRotate();
            let isRotateStop = false;
            let isWalkingStop = false;
            // 在全局锁的情况下
            if (this.globalOptLock) {
              isRotateStop = !!this.latestRotateRequest && this.onMoving.value;
              isWalkingStop =
                !!this.latestWalkingRequest && this.onMoving.value;

              console.log('g--isRotateStop', isRotateStop);
              console.log('g--isWalkingStop', isWalkingStop);

              // 这个就是双暂时出现的时候, 强制只执行一次，以isWalkingStop为主
              if (isRotateStop && isWalkingStop) {
                isRotateStop = false;
              }
              console.log('g--1-isRotateStop', isRotateStop);
              console.log('g--1-isWalkingStop', isWalkingStop);

              // 这个旋转暂停
              if (isRotateStop) {
                const hasStop = await this.handleRotateOrWalkingStop(
                  this.latestRotateRequest,
                );
                console.log('旋转-hasStop', hasStop);
                this.clearWalkingJoints();
                this.cleanMoveSteam();
                this.globalOptLock = false;
              }
              // 这个行走暂停
              if (isWalkingStop) {
                const hasStop = await this.handleRotateOrWalkingStop(
                  this.latestWalkingRequest,
                );
                console.log('walking-hasStop', hasStop);
                this.clearWalkingJoints();
                this.cleanMoveSteam();
                this.globalOptLock = false;
                console.log('unlock-walking');
                this.handleReWalking(this.latestWalkingRequest);
                // console.log('this', this.rewalking);
              }
            }
          }
        },
      );
    }
  }

  /**
   * 清除所有的节点信信息
   * @param request
   */
  clearWalkingJoints() {
    this.moveSliceLastFrame.next(null);
    this.lastMovingPointArray = [];
  }
  /**
   * 是否有行走关节点
   * @returns boolean
   */

  isHasWalkingJoints(): boolean {
    return this.lastMovingPointArray.length > 0;
  }

  /**
   * 行走队列处理器
   * @param request MoveRequest
   * @returns void
   */

  async handleWalking(request: MoveRequest): Promise<void> {
    try {
      // if (!this.onMoving.getValue()) {
      console.log('walking-step-main-2', request.trace_id);
      const start = performance.now();
      this._rotateCount = 0;
      const user = this.moveService.users[this.user_id];
      console.log('进入1 - searchRoad');
      this.logger.info(
        'handleWalking-users' +
          JSON.stringify(this.moveService.users) +
          ' this.user_id: ' +
          this.user_id,
      );
      this.logger.info(
        'handleWalking-currentUser' +
          JSON.stringify(user) +
          ' this.user_id: ' +
          this.user_id,
      );
      console.log('path-start' + user.breakPointId);

      const path = await this.getRouterService.searchRoad(
        user.appId,
        user.breakPointId,
        request.clicking_action.clicking_point,
      );
      this.logger.info('walking-path', path);
      if (!path) {
        console.log('不存在--path', path);
        this.cleanMoveSteam();
        this.clearWalkingJoints();
        this.resumeRotate();
        this.resumeStream();
        return;
      }
      // debugger;
      const walkingRes = await this.moveService.move(path, request);

      if (walkingRes && (!this.onMoving.value || this.rewalking)) {
        // 二维数组 做move 序列， move类型
        //console.log('move-walkingRes:' + JSON.stringify(walkingRes));
        this.handleStopRotate();

        if (walkingRes && walkingRes?.length >= 1) {
          for (let i = 0; i <= walkingRes.length - 1; i++) {
            Array.from(walkingRes[i]).forEach(
              (item: StreamReplyType, index: number) => {
                //const IDRflag = index % 5 === 0 ? 1 : 3;
                const IDRflag = item.isIDR ? 1 : 3;
                const dir = this.isHeaderOrLast(
                  index,
                  walkingRes[i].length - 1,
                );
                item.DIR = dir ? 1 : IDRflag;
                //将每段最后一个推入lastMovingPointArray
                if (index === walkingRes[i].length - 1) {
                  this.lastMovingPointArray.push({
                    mediaSrc: item.mediaSrc,
                    metaData: item,
                  });
                }
              },
            );
          }
        }

        // walkingRes marker to everybody
        const seqs = Array.from(walkingRes).flat() as any as StreamReplyType[];

        if (seqs?.length) {
          this.logger.info(
            'walking --队列总览:' +
              ' 总段数： ' +
              walkingRes.length +
              ' 镜头帧数：' +
              walkingRes[0].length +
              ' 行走段数：' +
              (walkingRes[0]?.length
                ? walkingRes.length - 1
                : walkingRes.length) +
              ' 队列总帧数：' +
              seqs.length,
          );
          const stop = performance.now();
          const inMillSeconds = stop - start;
          const rounded = Number(inMillSeconds).toFixed(3);
          this.logger.info(`[timer]-move-入队列前：-->${rounded}ms`);

          this.handleSeqMoving(seqs);
        } else {
          console.error('walking-move无数据');
          this.cleanMoveSteam();
          this.resumeStream();
        }
        // }
      }
      // });
      // }
    } catch (error) {
      this.logger.error('walking', error.message);
      this.cleanMoveSteam();
      this.resumeStream();
    }
  }

  /**
   *  改变路线后的walking队列处理（中转）
   * @param request MoveRequest
   */
  handleReWalking(request: MoveRequest) {
    // this.latestWalkingRequest = null;
    this.rewalking = true;
    this.handleWalking(request);
  }

  /***
   * joystick main core
   */
  async joystick(request: JoystickRequest) {
    // TODO hasJoystickMoveRequest中断
    this.logger.info(
      'this.hasJoystickMoveRequest',
      this.hasJoystickMoveRequest,
    );
    if (!this.hasJoystickMoveRequest) {
      this.handlejoystick(request);
    }
  }

  /**
   * joystick 二合一推流
   * @param joystickRes StreamMetaType | StreamFrameType;
   */
  handlePushJoyStickSteamSeq = seqExeAsyncFn(this.handlePushJoyStickSteam);

  async handlePushJoyStickSteam(joystickRes: StreamReplyType) {
    this.holdSteam();
    this.globalOptLock = true;

    //console.log('joystickRes有mediaSrc', joystickRes.mediaSrc);
    console.log(
      'handlejoystick-angle->相机角度-------------------------：' +
        joystickRes['newUserStates'][0].playerState.camera.angle.yaw,
    );
    let streamData: StreamFrameType | StreamMetaType;

    this.joystickFrameCnt = this.frameCnt.getValue() + 1;

    const hasMedia = joystickRes?.mediaSrc && joystickRes?.mediaSrc.length > 0;

    if (hasMedia) {
      console.log('mediaSrc_7:'+joystickRes.mediaSrc);
      const src = joystickRes.mediaSrc.split('?')[0];
      const mediaSrc = this.configService.get('app.prefix') + src;
      // IDR flag设置为I帧
      const setDIR = joystickRes.isIDR ? 1 : 3;
      streamData = {
        frame: this.joystickFrameCnt,
        clipPath: mediaSrc,
        metaData: JSON.stringify(joystickRes),
        serverTime: this.mockserverTime,
        DIR: setDIR,
      };
      console.log(
        'handlejoystick-hasMedia->-------------------------：' +
          ' frame: ' +
          streamData.frame +
          mediaSrc +
          '  IDR :' +
          setDIR,
      );
    } else {
      streamData = {
        frame: this.joystickFrameCnt,
        metaData: JSON.stringify(joystickRes),
      };
    }

    const user = this.moveService.users[this.user_id];
    user.isMoving = JSON.parse(streamData.metaData)['newUserStates'][0].renderInfo.isMoving;
    console.log('handlePushJoyStickSteam:'+user.IDRCount+','+joystickRes.isIDR+','+joystickRes.traceIds);
    // 过滤新东西, 推完给回false
    this.moveService.sendingFrameForJoystick = true;

    const hasPush = hasMedia
      ? await this.streamService.pushFrameToSteam(streamData as StreamFrameType)
      : await this.streamService.pushMetaDataToSteam(
          streamData as StreamMetaType,
        );

    if (hasPush.done) {
      this.isJoystickHasStream = true;
      console.log('joystick-hasPush', hasPush);
      // if (this.isJoystickHasStream) {
      //   await this.sleep(20);
      // }
      // await this.sleep(20);
      this.frameCnt.next(hasPush.frame);
      this.moveService.sendingFrameForJoystick = false;
      const data = joystickRes as StreamReplyType;
      console.log('handlejoystick-isIDR:' + data.isIDR);
      // if (data?.moveOver && data.moveOver) {
      //   // moveOver
      //   console.log('回传updateUser', data);
      //   // const userId = this.user_id;
      //   // 回传点暂时有问题，待修复
      //   //const breakPointId = data.endBreakPointId || data.breakPointId;
      //   //const lastReply = JSON.stringify(joystickRes);
      //   //this.moveService.updateUser(userId, breakPointId, lastReply);
      // }

      /**
       * 这个complementFrame 具体说明 pools 是complementFrame这个返回值
       * 1. 第一次要在200ms后调用， 如有值（pools） 就要返回主流程执行，但设置hasJoystickFocusRepeat为true
       * 2. 第二次或N进入在hasJoystickFocusRepeat为true并绕过200ms timeout,如pools有值返回（2）主流程直到pools为null
       * 3. 如pools为空走回 200ms流程 （这时pools应该为空），交权回空流。
       */

      if (this.hasJoystickFocusRepeat) {
        const complementFrame = this.moveService.complementFrame(
          this.user_id,
        ) as StreamReplyType;
        if (complementFrame) {
          // 第二次或N次进入时如果有值直接重新进入流主程
          this.holdSteam();
          this.handlePushJoyStickSteamSeq(complementFrame);
          this.globalOptLock = true;
        } else {
          // 第二次或N次无pool数据再次trigger handleJoystickStop
          this.hasJoystickFocusRepeat = false;
          this.testTimer = 0;
          //this.handleJoystickStop(hasPush);
          this.globalOptLock = false;
          this.resumeStream();
        }
      } else {
        this.handleJoystickStop(hasPush);
      }
    } else {
      debugger;
      console.error('joystick-流地址有误::', joystickRes.mediaSrc);
      this.logger.error('joystick-流地址有误::', joystickRes.mediaSrc);
      this.resumeStream();
    }
  }
  /**
   * Joystick Stop function
   */
  async handleJoystickStop(hasPush: StreamPushResponse) {
    // 最后一帧200ms
    clearTimeout(this._JoyStickingSteamTimeout);
    this._JoyStickingSteamTimeout = setTimeout(async () => {
      const user = this.moveService.users[this.user_id];
      await this.getSimplestCameraInfo(user.appId, this.user_id);
      const complementFrame = this.moveService.complementFrame(
        this.user_id,
      ) as StreamReplyType;
      // console.log('has-complementFrame', complementFrame);
      //console.log('gemer-test-complementFrame', complementFrame);
      if (complementFrame) {
        this.hasJoystickFocusRepeat = true;
        this.globalOptLock = true;
        this.testTimer += 1;
        console.log('complementFrame-有值');
        const start = performance.now();
        this.handlePushJoyStickSteamSeq(complementFrame);
        const stop = performance.now();
        //console.log('handlePushJoyStickSteam', this.testTimer);
        const inMillSeconds = stop - start;
        const rounded = Number(inMillSeconds).toFixed(3);
        console.log(`complementFrame调用时间---->${rounded}`);
      } else {
        console.log('complementFrame-空1');
        this.logger.info('joystick opt done');
        this.logger.info('joystick 交权给空流,当前pts', hasPush.frame);
        this.hasJoystickFocusRepeat = false;
        this.onJoysticking.next(false);
        this.resumeStream();
        this.joystickFrameCnt = -1;
        this.isJoystickHasStream = false;
      }
    }, 200);
  }

  /***
   * joystick
   */

  async handlejoystick(request: JoystickRequest) {
    try {
      //const joystickRes = await this.moveService.joystick(request);
      this._rotateCount = 0;
      const joystickRes = await this.moveService.seqExeJoystick(request);
      this.logger.info(
        'joystick-breakPointId:' +
          this.moveService.users[this.user_id].breakPointId,
      );
      // 有数据 [0]是rotate数据，[1-infinity]是walking数据
      //this.logger.info('joystickRes', JSON.stringify(joystickRes));

      if (joystickRes) {
        this.onJoysticking.next(true);
        if (!this.onMoving.getValue()) {
          console.log('handlejoystick:data', JSON.stringify(joystickRes));
          this.handlePushJoyStickSteamSeq(joystickRes);
        }
      } else {
        console.log('handlejoystick:null');
        this.onJoysticking.next(false);
      }
    } catch (error) {
      console.error('joystick错误', error);
      this.onJoysticking.next(false);
      this.logger.error('joystick', error.message);
    }
  }

  /**
   * 主要处理moving的序列动作
   * @param seqs StreamReplyType[]
   */
  handleSeqMoving(seqs: StreamReplyType[]) {
    // if (!this.moveQueueSubscription) {
    //   this.handleMoveSteam();
    // }
    // this.logger.info('moving-seqs', seqs.length);
    this.onMoving.next(true);
    this.holdSteam();
    // 保证每一段都是序列动作的前面队列是空的
    // this.moveQueue.clean();

    seqs.forEach((frame: StreamReplyType) => {
      const mediaSrc = frame.mediaSrc;
      const src = mediaSrc.split('?')[0];

      const clipPath = this.configService.get('app.prefix') + src;
      const type = frame.mType?.length ? frame.mType.slice() : 'move';

      const stream: StreamFrameType = {
        frame: -1,
        clipPath: clipPath,
        metaData: JSON.stringify(frame),
        serverTime: this.mockserverTime,
        DIR: frame.DIR,
        mType: type,
      };
      // this.moveQueue.next(stream);
      this.handleMoveSteam(stream);
    });
  }

  handleMoveSteam = seqExeAsyncFn(this.handleMoveSteamFn);

  async handleMoveSteamFn(stream: StreamFrameType) {
    try {
      if (!this.isStopJointing) {
        const metaData: StreamReplyType = JSON.parse(stream.metaData);
        this.moveframeCnt = this.frameCnt.value + 1;
        const streamData: StreamFrameType = {
          frame: this.moveframeCnt,
          clipPath: stream.clipPath,
          metaData: stream.metaData,
          serverTime: this.mockserverTime,
          DIR: stream.DIR,
        };
        this.logger.info(
          '[media-move]: ' +
            ', moveframeCnt: ' +
            this.moveframeCnt +
            ', clipPath: ' +
            stream.clipPath +
            ', mType: ' +
            stream.mType +
            ', DIR: ' +
            stream.DIR,
          // stream.metaData,
        );
        this.logger.info(
          '[media-move-lastMovingPointArray]',
          this.lastMovingPointArray?.length,
        );

        const user = this.moveService.users[this.user_id];
        user.isMoving = JSON.parse(streamData.metaData)['newUserStates'][0].renderInfo.isMoving;
        // 记录lastMoveStreamFrame给打断逻辑使用
        this.lastMoveStreamFrame.next(streamData);
        // this.lastMoveStreamFrameBk = streamData;
        this.holdSteam();
        // this.globalOptLock = true;
        //console.log('20220627test:handleMoveSteam:' + stream.clipPath)
        const frameTimeStart = performance.now();
        const res = await this.streamService.pushFrameToSteam(streamData);

        const isLastFrameIndex = this.lastMovingPointArray.findIndex(
          (item) => item.mediaSrc === metaData.mediaSrc,
        );
        // this.logger.info('path-update-index', isLastFrameIndex);

        if (res.done) {
          const frameTimeEnd = performance.now();
          const frameAverage = frameTimeEnd - frameTimeStart;
          console.log('walking-frameAverage', frameAverage);
          await this.sleep(40);
          this.frameCnt.next(res.frame);
          //关节点入库
          if (isLastFrameIndex > -1) {
            //this.logger.info('path-update-array', this.lastMovingPointArray);
            const currentMeta = this.lastMovingPointArray[isLastFrameIndex];
            const userId = this.user_id;
            const breakPointId = currentMeta.metaData.endBreakPointId;
            const lastReply = currentMeta.metaData;
            this.moveService.updateUser(userId, breakPointId, lastReply);
            this.lastMovingPointArray.splice(isLastFrameIndex, 1);
            this.moveSliceLastFrame.next(currentMeta);
          }

          clearTimeout(this._moveTimeout);

          this._moveTimeout = setTimeout(() => {
            this.logger.info('move 交权给空流,当前pts', res.frame);
            this.rewalking = false;
            this.frameCnt.next(res.frame);
            this.rotateframeCnt = -1;
            this.onMoving.next(false);
            this.onJoysticking.next(false);
            this.lastMovingPointArray = [];
            this.hasJoystickMoveRequest = false;
            this.cleanMoveSteam();
            this.globalOptLock = false;
            this.resumeStream();
            this.logger.info('move end');
          }, 200);
        } else {
          console.error('流地址有误::', res.frame, JSON.stringify(res));
          this.logger.error(
            `movesteam::当前帧:${res.frame}` + JSON.stringify(res),
          );
          this.resumeStream();
        }
      }
    } catch (error) {
      this.logger.error('handleMoveSteam::error', error);
    }
  }

  cleanMoveSteam() {
    this.moveQueue.clean();
    if (this.moveQueueSubscription) {
      this.moveQueueSubscription.unsubscribe();
      this.moveQueueSubscription = null;
    }
    if (this.walkingSub) {
      this.walkingSub.unsubscribe();
      this.walkingSub = null;
    }
    if (this.moveSliceLastFrameSub) {
      this.lastMoveStreamFrame.next(null);
      this.moveSliceLastFrameSub.unsubscribe();
      this.moveSliceLastFrameSub = null;
    }
    // if (this.clickQueueSub) {
    //   this.clickQueueSub.unsubscribe();
    //   this.clickQueueSub = null;
    // }
    this.rotateStopThrottle = false;
  }

  async handleDataChanelOpen(
    channel: DataChannel,
    peer: PeerConnection,
  ): Promise<void> {
    this.channel = channel;
    this.peer = peer;
    this.streamService.setChannel(channel);
    this.startSteaming.next(true);

    // this.startStream();
    // this.handleStream();
    //TODO 正式channel打开记录,记录多少人在线
    const userId = this.user_id;
    const roomId = this.roomId;
    const roomKey =
      process.env.NODE_ENV === 'development'
        ? `test-room:${roomId}`
        : `room:${roomId}`;

    this.cacheService.hSet(roomKey, userId, 1);
    // debugger;
    this.channel.onBufferedAmountLow(() => {
      console.error('onBufferedAmountLow-rtt', this.peer.rtt());
      console.error('onBufferedAmountLow', this.channel.bufferedAmount());
      //64k->65536 128k->131072
      this.channel.setBufferedAmountLowThreshold(262144);
      this.logger.error('onBufferedAmountLow', this.channel.bufferedAmount());
    });
  }

  handleDataChanelClose(): void {
    this.stopStream();
    this.startSteaming.next(false);
    this.streamService.closeChannel();
    this.cleanMoveSteam();
    // const exitRequest: ExitRequest = {
    //   action_type: 1002,
    //   user_id: this.user_id,
    //   trace_id: '',
    // };
    this.exit();
  }

  handleMessage(message: string | Buffer) {
    try {
      if (typeof message === 'string') {
        // wasm:特例, requestIframe
        if (message.includes('wasm:')) {
          const parseData = message
            ? String(message).replace('wasm:', '')
            : `{"MstType":1}`;
          const msg: RTCMessageRequest = JSON.parse(parseData);
          this.logger.error('lostIframe-message', JSON.stringify(msg));
          if (Number(msg.MstType) === 0) {
            this.handleIframeRequest();
          }
        } else {
          const msg: RTCMessageRequest = JSON.parse(message);
          // console.log('msg.action_type:' + msg.action_type);
          switch (msg.action_type) {
            case ActionType.walk:
              const walk = msg as any as MoveRequest;
              this.walking(walk);
              break;
            case ActionType.joystick:
              const JoystickRequest = msg as any as JoystickRequest;
              this.joystick(JoystickRequest);
              break;
            case ActionType.breathPoint:
              this.handleBreath(msg);
              break;
            case ActionType.rotate:
              const rotateRequest: RotateRequest = msg;
              this.rotate(rotateRequest);
              break;
            case ActionType.userStatus:
              this.updateUserStatus(msg);
              break;
            case ActionType.status:
              this.updateStatus();
              break;
            default:
              break;
          }
        }
      }
    } catch (error) {
      this.logger.error('handleMessage:rtc--error', error.message);
    }
  }

  async handleIframeRequest() {
    //TODO Iframe 最终传什么？
    this.holdSteam();
    this.requestIFrameQueue.next(this.streamService.lastStreamFrame.getValue());
    if (!this.requestIFrameQueueSub) {
      this.requestIFrameQueueSub = this.requestIFrameQueue.subscribe(
        async (frameData: StreamFrameType) => {
          if (frameData) {
            this.globalOptLock = true;
            const nextFrame = this.frameCnt.getValue() + 1;
            this.logger.warn('lostIframe:' + nextFrame);
            frameData.frame = nextFrame;
            frameData.DIR = 1;
            const res = await this.streamService.pushFrameToSteam(frameData);
            if (res.done) {
              this.logger.error(
                ' frame:' + res.frame + '  补帧::' + JSON.stringify(frameData),
              );
              this.frameCnt.next(res.frame);
              clearTimeout(this._packFrameTimeout);
              this._packFrameTimeout = setTimeout(() => {
                this.resumeStream();
                this.globalOptLock = false;
              }, 100);
            } else {
              console.error('补帧有误：', JSON.stringify(frameData));
            }
          }
        },
      );
    }
  }

  handleBreath(request) {
    const npsRes = this.moveService.getBreakPoints(request);
    //this.logger.info('npsRes', npsRes.nps);
    this.streamService.pushNormalDataToStream(npsRes);
  }

  updateStatus(): void {
    const reply = {
      data: { action_type: 1009, echo_msg: { echoMsg: Date.now() } },
      track: false,
    };
    this.streamService.pushNormalDataToStream(reply);
  }
  updateUserStatus(request) {
    try {
      const usersData = this.rotateService.getNewUserStateRequest(request);
      if (usersData) {
        usersData.actionType = 1024;
        //this.logger.info(
        //   'joystick:->updateUserStatus' +
        //   'playerPosition:' +
        //   JSON.stringify(
        //     redisMeta['newUserStates'][0].playerState.player.position,
        //   ),
        // );
        this.streamService.pushNormalDataToStream(usersData);
      } else {
        this.logger.error('updateUserStatus::function-empty');
      }
    } catch (error) {
      this.logger.error('updateUserStatus::function', error.message);
    }
  }

  pushFirstRender(clipPath: string, metaData: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const streamData: StreamFrameType = {
          frame: 1,
          clipPath: clipPath,
          metaData: metaData,
          serverTime: this.mockserverTime,
          DIR: 1,
        };
        const hasPush = await this.streamService.pushFrameToSteam(streamData);
        return resolve(hasPush.done);
      } catch (error) {
        return reject(false);
      }
    });
  }
  handleStream() {
    this.logger.info('this.frameCntSubscription', this.frameCntSubscription);
    let redisData;
    if (!this.frameCntSubscription) {
      this.frameCntSubscription = this.frameCnt.subscribe(async (frame) => {
        try {
          this.logger.info('frame: ' + frame);
          console.log(
            'networkState:::--->' +
              ' maxMessageSize: ' +
              this.channel.maxMessageSize() +
              ' bytesReceived: ' +
              this.peer.bytesReceived() +
              ' bytesSent: ' +
              this.peer.bytesSent() +
              ' rtt: ' +
              this.peer.rtt() +
              ' state: ' +
              this.peer.state(),
          );
          if (frame === 1) {
            // redisData = await this.rotateService.echo(this.user_id, true);
            const app_id = this.configService.get('app.appId');
            console.log('首页数据', app_id, this.user_id);
            redisData = this.rotateService.getFirstStreamData(
              app_id,
              this.user_id,
            );
            this.logger.warn(
              'bootstrap:socket::首屏 --->' + JSON.stringify(redisData),
            );
            this.onSteaming = true;
            this.holdSteam();
            if (redisData && 'mediaSrc' in redisData) {
              const mediaSrc: string = redisData.mediaSrc || '';
              if (mediaSrc.length > 0) {
                const src = mediaSrc.split('?')[0];
                const clipPath = this.configService.get('app.prefix') + src;
                delete redisData.mediaSrc;
                this.logger.info(
                  `user:${this.user_id}:first render stream` +
                    JSON.stringify({ path: clipPath, meta: redisData }),
                );
                const status = await this.pushFirstRender(
                  clipPath,
                  JSON.stringify(redisData),
                );
                if (status) {
                  this.firstRender = true;
                  this.frameCnt.next(2);
                  this.resumeStream();
                } else {
                  this.logger.error('first render problem', status);
                }
              }
            } else {
              this.logger.error(`first render problem:${frame}`);
            }
          }

          if (frame > 1) {
            const isOk =
              !this.onMoving.value &&
              !this.onRotating.value &&
              !this.onJoysticking.value &&
              !this.onSteaming &&
              this.firstRender;

            console.log(
              '空白流条件-->:' +
                isOk +
                ' onMoving: ' +
                this.onMoving.value +
                ' onRotating: ' +
                this.onRotating.value +
                ' onJoysticking: ' +
                this.onJoysticking.value +
                ' onSteaming: ' +
                this.onSteaming +
                ' firstRender: ' +
                this.firstRender,
            );
          }

          if (
            frame > 1 &&
            !this.onMoving.value &&
            !this.onRotating.value &&
            !this.onJoysticking.value &&
            !this.onSteaming &&
            this.firstRender
          ) {
            // debugger
            const redisDataAuto = await this.rotateService.echo(
              this.user_id,
              false,
            );
            if (redisDataAuto) {
              this.logger.info(`空白流::有数据：${frame}`);
              'mediaSrc' in redisDataAuto && delete redisDataAuto.mediaSrc;
              const streamMeta: StreamMetaType = {
                frame: frame,
                metaData: JSON.stringify(redisDataAuto),
              };
              this.streamService.pushMetaDataToSteam(streamMeta);
            } else {
              this.stopStream();
              this.logger.info('空流无Redis数据');
            }
          }
        } catch (error) {
          if (this.frameCnt.getValue() === 1) {
            this.logger.error('首屏读取有误:', redisData, error.message);
          }
          this.stopStream();
          this.logger.error('handleStream', error.message);
        }
      });
    }
  }
}
