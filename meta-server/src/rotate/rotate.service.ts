import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from 'src/cache/cache.service';
// import { SceneService } from 'src/scene/scene.service';
// import ShareData from 'src/ShareData';

const seqExeAsyncFn = (asyncFn) => {
  let runPromise = null;
  return function seq(...args) {
    if (!runPromise) {
      //debugger;
      runPromise = asyncFn.apply(this, args);
      runPromise.then((data) => {
        //debugger;
        // console.log('seq result', data);
      });
      runPromise.then(() => (runPromise = null));
      return runPromise;
    } else {
      return runPromise.then(() => seq.apply(this, args));
    }
  };
};

@Injectable()
export class RotateService {
  constructor(
    private cacheService: CacheService, // private sceneService: SceneService,
    private configService: ConfigService,
  ) {}
  private actionRequestPool = {};
  private logger: Logger = new Logger('rotateService');
  private Actions = {
    Clicking: 1,
    Rotation: 1014,
    Joystick: 15,
  };

  public users = {};
  private replys = {};
  private firstPoint = {
    player: {
      //position: { x: -600.0, y: -250.0, z: 0.0 }, //position: { x: -560.0, y: 320.0, z: 0.0 }, //{ x: -800.0, y: 100.0, z: 0.0 },
      position: {
        x: -560.0,
        y: 320.0,
        z: 0.0,
      },
      angle: {
        pitch: 0,
        yaw: 0,
        roll: 0,
      },
    },
    // {\"x\":-998.0,\"y\":319.9999694824219,\"z\":120.0}
    camera: {
      position: { x: -998.0, y: 320, z: 120.0 }, //{ x: -1141.6719970703125, y: 94.03607940673828, z: 120.0 },  //{ x: -998.0, y: 319.9999694824219, z: 120.0 }
      angle: {
        pitch: 0,
        yaw: 0,
        roll: 0,
      },
    },
  };

  init(
    app_id: string,
    userId: string,
    skinId: string,
    roomId: string,
    avatar_id: string,
  ) {
    const user = {
      appId: null,
      userId: null,
      breakPointId: null,
      roomId: null,
      skinId: null,
      avatar_id: null,
      player: {
        position: { x: -560.0, y: 320.0, z: 0.0 }, //{ x: -800.0, y: 100.0, z: 0.0 },
        angle: {
          pitch: 0,
          yaw: 0,
          roll: 0,
        },
      },
      camera: {
        position: { x: -998.0, y: 319.9999694824219, z: 120.0 }, //{ x: -1141.6719970703125, y: 94.03607940673828, z: 120.0 },
        angle: {
          pitch: 0,
          yaw: 0,
          roll: 0,
        },
      },
      rotateInfo: {
        frameIndex: 0,
        horizontal_move: 0,
      },
      netQua:0,
      walkState:0,
      isMoving:0,
      IDRCount:0,
      // traceIds: [],
      // actionResponses:[]
    };

    user.appId = app_id;
    user.userId = userId;
    user.breakPointId = Number(this.configService.get('app.startPoint')) || 0;
    user.skinId = skinId;
    user.roomId = roomId;
    user.avatar_id = avatar_id;

    user.player.position = JSON.parse(
      JSON.stringify(this.firstPoint.player.position),
    );
    user.camera.position = JSON.parse(
      JSON.stringify(this.firstPoint.camera.position),
    );
    console.log('user-init1', userId);
    this.users[userId] = user;
    console.log('user-init2', JSON.stringify(this.users));

    const reply = {
      traceIds: [],
      vehicle: null,
      mediaSrc: null,
      newUserStates: [
        {
          userId: 'dcff36ae4fc1d',
          playerState: {
            roomTypeId: '',
            person: 0,
            avatarId: '',
            skinId: '',
            roomId: '',
            isHost: false,
            isFollowHost: false,
            skinDataVersion: '',
            avatarComponents: '',
            nickName: '',
            movingMode: 0,
            attitude: '',
            areaName: '',
            pathName: '',
            pathId: '',
            avatarSize: 1,
            extra: '',
            prioritySync: false,
            player: {
              position: { x: 100.0, y: 100.0, z: 0.0 },
              angle: {
                pitch: 0,
                yaw: 0,
                roll: 0,
              },
            },
            camera: {
              position: { x: -338.0, y: 100, z: 120.0 },
              angle: {
                pitch: 0,
                yaw: 0,
                roll: 0,
              },
            },
            cameraCenter: { x: 100.0, y: 100.0, z: 0.0 },
          },
          renderInfo: {
            renderType: 0,
            videoFrame: null,
            cameraStateType: 3,
            isMoving: 0,
            needIfr: 0,
            isVideo: 0,
            stillFrame: 0,
            isRotating: 0,
            isFollowing: 0,
            clientPanoTitlesBitmap: [],
            clientPanoTreceId: '',
            prefetchVideoId: '',
            noMedia: false,
          },
          event: null,
          relation: 1,
        },
      ],
      actionResponses: [
        {
          // "actionType": 15,
          // "pointType": 100,
          extra: '',
          // "traceId": "d0864cd0-378d-4d49-b7b0-3e8e1b9494c3",
          // "packetId": "d44bd2f5-f877-4dd7-868b-803c64f99082",
          nps: [],
          peopleNum: 0,
          zoneId: '',
          echoMsg: '',
          reserveDetail: null,
          userWithAvatarList: [],
          newUserStates: [],
          code: 0,
          msg: '',
        },
      ],
      getStateType: 0,
      code: 0,
      msg: 'OK',
    };

    reply['newUserStates'][0].playerState.player.position = JSON.parse(
      JSON.stringify(this.firstPoint.player.position),
    );
    reply['newUserStates'][0].playerState.camera.position = JSON.parse(
      JSON.stringify(this.firstPoint.camera.position),
    );
    this.replys[userId] = reply;
    return reply;
  }

