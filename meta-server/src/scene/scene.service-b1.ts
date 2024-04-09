import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, Client } from '@nestjs/microservices';
import { grpcClientOptions } from './grpc-scene.options';
import { Logger } from '@nestjs/common';
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

@Injectable()
export class SceneService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private configService: ConfigService,
    private cacheService: CacheService,
    private streamService: StreamService,
    private rotateService: RotateService,
    private moveService: MoveService,
    private getRouterService: GetRouterService, // @InjectQueue('rotate') private rotateQueue: Queue, // @InjectQueue('walking') private walkingQueue: Queue,
  ) {}
  @Client(grpcClientOptions) private readonly client: ClientGrpc;

  public _frameInteval: NodeJS.Timeout;
  public _frameTimeout: NodeJS.Timeout;
  public _rotateTimeout: NodeJS.Timeout;
  public _moveTimeout: NodeJS.Timeout;
  public _JoyStickingTimeout: NodeJS.Timeout;
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

  private sceneGrpcService: SceneGrpcService;
  private channel: DataChannel;
  private peer: PeerConnection;
  private logger: Logger = new Logger('SceneService');
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
  private joystickSub: any;
  private clickQueueSub: any;
  private _rotateCurrentFame = -1;
  private _rotateCount = -1;

  private streamServiceSub: any;
  // private roRequestQueue: RxQueue = new DelayQueue(20);
  private roQueue: RxQueue = new DelayQueue(
    Number(this.configService.get('queueConfig.rotate')) || 20,
  );
  private moveQueue: RxQueue = new DelayQueue(
    Number(this.configService.get('queueConfig.move')) || 20,
  );
  // private joystickQueue: RxQueue = new DelayQueue(
  //   Number(this.configService.get('queueConfig.joystick')) || 10,
  // );
  private requestIFrameQueue: RxQueue = new DebounceQueue(2000);

  private requestIFrameQueueSub: any;
  private roRequestQueueSub: any;
  private joystickQueueSub: any;
  private rotateTimeStamp: number;
  private rewalking = false;
  private firstRender = false;
  private latestBreakPointId: number;
  private isHoldingStream = false;
  private lastMovingPointArray: MovingLastUpdateType[] = [];
  private latestWalkingRequest: any; // 最新waking的接收值
  private hasJoystickMoveRequest = false; // 最新joystick的接收值

  private moveSliceLastFrame = new BehaviorSubject<MovingLastUpdateType>(null);
  private moveSliceLastFrameSub: any;

  public lastMoveStreamFrame = new BehaviorSubject<StreamFrameType>({
    frame: -1,
    clipPath: '',
    metaData: '',
  });

  private isJoystickHasStream = false;

  public users = {};

  public sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  onModuleInit(): void {
    this.sceneGrpcService =
      this.client.getService<SceneGrpcService>('SceneGrpcService');
    this.logger.log('init SceneGrpcService');
    this.streamServiceSub = this.streamService.onSteaming.subscribe((val) => {
      this.onSteaming = val;
    });
    Number.prototype.padLeft = function (n, str) {
      return Array(n - String(this).length + 1).join(str || '0') + this;
    };
    this.logger.log('roQueue-period :' + Number(this.roQueue.period));
    this.logger.log('moveQueue-period :' + Number(this.moveQueue.period));
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
    this.isHoldingStream = true;
  }

  public resumeStream(): void {
    this.onMoving.next(false);
    this.onRotating.next(false);
    this.onJoysticking.next(false);
    this.isHoldingStream = false;
    this.moveframeCnt = -1;
    this.rotateframeCnt = -1;
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
      //this.rotateService.init(request.app_id, request.user_id);
      this.rotateService.init(
        request.app_id,
        request.user_id,
        request.skin_id,
        request.roomId,
        request.avatar_id,
      );
      this.cacheService.getClient();
      // 加载
    } catch (error) {
      this.logger.error('error', error);
    }
  }

  exit() {
    this.frameCnt.next(-1);
    this.rotateService.deleteUser(this.user_id);
  }

  async rotate(request: RotateRequest) {
    this.handleRotate(request);
    this._rotateCount += 1;
    //this.logger.log('request', request)
    // this.roRequestQueue.next(request);
    // if (!this.roRequestQueueSub) {
    //   this.handleRotate();
    // }
  }
  /**
   * rotate请求队列
   */

  async handleRotate(request) {
    // try {
    if (this.firstRender) {
      if (!this.roQueueSubscription) {
        this.handleRotateStream();
      }
      let redisMeta: StreamReplyType;
      this.onRotating.next(true);
      const start = performance.now();
      // 当move时处理 _rotateCount是移动端同时触发的问题,rotateStopThrottle是减少重复抖动stop的处理。
      if (
        this.onMoving.getValue() &&
        this._rotateCount > 5 &&
        !this.rotateStopThrottle
      ) {
        this.rotateStopThrottle = true;
        const lastStreamFrame = this.lastMoveStreamFrame.getValue();
        this.logger.log('lastStreamFrame', JSON.stringify(lastStreamFrame));
        // this.logger.log(
        //   'lastMoveStreamFrameBk',
        //   JSON.stringify(lastMoveStreamFrameBk),
        // );

        const metaData: StreamReplyType = JSON.parse(
          lastStreamFrame.metaData,
        ) as any as StreamReplyType;
        if (!metaData.endBreakPointId) {
        }
        console.log('stop-4', metaData.traceIds[0]);
        console.log('stop-5', request.trace_id);
        //判断request是否是新的
        if (metaData.traceIds.indexOf(request.trace_id) > -1) {
          return;
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
        this.logger.log(
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
        redisMeta = await this.moveService.stop(
          trace_id,
          userId,
          breakPointId,
          cameraAngle,
          playerAngle,
        );
        this.logger.log('stop-redisMeta', redisMeta);
        this.onMoving.next(false);
        this.cleanMoveSteam();
        // redisMeta = await this.rotateService.rotate(request);
      } else {
        // 正常rotate
        redisMeta = await this.rotateService.seqExeRotate(request);
      }

      if (redisMeta && 'mediaSrc' in redisMeta) {
        const mediaSrc: string = redisMeta.mediaSrc || '';
        if (mediaSrc.length > 0) {
          const src = mediaSrc.split('?')[0];
          //this.logger.log('进入roQueue1', redisMeta.newUserStates[0].playerState.camera.angle.yaw);
          //this.logger.log('进入roQueue2', src);
          if (src.length > 0) {
            //this.logger.log('不同源');
            this.holdSteam();
            this.lastRenderMedia = src;
            const clipPath = this.configService.get('app.prefix') + src;
            //TODO 临时开出
            // delete redisMeta.mediaSrc;
            const stream: StreamFrameType = {
              frame: -1,
              clipPath: clipPath,
              metaData: JSON.stringify(redisMeta),
              serverTime: this.mockserverTime,
              DIR: 3,
            };
            //this.logger.log('rotate', stream, Date.now());
            clearTimeout(this._rotateTimeout);

            //this.logger.log('进入roQueue3', stream.clipPath);
            const stop = performance.now();
            const inMillSeconds = stop - start;
            const rounded = Number(inMillSeconds).toFixed(3);
            this.logger.log(
              `[timer]-rotate-入队列前: ${rounded}ms -->` +
                JSON.stringify(stream),
            );

            this.roQueue.next(stream);
          } else {
            // this.onRotating.next(false);
          }
        }
      }
    }
    // } catch (error) {
    //   this.logger.error('rotate', error.message);
    //   console.error('error', error);
    // }
  }

  async walking(request: MoveRequest) {
    this.latestWalkingRequest = request;
    this.logger.log('walking-trace_id', request.trace_id);
    // 进入正常walking流程
    if (!this.onMoving.getValue()) {
      console.log('walking-step-main-1', request.trace_id);
      this.latestWalkingRequest = null;
      this.handleWalking(request);
    }

    console.log('moveSliceLastFrameSub', !!this.moveSliceLastFrameSub);

    // 监听每小段最后一帧
    if (!this.moveSliceLastFrameSub) {
      this.moveSliceLastFrameSub = this.moveSliceLastFrame.subscribe(
        async (frame: MovingLastUpdateType) => {
          //TODO 正在行走时，有新的reqest
          if (frame) {
            this.logger.log('行走每段最后一帧', JSON.stringify(frame));
            if (this.latestWalkingRequest && this.onMoving.value) {
              this.logger.log('stop-data-1', frame);
              this.moveQueueSubscription.unsubscribe();
              this.moveQueueSubscription = null;
              this.moveQueue.clean();
              //step1 执行stop方法
              const metaData: StreamReplyType = frame.metaData;
              const newUserStates: NewUserStatesType =
                metaData.newUserStates.find(
                  (item) => item.userId === this.user_id,
                );
              const trace_id = metaData.traceIds[0];
              const userId = newUserStates.userId;
              const breakPointId = metaData.endBreakPointId;
              const cameraAngle = newUserStates.playerState.camera.angle;
              const playerAngle = newUserStates.playerState.player.angle;
              this.logger.log(
                'stop-data-2',
                trace_id,
                userId,
                cameraAngle,
                cameraAngle,
              );
              console.log('moveService.stop-2:' + breakPointId);
              const redisMeta = await this.moveService.stop(
                trace_id,
                userId,
                breakPointId,
                cameraAngle,
                playerAngle,
              );
              this.logger.log('stop-redisMeta', JSON.stringify(redisMeta));
              // 2. 中断重新walking
              console.log(
                'walking-step-reWalking-1',
                request.trace_id + ',' + this.latestWalkingRequest.trace_id,
              );
              // 中断清除上一次最后小段队列
              // if (this.moveSliceLastFrameSub) {
              //   this.moveSliceLastFrameSub.unsubscribe();
              //   this.moveSliceLastFrameSub = null;
              // }

              this.logger.debug('重新行走---handleReWalking');
              console.log('重新行走---handleReWalking');
              this.handleReWalking(this.latestWalkingRequest);
            }
          }
        },
      );
    }
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
      this.logger.log(
        'handleWalking-users' +
          JSON.stringify(this.moveService.users) +
          ' this.user_id: ' +
          this.user_id,
      );
      this.logger.log(
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
      this.logger.log('walking-path', path);
      if (!path) {
        console.log('不存在--path', path);
        this.resumeStream();
        return;
      }
      // debugger;
      const walkingRes = await this.moveService.move(path, request);

      //this.logger.log('walking', walkingRes);
      // debugger;
      // console.log('walking:'+JSON.stringify(walkingRes))
      // console.log('this.onMoving.value:'+this.onMoving.value)
      if (walkingRes && (!this.onMoving.value || this.rewalking)) {
        //this.logger.log('walkingRes-front', walkingRes);
        // shift出前第一个镜头数据
        const rotateCamData = walkingRes[0];
        this.logger.log('rotateCamData', rotateCamData.length);
        if (rotateCamData?.length) {
          // 头数组[0] rotate 序列， 头是关键key
          walkingRes[0].forEach((item: StreamReplyType, index: number) => {
            item.mType = 'rotate';
            // item.DIR = index === 0 ? 1 : 3;
            const IDRflag = index % 5 === 0 ? 1 : 3;
            const dir = this.isHeaderOrLast(index, walkingRes[0].length - 1);
            item.DIR = dir ? 1 : IDRflag;
          });
        } else {
          this.logger.log('rotateCamData无数据');
        }

        // 二维数组 做move 序列， move类型
        //console.log('move-walkingRes:' + JSON.stringify(walkingRes));
        if (walkingRes && walkingRes?.length >= 1) {
          for (let i = 1; i < walkingRes.length; i++) {
            Array.from(walkingRes[i]).forEach(
              (item: StreamReplyType, index: number) => {
                const IDRflag = index % 5 === 0 ? 1 : 3;
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
          this.logger.log(
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
          this.logger.log(`[timer]-move-入队列前：-->${rounded}ms`);

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
    this.latestWalkingRequest = null;
    this.rewalking = true;
    this.handleWalking(request);
  }

  /***
   * joystick main core
   */
  async joystick(request: JoystickRequest) {
    // TODO hasJoystickMoveRequest中断
    this.logger.log('this.hasJoystickMoveRequest', this.hasJoystickMoveRequest);
    if (!this.hasJoystickMoveRequest) {
      this.handlejoystick(request);
    }
  }

  /***
   * joystick
   */

  async handlejoystick(request: JoystickRequest) {
    try {
      //const joystickRes = await this.moveService.joystick(request);
      this._rotateCount = 0;
      const joystickRes = await this.moveService.seqExeJoystick(request);
      this.logger.log(
        'joystick-breakPointId:' +
          this.moveService.users[this.user_id].breakPointId,
      );
      // 有数据 [0]是rotate数据，[1-infinity]是walking数据
      this.logger.log('joystickRes-1', joystickRes);

      if (joystickRes) {
        this.onJoysticking.next(true);
        // console.log(
        //   'handlejoystick:' +
        //     joystickRes.mediaSrc +
        //     '，相机坐标：' +
        //     JSON.stringify(
        //       joystickRes.newUserStates[0].playerState.camera.position,
        //     ),
        console.log(
          'handlejoysticktesttest:' +
            joystickRes.mediaSrc +
            '，相机坐标：' +
            JSON.stringify(
              joystickRes.newUserStates[0].playerState.player.position,
            ),
        );
        if (joystickRes.mediaSrc) {
          this.holdSteam();
          console.log('joystickRes有mediaSrc', joystickRes.mediaSrc);
          const mediaSrc = joystickRes.mediaSrc.split('?')[0];
          // IDR flag设置为I帧
          const setDIR = joystickRes.moveOver || joystickRes.moveStart ? 1 : 3;
          // 过滤新东西, 推完给回false
          this.moveService.sendingFrameForJoystick = true;

          if (this.joystickFrameCnt === -1) {
            this.joystickFrameCnt = this.frameCnt.getValue();
          }
          this.joystickFrameCnt += 1;
          const streamData: StreamFrameType = {
            frame: this.joystickFrameCnt,
            clipPath: mediaSrc,
            metaData: JSON.stringify(joystickRes),
            serverTime: this.mockserverTime,
            DIR: setDIR,
          };

          const hasPush = await this.streamService.pushFrameToSteam(streamData);
          if (hasPush.done) {
            this.isJoystickHasStream = true;
            console.log('joystick-hasPush', hasPush);
            if (this.isJoystickHasStream) {
              await this.sleep(30);
            }
            this.moveService.sendingFrameForJoystick = false;
            const data = joystickRes as StreamReplyType;
            console.log('handlejoystick-moveOver:' + data.moveOver);
            if (data?.moveOver && data.moveOver) {
              // moveOver
              console.log('回传updateUser', data);
              // const userId = this.user_id;
              // 回传点暂时有问题，待修复
              //const breakPointId = data.endBreakPointId || data.breakPointId;
              //const lastReply = JSON.stringify(joystickRes);
              //this.moveService.updateUser(userId, breakPointId, lastReply);
            }
            clearTimeout(this._JoyStickingTimeout);
            this._JoyStickingTimeout = setTimeout(() => {
              this.frameCnt.next(hasPush.frame);
              this.logger.log('joystick opt done');
              this.logger.log('joystick 交权给空流,当前pts', hasPush.frame);
              // this.frameCnt.next(res.frame);
              this.onJoysticking.next(false);
              this.resumeStream();
              this.joystickFrameCnt = -1;
              this.isJoystickHasStream = false;
            }, 200);
          } else {
            console.error(
              'joystick-流地址有误::',
              hasPush.frame,
              joystickRes.mediaSrc,
            );
            this.logger.error(
              'joystick-流地址有误::',
              hasPush.frame,
              joystickRes.mediaSrc,
            );
            this.resumeStream();
          }
        } else {
          this.logger.log('joystick-接收人物数据', this.onMoving.getValue());
          if (!this.onMoving.getValue()) {
            // 在非行走时接受
            this.holdSteam();
            if (this.joystickFrameCnt === -1) {
              this.joystickFrameCnt = this.frameCnt.getValue();
            }
            // 人物数据去掉mediaSrc以免前误会
            joystickRes?.mediaSrc && delete joystickRes.mediaSrc;

            this.joystickFrameCnt += 1;
            const stream: StreamMetaType = {
              frame: this.joystickFrameCnt,
              metaData: JSON.stringify(joystickRes),
            };
            //this.logger.log('rotate', stream, Date.now());
            const res = await this.streamService.pushMetaDataToSteam(stream);
            if (res.done) {
              this.logger.log('joystick-frame', res.frame);
              this.frameCnt.next(res.frame);
              clearTimeout(this._JoyStickingTimeout);
              this._JoyStickingTimeout = setTimeout(() => {
                this.logger.log('joystick opt done');
                this.logger.log('joystick 交权给空流,当前pts', res.frame);
                // this.frameCnt.next(res.frame);
                this.onJoysticking.next(false);
                this.resumeStream();
                this.joystickFrameCnt = -1;
              }, 200);
            } else {
              console.error(
                'joystick-位置流有误::',
                res.frame,
                joystickRes.mediaSrc,
              );
              this.logger.error(
                'joystick-位置流有误::',
                res.frame,
                joystickRes.mediaSrc,
              );
              this.resumeStream();
            }
          }
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
    if (!this.moveQueueSubscription) {
      this.handleMoveSteam();
    }
    // this.logger.log('moving-seqs', seqs.length);
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
      this.moveQueue.next(stream);
    });
  }

  cleanMoveSteam() {
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
  handleMoveSteam() {
    this.moveQueueSubscription = this.moveQueue.subscribe(
      async (stream: StreamFrameType) => {
        try {
          const metaData: StreamReplyType = JSON.parse(stream.metaData);
          if (this.moveframeCnt === -1) {
            this.moveframeCnt = this.frameCnt.getValue();
          }
          this.moveframeCnt += 1;
          this.latestBreakPointId = metaData.endBreakPointId;

          const streamData: StreamFrameType = {
            frame: this.moveframeCnt,
            clipPath: stream.clipPath,
            metaData: stream.metaData,
            serverTime: this.mockserverTime,
            DIR: stream.DIR,
          };
          this.logger.log(
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
          this.logger.log(
            '[media-move-lastMovingPointArray]',
            this.lastMovingPointArray?.length,
          );
          // 记录lastMoveStreamFrame给打断逻辑使用
          this.lastMoveStreamFrame.next(streamData);
          // this.lastMoveStreamFrameBk = streamData;
          const res = await this.streamService.pushFrameToSteam(streamData);

          const isLastFrameIndex = this.lastMovingPointArray.findIndex(
            (item) => item.mediaSrc === metaData.mediaSrc,
          );
          //this.logger.log('path-update-index', isLastFrameIndex);
          //每一段的最后一帧
          if (isLastFrameIndex > -1) {
            //this.logger.log('path-update-array', this.lastMovingPointArray);
            const currentMeta = this.lastMovingPointArray[isLastFrameIndex];
            const userId = this.user_id;
            const breakPointId = currentMeta.metaData.endBreakPointId;
            const lastReply = currentMeta.metaData;
            this.moveService.updateUser(userId, breakPointId, lastReply);
            //debugger
            this.lastMovingPointArray.splice(isLastFrameIndex, 1);
            //TODO 队列每一段最后one frame
            this.moveSliceLastFrame.next(currentMeta);
          }

          if (res.done) {
            clearTimeout(this._moveTimeout);
            this._moveTimeout = setTimeout(() => {
              this.logger.log('move 交权给空流,当前pts', res.frame);
              this.rewalking = false;
              this.frameCnt.next(res.frame);
              this.rotateframeCnt = -1;
              this.onMoving.next(false);
              this.onJoysticking.next(false);
              this.lastMovingPointArray = [];
              this.hasJoystickMoveRequest = false;
              this.cleanMoveSteam();
              this.resumeStream();
              this.logger.log('move end');
            }, 200);
          } else {
            console.error('流地址有误::', res.frame, JSON.stringify(res));
            this.logger.error(
              `movesteam::当前帧:${res.frame}` + JSON.stringify(res),
            );
            this.resumeStream();
          }
        } catch (error) {
          this.logger.error('handleMoveSteam::error', error);
        }
      },
    );
  }

  handleDataChanelOpen(channel: DataChannel, peer: PeerConnection): void {
    this.channel = channel;
    this.peer = peer;
    this.streamService.setChannel(channel);
    this.startSteaming.next(true);
    this.startStream();
    this.handleStream();
  }

  handleDataChanelClose(): void {
    this.stopStream();
    this.startSteaming.next(false);
    this.streamService.closeChannel();
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
          if (msg.MstType === 0) {
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
    this.requestIFrameQueue.next(this.streamService.lastStreamFrame.getValue());
    if (!this.requestIFrameQueueSub) {
      this.requestIFrameQueueSub = this.requestIFrameQueue.subscribe(
        (frameData: StreamFrameType) => {
          const nextFrame = this.frameCnt.getValue() + 1;
          this.logger.warn('lostIframe', nextFrame);
          frameData.frame = nextFrame;
          this.streamService.pushFrameToSteam(frameData);
          this.frameCnt.next(nextFrame);
          this.resumeStream();
        },
      );
    }
  }

  handleBreath(request) {
    const npsRes = this.moveService.getBreakPoints(request);
    //this.logger.log('npsRes', npsRes.nps);
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
        //this.logger.log(
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
  /**
   * rotate 推送队列
   */
  handleRotateStream() {
    if (!this.roQueueSubscription) {
      this.roQueueSubscription = this.roQueue.subscribe(
        async (stream: StreamFrameType) => {
          this.rotateTimeStamp = Date.now();
          if (this.rotateframeCnt === -1) {
            this.rotateframeCnt = this.frameCnt.value;
          }
          this.rotateframeCnt += 1;

          stream.frame = this.rotateframeCnt;
          this._rotateCurrentFame += 1;

          const IDRflag = this._rotateCurrentFame % 5 === 0 ? 1 : 3;
          this.logger.log(
            `当前rotate ,mainframeCnt:${this.frameCnt.getValue()}, _rotateCurrentFame:${
              this._rotateCurrentFame
            } IDRflag:${IDRflag}`,
          );
          stream.DIR = this.rotateFirstIDR ? 1 : IDRflag;

          if (this.rotateFirstIDR) {
            this.rotateFirstIDR = false;
          }

          this.logger.log(
            '[media-rotate]: ' +
              ', frame: ' +
              stream.frame +
              ', rotateframeCnt: ' +
              this.rotateframeCnt +
              ', clipPath: ' +
              stream.clipPath,
            // stream.metaData,
          );
          // this.logger.log(
          //   `roQueueSubscription:frame:${this.rotateframeCnt}  ` +
          //   JSON.stringify(stream.metaData),
          // );

          const res = await this.streamService.pushFrameToSteam(stream);
          if (res.done) {
            clearTimeout(this._rotateTimeout);
            this._rotateTimeout = setTimeout(() => {
              this.logger.log('rotate end', Date.now());
              this.frameCnt.next(res.frame);
              this.resumeStream();
              this.rotateframeCnt = -1;
              this._rotateCurrentFame = -1;
              this.onMoving.next(false);
              this.onRotating.next(false);
              this.rotateFirstIDR = true;
              //TODO rotate完后清除request队列
              if (this.roRequestQueueSub) {
                this.roRequestQueueSub.unsubscribe();
                this.roRequestQueueSub = null;
              }
            }, 50);
          } else {
            console.error('流地址有误::', res.frame, JSON.stringify(res));
            this.logger.error('流地址有误::', res.frame, JSON.stringify(res));
            this.resumeStream();
          }
        },
      );
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
    this.logger.log('this.frameCntSubscription', this.frameCntSubscription);
    let redisData;
    if (!this.frameCntSubscription) {
      this.frameCntSubscription = this.frameCnt.subscribe(async (frame) => {
        try {
          this.logger.log('frame', frame);
          console.log(
            'mock' +
              ' maxMessageSize: ' +
              this.channel.maxMessageSize() +
              ' bytesReceived: ' +
              this.peer.bytesReceived() +
              ' bytesSent: ' +
              this.peer.bytesSent(),
          );
          if (frame === 1) {
            redisData = await this.rotateService.echo(this.user_id, true);
            this.logger.log('获取-首屏', redisData);
            this.onSteaming = true;
            this.holdSteam();
            if (redisData && 'mediaSrc' in redisData) {
              const mediaSrc: string = redisData.mediaSrc || '';
              if (mediaSrc.length > 0) {
                const src = mediaSrc.split('?')[0];
                const clipPath = this.configService.get('app.prefix') + src;
                delete redisData.mediaSrc;
                this.logger.log(
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
                ' firstRender: ' +
                this.firstRender,
            );
          }

          if (
            frame > 1 &&
            !this.onMoving.value &&
            !this.onRotating.value &&
            !this.onJoysticking.value &&
            this.firstRender
          ) {
            const redisDataAuto = await this.rotateService.echo(
              this.user_id,
              false,
            );
            if (redisDataAuto) {
              this.logger.log(`空白流::有数据：${frame}`);
              'mediaSrc' in redisDataAuto && delete redisDataAuto.mediaSrc;
              const streamMeta: StreamMetaType = {
                frame: frame,
                metaData: JSON.stringify(redisDataAuto),
              };
              this.streamService.pushMetaDataToSteam(streamMeta);
            } else {
              this.stopStream();
              this.logger.log('空流无Redis数据');
            }
          }
        } catch (error) {
          if (this.frameCnt.getValue() === 1) {
            this.logger.error('首屏读取redis有误:', redisData, error.message);
          }
          this.stopStream();
          this.logger.error('handleStream', error.message);
        }
      });
    }
  }
}