  //首帧
  getFirstStreamData(appId, userId) {
    const user = this.users[userId];
    const reply = this.replys[userId];
    reply.traceIds = [];
    reply['newUserStates'][0].userId = userId;
    reply['newUserStates'][0].playerState.player.position = JSON.parse(
      JSON.stringify(this.firstPoint.player.position),
    );
    reply['newUserStates'][0].playerState.player.angle = JSON.parse(
      JSON.stringify(this.firstPoint.player.angle),
    );
    reply['newUserStates'][0].playerState.camera.position = JSON.parse(
      JSON.stringify(this.firstPoint.camera.position),
    );
    reply['newUserStates'][0].playerState.camera.angle = JSON.parse(
      JSON.stringify(this.firstPoint.camera.angle),
    );
    reply['newUserStates'][0].playerState.cameraCenter = JSON.parse(
      JSON.stringify(this.firstPoint.player.position),
    );
    reply['actionResponses'][0].traceId = null;

    reply.mediaSrc =
      '/' +
      appId +
      '/' +
      user.breakPointId +
      '/' +
      user.breakPointId +
      '/' +
      user.breakPointId +
      '.0000.h264' +
      '?m=' +
      new Date().getTime();
    reply['newUserStates'][0].renderInfo.isMoving = 0;
    this.replys[userId] = reply;
    return reply;
  }

  /**
   * delete User object
   * @param userId
   */
  deleteUser(userId: string) {
    if (userId in this.users) {
      delete this.users[userId];
      console.log('[delete User]--存在用户 %s', userId);
    }
  }

  // 顺序旋转请求
  seqExeRotate = seqExeAsyncFn(this.rotate);

  //旋转请求
  async rotate(actionRequest) {
    // return new Promise(async (resolve, reject) => {
    try {
      const userId = actionRequest['user_id'];
      if (this.actionRequestPool[userId]) {
        this.actionRequestPool[userId].push(actionRequest);
      } else {
        this.actionRequestPool[userId] = [];
        this.actionRequestPool[userId].push(actionRequest);
      }

      let reply = this.replys[userId];

      const actionRequests = this.actionRequestPool[userId];
      const user = this.users[userId];
      // debugger;
      let horizontal_move = user.rotateInfo.horizontal_move;
      //const traceIds = user.traceIds;
      let sub = 0;
      for (let i = 0; i < actionRequests.length; ++i) {
        if (actionRequests[i].action_type == this.Actions.Rotation) {
          horizontal_move += actionRequests[i].rotation_action.horizontal_move;
          reply.traceIds.push(actionRequests[i].trace_id);
          const actionResponse = this.createActionResponse(
            actionRequests[i].action_type,
            actionRequests[i].trace_id,
          );
          reply.actionResponses.push(actionResponse);
          ++sub;
        } else {
          break;
        }
      }

      actionRequests.splice(0, sub);
      const hAngle = horizontal_move * 90;
      if (Math.abs(hAngle) < 1) {
        user.rotateInfo.horizontal_move = horizontal_move;
        //user.traceIds = traceIds;
        this.replys[userId] = reply;
        return null;
      }
      reply = await this.rotateForAngle(userId, Math.floor(hAngle));
      // console.log('rotate-cameraAngle：, yaw: %s, ', user.camera.angle.yaw);
      return reply;
      // return resolve(reply);
    } catch (error) {
      throw error;
      // console.log('RotateService', error);
      // return reject(error);
    }
    // });
  }

  // test(){
  //   while(true){
  //     if(this.actionRequests.length>0){
  //       let actionRequest = this.actionRequests[0];
  //       //执行
  //       //添加队列
  //     }
  //   }
  // }

  // receiveRotate(actionRequest){
  //   this.actionRequests.push(actionRequest)
  // }

  async rotateForAngle(userId, hAngle): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const user = this.users[userId];
        // console.log(
        //   '当前镜头角度, yaw: %s, hAngle: %s',
        //   user.camera.angle.yaw,
        //   hAngle,
        // );
        // console.time('当前镜头角度 %s', user.camera.angle.yaw, '旋转角度：', hAngle);
        user.camera.angle.yaw += Math.floor(hAngle);
        if (user.camera.angle.yaw < 0) {
          user.camera.angle.yaw = 360 + user.camera.angle.yaw;
        } else if (user.camera.angle.yaw > 359) {
          user.camera.angle.yaw -= 360;
        }
        const reply = JSON.parse(JSON.stringify(this.replys[userId]));
        reply['newUserStates'][0]['userId'] = userId;
        //从redis里取
        //let key = user.appId + "-"+user.breakPointId+"-"+user.rotateInfo.frameIndex;
        let key =
          'rotateframe:app_id:' +
          user.appId +
          ':frame_index:' +
          user.camera.angle.yaw +
          ':break_point_id:' +
          user.breakPointId;
        // const value = null;
        console.log('rotateForAngle-3:' + user.breakPointId);
        console.log('rotateForAngle-3-key:' + key);
        this.logger.log('rotateForAngle-3-key', key);
        let redisData = await this.cacheService.get(key);
        //if (redisData && redisData.length > 0) {
        let value = JSON.parse(redisData); //redisData ? JSON.parse(redisData) : null;
        //console.log('rotateForAngle-4：'+user.breakPointId+','+value.directory+','+value.fileName);
        if (value.directory != user.breakPointId) {
          key =
            'rotateframe:app_id:' +
            user.appId +
            ':frame_index:' +
            user.camera.angle.yaw +
            ':break_point_id:' +
            user.breakPointId;
          redisData = await this.cacheService.get(key);
          value = JSON.parse(redisData);
        }
        // console.log('rotate-service', value);
        user.camera['position'] = JSON.parse(
          JSON.stringify(value.cameraPosition),
        ); //value ? value.cameraPosition : '';
        user.camera['angle'] = JSON.parse(JSON.stringify(value.cameraAngle)); //value ? value.cameraAngle : '';

        reply['newUserStates'][0]['playerState'].player.position = JSON.parse(
          JSON.stringify(user.player.position),
        );
        reply['newUserStates'][0]['playerState'].player.angle = JSON.parse(
          JSON.stringify(user.player.angle),
        );
        //this.reply['newUserStates'][0]['playerState'] .player
        reply['newUserStates'][0]['playerState'].camera.position = JSON.parse(
          JSON.stringify(value.cameraPosition),
        );
        reply['newUserStates'][0]['playerState'].camera.angle = JSON.parse(
          JSON.stringify(value.cameraAngle),
        );
        reply['newUserStates'][0]['playerState'].cameraCenter = JSON.parse(
          JSON.stringify(user.player.position),
        );
        // debugger
        reply.mediaSrc =
          '/' +
          user.appId +
          '/' +
          user.breakPointId +
          '/' +
          value.directory +
          '/' +
          value.fileName +
          '?m=' +
          new Date().getTime();

        console.log(
          'rotateForAngle-5：' +
            user.breakPointId +
            ',' +
            value.directory +
            ',' +
            value.fileName,
        );
        reply.breakPointId = user.breakPointId;
        this.replys[userId].traceIds = [];
        this.replys[userId].actionResponses = [];

        user.rotateInfo.horizontal_move = 0;
        return resolve(reply);
        //}
        // else {
        //   return null;
        // }
      } catch (error) {
        debugger;
        this.logger.error('rotateForAngle::function', error);
        return reject(error);
      }
    });
  }

  createActionResponse(actionType, traceId) {
    const actionResponse = {
      actionType: actionType,
      pointType: 100,
      extra: '',
      traceId: traceId,
      packetId: '',
      nps: [],
      peopleNum: 0,
      zoneId: '',
      echoMsg: '',
      reserveDetail: null,
      userWithAvatarList: [],
      newUserStates: [],
      code: 0,
      msg: '',
    };
    return actionResponse;
  }

  getNewUserStateRequest(actionRequest) {
    try {
      const userId = actionRequest['user_id'];
      const actionType = actionRequest['action_type'];
      const traceId = actionRequest['trace_id'];

      const reply = {
        actionType: actionType,
        pointType: 100,
        extra: '',
        traceId: traceId,
        packetId: '',
        nps: [],
        peopleNum: 0,
        zoneId: '',
        echoMsg: '',
        reserveDetail: null,
        userWithAvatarList: [],
        newUserStates: [],
        code: 0,
        msg: '',
      };
      
      const userIds = Object.keys(this.users);
      console.log('getNewUserStateRequest'+userIds);
      for (let i = 0; i < userIds.length; ++i) {
        const _user = this.users[userIds[i]];
        const newUserState = {
          userId: userIds[i],
          playerState: {
            roomTypeId: '',
            person: 0,
            avatarId: _user.avatar_id,
            skinId: _user.skinId,
            roomId: _user.roomId,
            isHost: false,
            isFollowHost: false,
            skinDataVersion: '1008900008',
            avatarComponents: '',
            nickName: userIds[i],
            movingMode: 0,
            attitude: 'walk',
            areaName: '',
            pathName: 'thirdwalk',
            pathId: 'thirdwalk',
            avatarSize: 1,
            extra: '{"removeWhenDisconnected":true}',
            prioritySync: false,
            player: {
              position: _user.player.position,
              angle: _user.player.angle,
            },
            camera: null,
            cameraCenter: null,
          },
          renderInfo: {
            renderType: 0,
            videoFrame: null,
            cameraStateType: 0,
            isMoving: 0,
            needIfr: 0,
            isVideo: 0,
            stillFrame: 0,
            isRotating: 0,
            isFollowing: 0,
            clientPanoTitlesBitmap: [],
            clientPanoTreceId: '',
            prefetchVideoId: '',
            noMedia: false,
          },
          event: {
            id: '',
            type: 0,
            points: [],
            rotateEvent: null,
            removeVisitorEvent: null,
          },
          relation: 0,
        };
        reply['newUserStates'].push(newUserState);
      }

      return reply;
    } catch (error) {
      this.logger.error('getNewUserStateRequest::function', error);
    }
  }

  async echo(userId: string, isFirst: boolean) {
    const user = this.users[userId];
    const reply = JSON.parse(JSON.stringify(this.replys[userId]));
    reply['newUserStates'][0]['userId'] = userId;
    reply['newUserStates'][0]['playerState'].player.position =
      user.player.position;
    reply['newUserStates'][0]['playerState'].player.angle = user.player.angle;
    reply['newUserStates'][0]['playerState'].camera.position =
      user.camera['position'];
    reply['newUserStates'][0]['playerState'].camera.angle =
      user.camera['angle'];
    reply['newUserStates'][0]['playerState'].cameraCenter =
      user.player.position;

    if (isFirst) {
      reply.mediaSrc =
        '/' +
        user.appId +
        '/' +
        user.breakPointId +
        '/' +
        user.breakPointId +
        '/' +
        `${user.breakPointId}.0000.h264` +
        '?m=' +
        new Date().getTime();
      reply.breakPointId = user.breakPointId;
      return reply;
    } else {
      let fileName = user.camera.angle.yaw + '.h264';
      if (fileName.length == 8) {
        fileName = '0' + fileName;
      } else if (fileName.length == 7) {
        fileName = '00' + fileName;
      } else if (fileName.length == 6) {
        fileName = '000' + fileName;
      }
      reply['newUserStates'][0].renderInfo.isMoving = user.isMoving;
      reply.mediaSrc =
        '/' +
        user.appId +
        '/' +
        user.breakPointId +
        '/' +
        user.breakPointId +
        '/' +
        user.breakPointId +
        '.' +
        fileName +
        '?m=' +
        new Date().getTime();
      reply.breakPointId = user.breakPointId;
      return reply;
    }
  }
}
