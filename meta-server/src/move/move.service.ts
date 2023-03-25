import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { CacheService } from 'src/cache/cache.service';
import { RotateService } from 'src/rotate/rotate.service';
import configuration from 'src/config/configuration';
// import ShareData from 'src/ShareData';

// import * as  BreakPointIds from '../../ws/points-BreakPointId.json';
// import { SceneService } from 'src/scene/scene.service';

const MaxDelayTime = 80; //超过这个值就需要干预（操作杆）
const MaxBufferCameraInfo = 3; //超过这个值就需要干预（操作杆）
const MaxNet = 30000000;
const MaxWalkCount = 2;

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
export class MoveService implements OnModuleInit {
  constructor(
    private cacheService: CacheService,
    private rotateService: RotateService,
    private configService: ConfigService,
  ) {}
  private logger: Logger = new Logger('MoveService');
  private Actions = {
    Clicking: 1,
    Rotation: 1014,
    Joystick: 15,
  };
  public users = this.rotateService.users;

  private reply = {
    traceIds: [],
    vehicle: null,
    mediaSrc: null,
    isIDR: false,
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
            position: { x: -700, y: 0, z: 0 },
            angle: {
              pitch: 0,
              yaw: 0,
              roll: 0,
            },
          },
          camera: {
            position: { x: -1145, y: 0, z: 160 },
            angle: {
              pitch: 0,
              yaw: 0,
              roll: 0,
            },
          },
          cameraCenter: { x: -700, y: 0, z: 0 },
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
        actionType: 1,
        pointType: 100,
        extra: '',
        traceId: '',
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
      },
    ],
    getStateType: 0,
    code: 0,
    msg: 'OK',
  };
  private breakPointInfo: any;

  public cameraInfos = [];
  public sendingFrameForJoystick = false;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async onModuleInit() {
    //const app_id = '0000000003';
    // const app_id = '0000000007';
    // const prefix = '/mnt/metaverse/scene';
    const app_id = configuration().app.appId;
    const prefix = configuration().app.prefix;
    console.log('app_id', app_id, configuration().app.appId);
    console.log('prefix', prefix, configuration().app.appId);

    let path;
    // let path: string;
    if (process.env.NODE_ENV === 'development') {
      path = join(__dirname, `../ws/${app_id}/points-${app_id}.json`);
      console.log('测试服JSON-move', path);
    }
    if (process.env.NODE_ENV === 'production') {
      path = join(`${prefix}/${app_id}/points-${app_id}.json`);
      console.log('正式服JSON-move', path);
    }
    this.loadJSON(path);
  }

  async loadJSON(path) {
    try {
      const data = await readFileSync(path);
      const BreakPointInfo = JSON.parse(Buffer.from(data).toString('utf-8'));
      this.breakPointInfo = BreakPointInfo;
      // console.log('BreakPointInfo', BreakPointInfo);
    } catch (error) {
      this.logger.error('load-json-error', error);
    }
  }

  init(app_id, userId) {
    const user = {
      appId: null,
      userId: null,
      breakPointId: null,
      roomId: null,
      player: {
        position: { x: -700, y: 0, z: 0 },
        angle: {
          pitch: 0,
          yaw: 0,
          roll: 0,
        },
      },
      camera: {
        position: { x: -1145, y: 0, z: 160 },
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
    console.log('user-init', user);
    this.users[userId] = user;
  }

  async getMoveFrames(
    appId,
    start_break_point_id,
    end_break_point_id,
    angleIndex,
  ) {
    console.log(
      'handlejoystick-angle->相机过渡angleIndex-------------------------：' +
        angleIndex,
    );
    let moveFramesRes, moveFrames;
    let key =
      'moveframe:app_id:' +
      appId +
      ':start_break_point_id:' +
      start_break_point_id +
      ':end_break_point_id:' +
      end_break_point_id +
      ':angle:' +
      angleIndex;
    //倒序
    if (start_break_point_id > end_break_point_id) {
      key =
        'moveframe:app_id:' +
        appId +
        ':start_break_point_id:' +
        end_break_point_id +
        ':end_break_point_id:' +
        start_break_point_id +
        ':angle:' +
        angleIndex;

      moveFramesRes = await this.cacheService.get(key);
      moveFrames = JSON.parse(moveFramesRes);
      moveFrames = moveFrames.reverse();
    } else {
      moveFramesRes = await this.cacheService.get(key);
      moveFrames = JSON.parse(moveFramesRes);
    }
    return moveFrames;
  }

  async move(pathArray, actionRequest) {
    try {
      const userId = actionRequest['user_id'];
      const traceId = actionRequest['trace_id'];
      const actionType = actionRequest['action_type'];
      const user = this.users[userId];
      const appId = user.appId;
      const path = pathArray || [100, 101, 102]; //需要计算路径
      const angle = user.camera.angle.yaw % 45; //纠正需要
      const replys = [];
      const traceIds = [];
      traceIds.push(traceId);
      const checkReplys = await this.modeifyCameraAngle(
        angle,
        userId,
        traceId,
        actionType,
      );
      for (let i = 0; i < checkReplys.length; ++i) {
        checkReplys[i].actionResponses[0].actionType = actionType;
        //if (i == 0 || i == checkReplys.length - 1) {
        if (i == 0) {
          checkReplys[i].isIDR = true;
        } else {
          checkReplys[i].isIDR = false;
        }
      }
      //replys['P' + user.breakPointId + 'T' + user.breakPointId] = checkReplys;
      replys.push(checkReplys);
      console.log('路径：' + path);
      //过渡传到缓存里
      this.reply.traceIds = traceIds;
      this.reply['newUserStates'][0].userId = userId;
      this.reply['actionResponses'][0].traceId = traceId;
      //const index = Math.floor((user.camera.angle.yaw + 1) / 45) % 8; //过渡需要
      const index = this.getMoveIndex(user.camera.angle.yaw);

      for (let i = 0; i < path.length - 1; ++i) {
        const start_break_point_id = path[i];
        const end_break_point_id = path[i + 1];

        const moveFrames = await this.getMoveFrames(
          appId,
          start_break_point_id,
          end_break_point_id,
          index,
        );
        if (!moveFrames) {
          return replys;
        }

        const pathReplys = this.createCacheReplys(
          appId,
          moveFrames,
          traceId,
          userId,
          start_break_point_id,
          end_break_point_id,
          false,
        );

        //第一段
        if (i == 0) {
          //第一帧
          pathReplys[0].isIDR = true;
        }
        //最后一段
        if (i == path.length - 2) {
          //最后一帧
          pathReplys[pathReplys.length - 1][
            'newUserStates'
          ][0].renderInfo.isMoving = 0;
        }

        for (let j = 0; j < pathReplys.length; ++j) {
          pathReplys[j].actionResponses[0].actionType = actionType;
        }
        replys.push(pathReplys);
        //replys['P' + start_break_point_id + 'T' + end_break_point_id] =pathReplys;
      }

      return replys;
    } catch (error) {
      console.log('MoveService', error);
    }
  }

  createCacheReplys(
    appId,
    moveFrames,
    traceId,
    userId,
    startBreakPointId,
    endBreakPointId,
    isFromUser,
  ) {
    const replys = [];
    const startPosition = this.breakPointInfo[startBreakPointId].position;
    const endPosition = this.breakPointInfo[endBreakPointId].position;
    const angle = this.getAngle(
      startPosition,
      {
        x: startPosition.x + 1,
        y: startPosition.y,
      },
      endPosition,
    );
    const user = this.users[userId];
    let i;
    for (i = 1; i < moveFrames.length; i += 3) {
      const moveFrame = moveFrames[i];
      const reply = JSON.parse(JSON.stringify(this.reply));
      if (reply.traceIds.indexOf(traceId) == -1) {
        reply.traceIds.push(traceId);
      }
      reply['newUserStates'][0].userId = userId;

      if (!isFromUser) {
        reply['newUserStates'][0].playerState.player.position = {
          x:
            startPosition.x +
            ((endPosition.x - startPosition.x) / moveFrames.length) * i,
          y:
            startPosition.y +
            ((endPosition.y - startPosition.y) / moveFrames.length) * i,
          z:
            startPosition.z +
            ((endPosition.z - startPosition.z) / moveFrames.length) * i,
        };

        reply['newUserStates'][0].playerState.player.angle.yaw = angle;
        reply['newUserStates'][0].playerState.cameraCenter =
          reply['newUserStates'][0].playerState.player.position;
      } else {
        reply['newUserStates'][0].playerState.player.position = JSON.parse(
          JSON.stringify(user.player.position),
        );
        reply['newUserStates'][0].playerState.player.angle.yaw =
          user.player.angle.yaw;
        reply['newUserStates'][0].playerState.cameraCenter = JSON.parse(
          JSON.stringify(user.player.position),
        );
      }

      reply['newUserStates'][0].playerState.camera.position = JSON.parse(
        JSON.stringify(moveFrame.camera_position),
      );
      if (i == 1) {
        console.log('move-2' + moveFrame.camera_angle.yaw);
      }
      if (moveFrame.camera_angle.yaw < 0) {
        moveFrame.camera_angle.yaw += 360;
      } else if (moveFrame.camera_angle.yaw > 359) {
        moveFrame.camera_angle.yaw -= 360;
      }

      reply['newUserStates'][0].playerState.camera.angle =
        moveFrame.camera_angle;
      if(user.walkState>MaxWalkCount){
        reply['newUserStates'][0].renderInfo.isMoving = 2;
      }
      else{
        reply['newUserStates'][0].renderInfo.isMoving = 1;
      }
      
      reply['actionResponses'][0].traceId = traceId;

      reply.mediaSrc =
        '/' +
        appId +
        '/' +
        startBreakPointId +
        '/' +
        moveFrame.file_name.substring(0, moveFrame.file_name.indexOf('.')) +
        '/' +
        moveFrame.file_name +
        '?m=' +
        new Date().getTime();
      if (startBreakPointId > endBreakPointId) {
        //console.log('change move437:'+startBreakPointId+','+endBreakPointId)
        reply.mediaSrc =
          '/' +
          appId +
          '/' +
          endBreakPointId +
          '/' +
          moveFrame.file_name.substring(0, moveFrame.file_name.indexOf('.')) +
          '/' +
          moveFrame.file_name +
          '?m=' +
          new Date().getTime();
      }
      console.log('mediaSrc_1:'+reply.mediaSrc)

      reply.startBreakPointId = startBreakPointId;
      reply.endBreakPointId = endBreakPointId;
      reply.isIDR = false;
      replys.push(reply);
    }
    if (i != moveFrames.length - 1) {
      i = moveFrames.length - 1;
      const moveFrame = moveFrames[i];
      const reply = JSON.parse(JSON.stringify(this.reply));
      reply.traceIds.push(traceId);
      reply['newUserStates'][0].userId = userId;
      if(user.walkState>MaxWalkCount){
        reply['newUserStates'][0].renderInfo.isMoving = 2;
      }
      else{
        reply['newUserStates'][0].renderInfo.isMoving = 1;
      }
      if (!isFromUser) {
        reply['newUserStates'][0].playerState.player.position = {
          x:
            startPosition.x +
            ((endPosition.x - startPosition.x) / moveFrames.length) * i,
          y:
            startPosition.y +
            ((endPosition.y - startPosition.y) / moveFrames.length) * i,
          z:
            startPosition.z +
            ((endPosition.z - startPosition.z) / moveFrames.length) * i,
        };

        reply['newUserStates'][0].playerState.player.angle.yaw = angle;
        reply['newUserStates'][0].playerState.cameraCenter =
          reply['newUserStates'][0].playerState.player.position;
      } else {
        reply['newUserStates'][0].playerState.player.position = JSON.parse(
          JSON.stringify(user.player.position),
        );
        reply['newUserStates'][0].playerState.player.angle.yaw =
          user.player.angle.yaw;
        reply['newUserStates'][0].playerState.cameraCenter = JSON.parse(
          JSON.stringify(user.player.position),
        );
      }

      reply['newUserStates'][0].playerState.camera.position =
        moveFrame.camera_position;
      if (moveFrame.camera_angle.yaw < 0) {
        moveFrame.camera_angle.yaw += 360;
      } else if (moveFrame.camera_angle.yaw > 359) {
        moveFrame.camera_angle.yaw -= 360;
      }

      reply['newUserStates'][0].playerState.camera.angle =
        moveFrame.camera_angle;

      reply['actionResponses'][0].traceId = traceId;

      reply.mediaSrc =
        '/' +
        appId +
        '/' +
        startBreakPointId +
        '/' +
        moveFrame.file_name.substring(0, moveFrame.file_name.indexOf('.')) +
        '/' +
        moveFrame.file_name +
        '?m=' +
        new Date().getTime();

      if (startBreakPointId > endBreakPointId) {
        console.log('change move526:'+startBreakPointId+','+endBreakPointId)
        reply.mediaSrc =
          '/' +
          appId +
          '/' +
          endBreakPointId +
          '/' +
          moveFrame.file_name.substring(0, moveFrame.file_name.indexOf('.')) +
          '/' +
          moveFrame.file_name +
          '?m=' +
          new Date().getTime();
      }
      console.log('mediaSrc_2:'+reply.mediaSrc)
      reply.startBreakPointId = startBreakPointId;
      reply.endBreakPointId = endBreakPointId;
      replys.push(reply);
    }
    //replys[replys.length - 1].isIDR = true;
    return replys;
  }

  //需要通知user，人物和相机走到哪一个呼吸点位了
  updateUser(userId, breakPointId, lastReply) {
    const user = this.users[userId];
    user.breakPointId = breakPointId;
    if (lastReply.actionResponses[0].actionType != 15) {
      user.player.position =
        lastReply['newUserStates'][0].playerState.player.position;
    }
    user.player.angle = lastReply['newUserStates'][0].playerState.player.angle;
    user.camera.position =
      lastReply['newUserStates'][0].playerState.camera.position;
    user.camera.angle = lastReply['newUserStates'][0].playerState.camera.angle;
  }

  getBreakPoints(actionRequest) {
    const userId = actionRequest['user_id'];
    const traceId = actionRequest['trace_id'];
    const actionType = actionRequest['action_type'];

    const user = this.users[userId];
    const appId = user.appId;
    const breakPointId = user.breakPointId;

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

    //const breakPoints = await this.cacheService.get('breakpoints:app_id:'+appId+':break_point_id:'+breakPointId);
    //获取redis表全部元素，'breakpoints:app_id:'+appId+':break_point_id:'开头的
    //const keys = await this.cacheService.keys(`breakpoints:app_id:${appId}*`);
    for (const key in this.breakPointInfo) {
      const breakPoint = this.breakPointInfo[key];
      //const breakPoint = JSON.parse(breakPointRes);
      //const position = breakPoint.position;
      reply['nps'].push({
        position: breakPoint.position,
        breakPointId: Number(key),
      });
    }
    // for (let i = 0; i < keys.length; ++i) {
    //   const breakPointRes = await this.cacheService.get(keys[i]);
    //   const breakPoint = JSON.parse(breakPointRes);
    //   const position = breakPoint.position;
    //   reply['nps'].push({
    //     position: position,
    //     breakPointId: breakPoint.breakPointId,
    //   });
    // }
    return reply;
  }

  getAngle(point, point1, point2) {
    const x1 = point1.x - point.x;
    const y1 = point1.y - point.y;

    const x2 = point2.x - point.x;
    const y2 = point2.y - point.y;

    const dot = x1 * x2 + y1 * y2;
    const det = x1 * y2 - y1 * x2;
    const angle = (Math.atan2(det, dot) / Math.PI) * 180;
    return (angle + 360) % 360;
  }

  async stop(traceId, userId, breakPointId, cameraAngle, playerAngle) {
    //const breakPointId = movePointIds.substring(movePointIds.indexOf('-') + 1);
    const user = this.users[userId];
    const startBreakPointId = user.breakPointId;
    user.breakPointId = breakPointId;
    const appId = user.appId;

    const breakPoint = this.breakPointInfo[breakPointId];
    user.player.position = breakPoint.position;
    user.player.angle = playerAngle;

    const rotateKey =
      'rotateframe:app_id:' +
      appId +
      ':frame_index:' +
      cameraAngle.yaw +
      ':break_point_id:' +
      breakPointId;

    const rotateDataRes = await this.cacheService.get(rotateKey);
    const rotateData = JSON.parse(rotateDataRes);
    user.camera.position = rotateData.cameraPosition;
    user.camera.angle = rotateData.cameraAngle;

    const reply = JSON.parse(JSON.stringify(this.reply));
    reply.traceIds.push(traceId);
    reply['newUserStates'][0].userId = userId;
    reply['newUserStates'][0].playerState.player.position = breakPoint.position;
    reply['newUserStates'][0].playerState.player.angle = playerAngle;
    reply['newUserStates'][0].playerState.camera.position =
      rotateData.cameraPosition;
    reply['newUserStates'][0].playerState.camera.angle = rotateData.cameraAngle;
    reply['newUserStates'][0].playerState.cameraCenter = breakPoint.position;
    reply['actionResponses'][0].traceId = traceId;
    console.log('stop658:'+breakPointId+','+rotateData.directory)
    reply.mediaSrc =
      '/' +
      appId +
      '/' +
      breakPointId +
      '/' +
      rotateData.directory +
      '/' +
      rotateData.fileName +
      '?m=' +
      new Date().getTime();
    reply.startBreakPointId = startBreakPointId;
    reply.endBreakPointId = breakPointId;
    reply['newUserStates'][0].renderInfo.isMoving = 0;
    return reply;
  }
  // 顺序旋转请求
  seqExeJoystick = seqExeAsyncFn(this.joystick);

  async joystick(actionRequest) {
    try {
      const userId = actionRequest['user_id'];
      const traceId = actionRequest['trace_id'];
      const dir_action = actionRequest['dir_action'];
      const actionType = actionRequest['action_type'];
      const time_delay = actionRequest['time_delay'];
      const user = this.users[userId];
      const breakPointId = user.breakPointId;
      const appId = user.appId;
      const replys = [];
      console.log('joystickActionRequest=>'+traceId+'_'+new Date().getTime());
      let step = 0.4;
      if(user.walkState>MaxWalkCount){
        step = 1.2;
      }
      //const step = 1;
      const closestDis = 50; //小于这个距离就跳到邻居呼吸点
      const distance = step * dir_action.speed_level;
      let angle = null;
      let move_angle = dir_action.move_angle + user.camera.angle.yaw;
      move_angle = move_angle % 360;

      //TODO 临时增加断言
      const playerPosition: Point = { x: 0, y: 0, z: 0 };
      playerPosition.x =
        user.player.position.x +
        distance * Math.cos((move_angle / 360) * 2 * Math.PI);
      playerPosition.y =
        user.player.position.y +
        distance * Math.sin((move_angle / 360) * 2 * Math.PI);

      //可行走的区域
      const area = [
        { x: -600, y: -300 },
        { x: -600, y: 250 },
        { x: 550, y: 250 },
        { x: 550, y: -300 },
      ];

      //更新行走状态
      ++user.walkState;
      //找到邻居点，判断user.player.position与邻居点的距离，如果距离小于closestDis，就要更新camera的position
      const breakPoint = this.breakPointInfo[breakPointId];
      const surroundPointIds = breakPoint.contact;
      //const neighAngles = [];
      const traceIds = [];

      user.player.angle.yaw = move_angle;
      traceIds.push(traceId);
      this.reply.traceIds = traceIds;
      this.reply['newUserStates'][0].userId = userId;
      this.reply['actionResponses'][0].traceId = traceId;
      this.reply['newUserStates'][0].playerState.player.angle.yaw = move_angle;

      this.reply['newUserStates'][0].playerState.camera.angle = JSON.parse(
        JSON.stringify(user.camera.angle),
      );
      this.reply['newUserStates'][0].playerState.camera.position = JSON.parse(
        JSON.stringify(user.camera.position),
      );
      this.reply['newUserStates'][0].playerState.cameraCenter = JSON.parse(
        JSON.stringify(user.player.position),
      );

      if(user.walkState>MaxWalkCount){
        this.reply['newUserStates'][0].renderInfo.isMoving = 2;
      }
      else{
        this.reply['newUserStates'][0].renderInfo.isMoving = 1;
      }
      this.reply['actionResponses'][0].traceId = traceId;
      this.reply.mediaSrc = null;

      //人在哪个角度
      const _angle = this.getAngle(
        breakPoint.position,
        { x: breakPoint.position.x + 1, y: breakPoint.position.y },
        playerPosition,
      );

      //需要找到最近的邻居点和最接近角度的邻居点
      let closestNeighorId = null;
      let closestDisNeighor = null;

      //超出行走区域的时候用得上
      let minAngleNeighorId = null;
      let closestAngleNeighor = null;

      for (let i = 0; i < surroundPointIds.length; ++i) {
        const neighPoint = this.breakPointInfo[surroundPointIds[i]];
        neighPoint.breakPointId = surroundPointIds[i];
        angle = this.getAngle(
          breakPoint.position,
          { x: breakPoint.position.x + 1, y: breakPoint.position.y },
          neighPoint.position,
        );

        const distance = this.getDistance(playerPosition, neighPoint.position);
        if (closestNeighorId == null || closestDisNeighor > distance) {
          closestNeighorId = surroundPointIds[i];
          closestDisNeighor = distance;
        }

        if (
          this.getOffsetAngle(angle, _angle) < 90 &&
          (minAngleNeighorId == null ||
            this.getOffsetAngle(closestAngleNeighor, _angle) >
              this.getOffsetAngle(angle, _angle))
        ) {
          minAngleNeighorId = surroundPointIds[i];
          closestAngleNeighor = angle;
        }
      }
      console.log('joystickjoystick:' + this.cameraInfos.length);
      this.reply.actionResponses[0].actionType = actionType;
      //超出范围了
      if (this.getDistance(playerPosition, breakPoint.position) > closestDis) {
        if (user.lastJoyStickMediaSrc) {
          user.player.position = JSON.parse(JSON.stringify(playerPosition));
          this.reply['newUserStates'][0].playerState.player.position = JSON.parse(
            JSON.stringify(user.player.position),
          );
          user.lastJoyStickMediaSrc = false;
          console.log('joystickActionRequest_1=>'+traceId+'_'+new Date().getTime());
          return this.reply;
        }
        else{
          return await this.moveCamera(
            breakPointId,
            closestNeighorId,
            appId,
            userId,
            traceId,
            actionType,
          );
        }
      } else {
        const inside = this.isPointInPoly(playerPosition, area);
        //超出区域
        if (!inside) {
          if (minAngleNeighorId != null) {
            if (user.lastJoyStickMediaSrc) {
              user.lastJoyStickMediaSrc = false;
              return null;
            }
            return await this.moveDirect(
              playerPosition,
              closestDis,
              breakPointId,
              minAngleNeighorId,
              appId,
              userId,
              traceId,
              actionType,
            );
          } else {
            return null;
          }
        }

        user.player.position = JSON.parse(JSON.stringify(playerPosition));
        this.reply['newUserStates'][0].playerState.player.position = JSON.parse(
          JSON.stringify(user.player.position),
        );

        console.log('20220719_延时->' + time_delay);
        //网络延迟的情况下，就暂时不推流
        if (
          time_delay &&
          time_delay < MaxDelayTime &&
          user.netQua < MaxNet
        ) {
          ++user.netQua;
        }
        else if (time_delay && time_delay > MaxDelayTime) {
          user.netQua = 0;
        }  

        if (user.netQua < MaxNet) {
          if (user.lastJoyStickMediaSrc) {
            user.lastJoyStickMediaSrc = false;
            console.log('joystickActionRequest_1=>'+traceId+'_'+new Date().getTime());
            return this.reply;
          }
        }
        
        const cameraInfo = this.getCameraInfo();
        if (cameraInfo != null) {
          this.reply['newUserStates'][0].playerState.camera.position =
            cameraInfo.camera_position;
          this.reply['newUserStates'][0].playerState.camera.angle =
            cameraInfo.camera_angle;

          if (cameraInfo.mediaSrc) {
            this.reply.mediaSrc = cameraInfo.mediaSrc;
            this.reply.isIDR = cameraInfo.isIDR;
            console.log('joystickActionRequest_2=>'+traceId+'_'+new Date().getTime());
            user.lastJoyStickMediaSrc = true;
          }

          user.camera.position = JSON.parse(
            JSON.stringify(cameraInfo.camera_position),
          );

          user.camera.angle.yaw = cameraInfo.camera_angle.yaw;

          this.sendingFrameForJoystick = true;
        } else {

        }
        return this.reply;
      }
    } catch (error) {
      console.log('MoveService', error);
      debugger;
      return null;
    }
  }

  async joystick2(actionRequest) {
    try {
      if (this.sendingFrameForJoystick) {
        return null;
      }

      const userId = actionRequest['user_id'];
      const traceId = actionRequest['trace_id'];
      const dir_action = actionRequest['dir_action'];
      const actionType = actionRequest['action_type'];
      const user = this.users[userId];
      const breakPointId = user.breakPointId;
      const appId = user.appId;
      //const step = 0.3;
      const step = 0.8;
      const closestDis = 80; //小于这个距离就跳到邻居呼吸点
      const distance = step * dir_action.speed_level;
      let angle = null;

      if (user.camera.angle.yaw < 0) {
        user.camera.angle.yaw = 360 + user.camera.angle.yaw;
      }
      let move_angle = dir_action.move_angle + user.camera.angle.yaw;
      move_angle = move_angle % 360;

      //TODO 临时增加断言
      const playerPosition: Point = { x: 0, y: 0, z: 0 };
      playerPosition.x =
        user.player.position.x +
        distance * Math.cos((move_angle / 360) * 2 * Math.PI);
      playerPosition.y =
        user.player.position.y +
        distance * Math.sin((move_angle / 360) * 2 * Math.PI);

      // const offsetX = playerPosition.x - user.player.position.x;
      // const offsetY = playerPosition.y - user.player.position.y;

      //找到邻居点，判断user.player.position与邻居点的距离，如果距离小于closestDis，就要更新camera的position
      let chooseBreakPointId = null;
      const breakPoint = this.breakPointInfo[breakPointId];
      const surroundPointIds = breakPoint.contact;
      const traceIds = [];

      user.player.angle.yaw = move_angle;
      traceIds.push(traceId);
      this.reply.traceIds = traceIds;
      this.reply['newUserStates'][0].userId = userId;
      this.reply['actionResponses'][0].traceId = traceId;
      this.reply['newUserStates'][0].playerState.player.angle.yaw = move_angle;

      this.reply['newUserStates'][0].playerState.camera.angle = JSON.parse(
        JSON.stringify(user.camera.angle),
      );
      this.reply['newUserStates'][0].playerState.camera.position = JSON.parse(
        JSON.stringify(user.camera.position),
      );
      this.reply['newUserStates'][0].playerState.cameraCenter = JSON.parse(
        JSON.stringify(breakPoint.position),
      );

      if(user.walkState>MaxWalkCount){
        this.reply['newUserStates'][0].renderInfo.isMoving = 2;
      }
      else{
        this.reply['newUserStates'][0].renderInfo.isMoving = 1;
      }
      this.reply['actionResponses'][0].traceId = traceId;
      this.reply.mediaSrc = null;

      console.log('joystickjoystick:' + this.cameraInfos.length);

      if (surroundPointIds.length == 1) {
        //console.log('handlejoysticktesttest:actionRequest-笔直'+new Date().getTime());
        return await this.moveDirect(
          playerPosition,
          closestDis,
          breakPointId,
          surroundPointIds[0],
          appId,
          userId,
          traceId,
          actionType,
        );
      }

      let count = 0;
      const neighPoints = [];
      //人在哪个角度
      const _angle = this.getAngle(
        breakPoint.position,
        { x: breakPoint.position.x + 1, y: breakPoint.position.y },
        playerPosition,
      );

      // const offsetBreakPosition = {
      //   x: breakPoint.position.x + offsetX,
      //   y: breakPoint.position.y + offsetY,
      // };
      let closestNeighorId = null;
      let neighDis = null;

      let singleInfo = null;
      for (let i = 0; i < surroundPointIds.length; ++i) {
        const neighPoint = this.breakPointInfo[surroundPointIds[i]];
        if (closestNeighorId == null) {
          neighDis = this.getDistance(playerPosition, neighPoint.position);
          closestNeighorId = surroundPointIds[i];
        } else if (
          neighDis > this.getDistance(playerPosition, neighPoint.position)
        ) {
          neighDis = this.getDistance(playerPosition, neighPoint.position);
          closestNeighorId = surroundPointIds[i];
        }

        neighPoint.breakPointId = surroundPointIds[i];
        angle = this.getAngle(
          breakPoint.position,
          { x: breakPoint.position.x + 1, y: breakPoint.position.y },
          neighPoint.position,
        );

        //if(angle<45&&angle!=0){
        if (
          // Math.abs(angle - move_angle) < 45 &&
          // Math.abs(angle - move_angle) != 0
          Math.abs(angle - _angle) < 45 &&
          Math.abs(angle - _angle) != 0
        ) {
          neighPoint.angle = angle;
          neighPoints.push(neighPoint);
          ++count;
        } else if (Math.abs(angle - move_angle) == 0) {
          neighPoint.angle = angle;
          neighPoints.push(neighPoint);
          ++count;
          break;
        }

        //if (angle == 0 && Math.abs(360 - move_angle) < 45) {
        if (angle == 0 && Math.abs(360 - _angle) < 45) {
          neighPoint.angle = angle;
          neighPoints.push(neighPoint);
          ++count;
        }

        if (
          Math.abs(angle - move_angle) < 45 ||
          Math.abs(angle + 360 - move_angle) < 45
        ) {
          if (singleInfo == null) {
            singleInfo = {
              angle: angle,
              breakPointId: surroundPointIds[i],
            };
          }
        }
      }

      if (count == 2) {
        //人物移动
        user.player.position = JSON.parse(JSON.stringify(playerPosition));
        this.reply['newUserStates'][0].playerState.player.position = JSON.parse(
          JSON.stringify(playerPosition),
        );
      } else {
        if (singleInfo != null) {
          return await this.moveDirect(
            playerPosition,
            closestDis,
            breakPointId,
            singleInfo.breakPointId,
            appId,
            userId,
            traceId,
            actionType,
          );
        } else if (count == 1) {
          return await this.moveDirect(
            playerPosition,
            closestDis,
            breakPointId,
            neighPoints[0].breakPointId,
            appId,
            userId,
            traceId,
            actionType,
          );
        } else if (count == 0) {
          this.reply['newUserStates'][0].playerState.player.position =
            JSON.parse(JSON.stringify(user.player.position));
          this.reply.actionResponses[0].actionType = actionType;
          return this.reply;
        }
      }

      //count == 2
      //超出范围了
      console.log(
        'handlejoysticktesttest:距离：' +
          JSON.stringify(playerPosition) +
          '->' +
          JSON.stringify(breakPoint.position) +
          '：' +
          this.getDistance(playerPosition, breakPoint.position),
      );
      if (this.getDistance(playerPosition, breakPoint.position) > closestDis) {
        chooseBreakPointId = closestNeighorId;
        return await this.moveCamera(
          breakPointId,
          chooseBreakPointId,
          appId,
          userId,
          traceId,
          actionType,
        );
      } else {
        this.reply['newUserStates'][0].playerState.player.position = JSON.parse(
          JSON.stringify(user.player.position),
        );
        this.reply.actionResponses[0].actionType = actionType;
        const cameraInfo = this.getCameraInfo();
        if (cameraInfo != null) {
          console.log('joystick自由--->合并');
          this.reply['newUserStates'][0].playerState.camera.position =
            cameraInfo.camera_position;
          this.reply['newUserStates'][0].playerState.camera.angle =
            cameraInfo.camera_angle;

          if (cameraInfo.mediaSrc) {
            this.reply.mediaSrc = cameraInfo.mediaSrc;
            this.reply.isIDR = cameraInfo.isIDR;
          }

          user.camera.position = JSON.parse(
            JSON.stringify(cameraInfo.camera_position),
          );

          user.camera.angle.yaw = cameraInfo.camera_angle.yaw;

          this.sendingFrameForJoystick = true;
        } else {
        }

        console.log(
          'handlejoysticktesttest:自由：' +
            this.reply.mediaSrc +
            '->' +
            JSON.stringify(user.player.position),
        );
        return this.reply;
      }
    } catch (error) {
      console.log('MoveService', error);
      return null;
    }
  }

  //沿着最合适的neighBreakPointId走
  async moveDirect(
    playerPosition,
    closestDis,
    breakPointId,
    neighBreakPointId,
    appId,
    userId,
    traceId,
    actionType,
  ) {
    const breakPoint = this.breakPointInfo[breakPointId];
    const user = this.users[userId];
    const player_Position = this.getTarget(
      playerPosition,
      breakPoint.position,
      this.breakPointInfo[neighBreakPointId].position,
    );

    if (player_Position != null) {
      playerPosition.x = player_Position.x;
      playerPosition.y = player_Position.y;
      user.player.position = JSON.parse(JSON.stringify(playerPosition));
    }

    if (this.getDistance(playerPosition, breakPoint.position) > closestDis) {
      //this.reply.moveOver = true;
      return await this.moveCamera(
        breakPointId,
        neighBreakPointId,
        appId,
        userId,
        traceId,
        actionType,
      );
    } else {
      this.reply['newUserStates'][0].playerState.player.position = JSON.parse(
        JSON.stringify(user.player.position),
      );
      this.reply.actionResponses[0].actionType = actionType;
      const cameraInfo = this.getCameraInfo();
      if (cameraInfo != null) {
        this.reply['newUserStates'][0].playerState.camera.position =
          cameraInfo.camera_position;
        this.reply['newUserStates'][0].playerState.camera.angle =
          cameraInfo.camera_angle;

        if (cameraInfo.mediaSrc) {
          this.reply.mediaSrc = cameraInfo.mediaSrc;
          this.reply.isIDR = cameraInfo.isIDR;
        }

        user.camera.position = JSON.parse(
          JSON.stringify(cameraInfo.camera_position),
        );
        console.log(
          'handlejoystick-angle->:moveDirect更新user.angle' +
            cameraInfo.camera_angle.yaw,
        );
        user.camera.angle.yaw = cameraInfo.camera_angle.yaw;

        this.sendingFrameForJoystick = true;
      }
      return this.reply;
    }
  }

  async moveCamera(
    breakPointId,
    chooseBreakPointId,
    appId,
    userId,
    traceId,
    actionType,
  ) {
    const user = this.users[userId];
    this.reply['newUserStates'][0].playerState.player.position = JSON.parse(
      JSON.stringify(user.player.position),
    );
    if (chooseBreakPointId == null) {
      this.reply.actionResponses[0].actionType = actionType;
      return this.reply;
    }
    //判断人物离该邻接点的距离是否在最小路径内，如果是，跳到这个邻接点里
    //相机纠正加过渡
    else {
      if (chooseBreakPointId == user.breakPointId) {
        return this.reply;
      }

      const angle = user.camera.angle.yaw % 45; //纠正需要
      //通过user.camera.angle矫正相机的angle
      const checkReplys = await this.modeifyCameraAngle(
        angle,
        userId,
        traceId,
        actionType,
      );

      for (let i = 0; i < checkReplys.length; ++i) {
        let isIDR = false;
        //if (i == 0 || i == checkReplys.length - 1) {
        if (i == 0) {
          isIDR = true;
        }
        this.addCameraInfo(
          checkReplys[i]['newUserStates'][0].playerState.camera.position,
          checkReplys[i]['newUserStates'][0].playerState.camera.angle,
          checkReplys[i].mediaSrc,
          isIDR,
        );
      }

      const index = this.getMoveIndex(user.camera.angle.yaw);
      const moveFrames = await this.getMoveFrames(
        appId,
        breakPointId,
        chooseBreakPointId,
        index,
      );
      this.setCameraInfo(
        appId,
        userId,
        moveFrames,
        breakPointId,
        chooseBreakPointId,
      );

      user.breakPointId = chooseBreakPointId;

      const cameraInfo = this.getCameraInfo();
      if (cameraInfo != null) {
        this.reply['newUserStates'][0].playerState.camera.position =
          cameraInfo.camera_position;
        this.reply['newUserStates'][0].playerState.camera.angle =
          cameraInfo.camera_angle;

        user.camera.position = JSON.parse(
          JSON.stringify(cameraInfo.camera_position),
        );

        user.camera.angle.yaw = cameraInfo.camera_angle.yaw;

        if (cameraInfo.mediaSrc) {
          this.reply.mediaSrc = cameraInfo.mediaSrc;
          this.reply.isIDR = cameraInfo.isIDR;
        }
        this.sendingFrameForJoystick = true;
      }

      console.log(
        'handlejoysticktesttest:actionRequest-镜头过渡：从' +
          breakPointId +
          '到' +
          chooseBreakPointId +
          '，' +
          JSON.stringify(user.player.position),
      );
      return this.reply;
    }
  }

  setCameraInfo(appId, userId, moveFrames, startBreakPointId, endBreakPointId) {
    console.log('setCameraInfo前：'+this.cameraInfos.length);
    const user = this.users[userId];
    //let moveInterval = 2;
    let flag = false;
    for (let i = 0; i < moveFrames.length; ++i) {
      if(user.walkState > MaxWalkCount){
        //网络差
        if (user.netQua < MaxNet) {
          if (i != 0 && i != moveFrames.length - 1 && i % 5 != 0) {
            continue;
          }
        }
        //网络正常
        else{
          if (i != 0 && i != moveFrames.length - 1 && i % 4 != 0) {
            continue;
          }
        }
      }
      //网络差
      else if (user.netQua < MaxNet) {
        if (i != 0 && i != moveFrames.length - 1 && i % 2 == 0) {
          continue;
        }
      }

      moveFrames[i].startBreakPointId = startBreakPointId;
      moveFrames[i].endBreakPointId = endBreakPointId;
      moveFrames[i].mediaSrc =
        '/' +
        appId +
        '/' +
        startBreakPointId +
        '/' +
        moveFrames[i].file_name.substring(
          0,
          moveFrames[i].file_name.indexOf('.'),
        ) +
        '/' +
        moveFrames[i].file_name +
        '?m=' +
        new Date().getTime();

      if (startBreakPointId > endBreakPointId) {
        console.log('change move1341:'+startBreakPointId+','+endBreakPointId)
        moveFrames[i].mediaSrc =
          '/' +
          appId +
          '/' +
          endBreakPointId +
          '/' +
          moveFrames[i].file_name.substring(
            0,
            moveFrames[i].file_name.indexOf('.'),
          ) +
          '/' +
          moveFrames[i].file_name +
          '?m=' +
          new Date().getTime();
      }
                                                                // if (i == 0 || i == moveFrames.length - 1) {
                                                                //   moveFrames[i].isIDR = true;
                                                                //   if (i == moveFrames.length - 1) {
                                                                //     flag = true;
                                                                //   }
                                                                // } else {
                                                                //   moveFrames[i].isIDR = false; }
                  
      
      if(user.IDRCount % 10 == 0){
        moveFrames[i].isIDR = true;
        user.IDRCount = 0;
      }    
      else{
        moveFrames[i].isIDR = false;
      }
      if (i == moveFrames.length - 1) {
        flag = true;
      }
      ++user.IDRCount;                                         
      this.cameraInfos.push(moveFrames[i]);
      console.log('mediaSrc_3:'+moveFrames[i].mediaSrc+',isIDR:'+moveFrames[i].isIDR)
    }
    //最后一个元素跳过了，要补上
    if (!flag) {
      const cameraInfo = moveFrames[moveFrames.length - 1];
      cameraInfo.endBreakPointId = endBreakPointId;
      cameraInfo.mediaSrc =
        '/' +
        appId +
        '/' +
        startBreakPointId +
        '/' +
        cameraInfo.file_name.substring(0, cameraInfo.file_name.indexOf('.')) +
        '/' +
        cameraInfo.file_name +
        '?m=' +
        new Date().getTime();

      if (startBreakPointId > endBreakPointId) {
        console.log('change move1384:'+startBreakPointId+','+endBreakPointId)
        cameraInfo.mediaSrc =
          '/' +
          appId +
          '/' +
          endBreakPointId +
          '/' +
          cameraInfo.file_name.substring(0, cameraInfo.file_name.indexOf('.')) +
          '/' +
          cameraInfo.file_name +
          '?m=' +
          new Date().getTime();
      }
                                                                            //cameraInfo.isIDR = true;
      if(user.IDRCount % 10 == 0){
        cameraInfo.isIDR = true;
        user.IDRCount = 0;
      } 
      ++user.IDRCount;
      this.cameraInfos.push(cameraInfo);
      console.log('mediaSrc_4:'+cameraInfo.mediaSrc+',isIDR:'+cameraInfo.isIDR)
    }
    console.log('setCameraInfo后：'+this.cameraInfos.length);
  }

  addCameraInfo(cameraPosition, cameraAngle, mediaSrc, isIDR) {
    this.cameraInfos.push({
      camera_position: cameraPosition,
      camera_angle: cameraAngle,
      mediaSrc: mediaSrc,
      isIDR: isIDR,
    });
  }

  getCameraInfo() {
    if (this.cameraInfos.length > 0) {
      const item = this.cameraInfos.shift();
      return item;
    } else {
      return null;
    }
  }

  complementFrame(userId) {
    const user = this.users[userId];
    user.walkState = 0;
    user.IDRCount = 0;
    if (this.cameraInfos.length > 0) {
      const cameraInfo = this.cameraInfos.shift();
      this.reply.traceIds = [];
      this.reply['newUserStates'][0].userId = userId;
      this.reply['actionResponses'][0].traceId = null;
      this.reply['newUserStates'][0].playerState.player.angle.yaw =
        user.player.angle.yaw;
      this.reply['newUserStates'][0].playerState.player.position = JSON.parse(
        JSON.stringify(user.player.position),
      );
      this.reply['newUserStates'][0].playerState.camera.angle = JSON.parse(
        JSON.stringify(cameraInfo.camera_angle),
      );
      this.reply['newUserStates'][0].playerState.camera.position = JSON.parse(
        JSON.stringify(cameraInfo.camera_position),
      );

      this.reply['newUserStates'][0].playerState.cameraCenter = JSON.parse(
        JSON.stringify(user.player.position),
      );
      this.reply['newUserStates'][0].renderInfo.isMoving = 0;
      this.reply['actionResponses'][0].traceId = null;

      if (cameraInfo.mediaSrc) {
        this.reply.mediaSrc = cameraInfo.mediaSrc;
        this.reply.isIDR = cameraInfo.isIDR;
      }

      user.camera.position = JSON.parse(
        JSON.stringify(cameraInfo.camera_position),
      );
      user.camera.angle = JSON.parse(JSON.stringify(cameraInfo.camera_angle));

      this.sendingFrameForJoystick = true;
      return this.reply;
    } else if (this.cameraInfos.length == 0) {
      if (this.reply['newUserStates'][0].renderInfo.isMoving != 0) {
        return this.stopJoystick(userId);
      } else {
        return null;
      }
    }
  }

  // createDefaultReply(userId){
  //   const user = this.users[userId];
  //   this.reply.traceIds = [];
  //   this.reply['newUserStates'][0].userId = userId;
  //   this.reply['actionResponses'][0].traceId = null;
  //   this.reply['newUserStates'][0].playerState.player.angle.yaw =
  //     user.player.angle.yaw;
  //   this.reply['newUserStates'][0].playerState.player.position = JSON.parse(
  //     JSON.stringify(user.player.position),
  //   );
  //   this.reply['newUserStates'][0].playerState.camera.angle = JSON.parse(
  //     JSON.stringify(user.camera.angle),
  //   );
  //   this.reply['newUserStates'][0].playerState.camera.position = JSON.parse(
  //     JSON.stringify(user.camera.position),
  //   );

  //   this.reply['newUserStates'][0].playerState.cameraCenter = JSON.parse(
  //     JSON.stringify(user.player.position),
  //   );
  //   this.reply['newUserStates'][0].renderInfo.isMoving = 0;
  //   this.reply['actionResponses'][0].traceId = null;
  //   return JSON.parse(JSON.stringify(this.reply));
  // }

  async updateCameraInfoForDely(appId, userId, path) {
    if (path == null) {
      this.cameraInfos = [];
      return;
    }
    const user = this.users[userId];
    const index = this.getMoveIndex(user.camera.angle.yaw);
    let frames = [];

    let pointIds = [];

    for (let i = 0; i < path.length - 1; ++i) {
      const start_break_point_id = path[i];
      const end_break_point_id = path[i + 1];
      const moveFrames = await this.getMoveFrames(
        appId,
        start_break_point_id,
        end_break_point_id,
        index,
      );
      if (!moveFrames) {
        return null;
      }
      frames = frames.concat(moveFrames);
      pointIds.push({
        index: frames.length,
        startBreakPointId: start_break_point_id,
        endBreakPointId: end_break_point_id,
      });
    }
    this.cameraInfos = [];
    const interval = Math.floor(frames.length / 12);
    for (let i = 0; i < frames.length - 1; i += interval) {
      const frame = frames[i];
      let isIDR = false;
      if (i == 0) {
        isIDR = true;
      }

      let startBreakPointId, endBreakPointId;
      for (let j = 0; j < pointIds.length; ++j) {
        if (i < pointIds[j].index + 1) {
          startBreakPointId = pointIds[j].startBreakPointId;
          endBreakPointId = pointIds[j].endBreakPointId;
          break;
        }
      }

      let mediaSrc =
        '/' +
        appId +
        '/' +
        startBreakPointId +
        '/' +
        frame.file_name.substring(0, frame.file_name.indexOf('.')) +
        '/' +
        frame.file_name +
        '?m=' +
        new Date().getTime();
      if (startBreakPointId > endBreakPointId) {
        console.log('change move1552:'+startBreakPointId+','+endBreakPointId)
        mediaSrc =
          '/' +
          appId +
          '/' +
          endBreakPointId +
          '/' +
          frame.file_name.substring(0, frame.file_name.indexOf('.')) +
          '/' +
          frame.file_name +
          '?m=' +
          new Date().getTime();
      }
      console.log('mediaSrc_5:'+mediaSrc)
      this.cameraInfos.push({
        startBreakPointId: startBreakPointId,
        endBreakPointId: endBreakPointId,
        camera_position: frame.camera_position,
        camera_angle: frame.camera_angle,
        mediaSrc: mediaSrc,
        isIDR: isIDR,
      });
    }

    const startBreakPointId = pointIds[pointIds.length - 1].startBreakPointId;
    const endBreakPointId = pointIds[pointIds.length - 1].endBreakPointId;
    const frame = frames[frames.length - 1];
    let mediaSrc =
      '/' +
      appId +
      '/' +
      startBreakPointId +
      '/' +
      frame.file_name.substring(0, frame.file_name.indexOf('.')) +
      '/' +
      frame.file_name +
      '?m=' +
      new Date().getTime();
    if (startBreakPointId > endBreakPointId) {
      console.log('change move1591:'+startBreakPointId+','+endBreakPointId)
      mediaSrc =
        '/' +
        appId +
        '/' +
        endBreakPointId +
        '/' +
        frame.file_name.substring(0, frame.file_name.indexOf('.')) +
        '/' +
        frame.file_name +
        '?m=' +
        new Date().getTime();
    }
    console.log('mediaSrc_6:'+mediaSrc)
    this.cameraInfos.push({
      startBreakPointId: startBreakPointId,
      endBreakPointId: endBreakPointId,
      camera_position: frame.camera_position,
      camera_angle: frame.camera_angle,
      mediaSrc: mediaSrc,
      isIDR: true,
    });
  }

  stopJoystick(userId) {

    this.reply.traceIds = [];
    const user = this.users[userId];
    this.reply['newUserStates'][0].userId = userId;
    this.reply['actionResponses'][0].traceId = null;
    this.reply['newUserStates'][0].playerState.player.angle.yaw =
      user.player.angle.yaw;

    this.reply['newUserStates'][0].playerState.player.position = JSON.parse(
      JSON.stringify(user.player.position),
    );

    this.reply['newUserStates'][0].playerState.camera.angle = JSON.parse(
      JSON.stringify(user.camera.angle),
    );
    this.reply['newUserStates'][0].playerState.camera.position = JSON.parse(
      JSON.stringify(user.camera.position),
    );

    this.reply['newUserStates'][0].playerState.cameraCenter = JSON.parse(
      JSON.stringify(user.player.position),
    );
    this.reply['newUserStates'][0].renderInfo.isMoving = 0;
    this.reply['actionResponses'][0].traceId = null;
    this.reply.mediaSrc = null;
    return this.reply;
  }

  async modeifyCameraAngle(angle, userId, traceId, actionType) {
    const checkReplys = [];
    if (angle > 22) {
      angle = 45 - angle;
      for (let i = 0; i < angle; ++i) {
        // console.warn('矫正一次：' + i);
        const reply = await this.rotateService.rotateForAngle(userId, 1);
        // console.warn(
        //   '矫正：' + reply.newUserStates[0].playerState.camera.angle.yaw,
        // );
        reply.traceIds = [];
        reply.traceIds.push(traceId);
        const actionResponse = this.rotateService.createActionResponse(
          actionType,
          traceId,
        );
        reply.actionResponses = [];
        reply.actionResponses.push(actionResponse);
        checkReplys.push(reply);
      }
    } else if (angle != 0) {
      for (let i = angle; i > -1; --i) {
        // console.warn('矫正一次：' + i);
        const reply = await this.rotateService.rotateForAngle(userId, -1);
        // console.warn(
        //   '矫正：' + reply.newUserStates[0].playerState.camera.angle.yaw,
        // );
        reply.traceIds = [];
        reply.traceIds.push(traceId);
        const actionResponse = this.rotateService.createActionResponse(
          actionType,
          traceId,
        );
        reply.actionResponses = [];
        reply.actionResponses.push(actionResponse);
        checkReplys.push(reply);
      }
    }
    return checkReplys;
  }

  getTarget(position, position1, position2) {
    const line = this.createLine1(position1, position2);
    const join = this.getJoinLinePoint(position, line);
    // if (this.isContainForSegment(join, position1, position2)) {
    //   return join;
    // } else {
    //   return null;
    // }
    return join;
  }

  getDistance(position1, position2) {
    return Math.sqrt(
      (position1.x - position2.x) * (position1.x - position2.x) +
        (position1.y - position2.y) * (position1.y - position2.y),
    );
  }

  isContainForSegment(point, startPoint, endPoint) {
    const minDis = 0.1;
    const dis1 =
      this.getDistance(startPoint, point) + this.getDistance(endPoint, point);
    const dis2 = this.getDistance(startPoint, endPoint);
    if (Math.abs(dis1 - dis2) < minDis) {
      return true;
    } else {
      return false;
    }
  }

  //两条线的交点
  getIntersectionPoint(parameter1, parameter2) {
    if (this.isParallel(parameter1, parameter2)) {
      return null;
    }
    if (
      typeof parameter1.a == 'undefined' &&
      typeof parameter2.a != 'undefined'
    ) {
      if (parameter1.x) {
        return {
          x: parameter1.x,
          y: parameter2.a * parameter1.x + parameter2.b,
        };
      } else if (parameter1.y) {
        return {
          x: (parameter1.y - parameter2.b) / parameter2.a,
          y: parameter1.y,
        };
      }
    } else if (
      typeof parameter2.a == 'undefined' &&
      typeof parameter1.a != 'undefined'
    ) {
      if (parameter2.x) {
        return {
          x: parameter2.x,
          y: parameter1.a * parameter2.x + parameter1.b,
        };
      } else if (parameter2.y) {
        return {
          x: (parameter2.y - parameter1.b) / parameter1.a,
          y: parameter2.y,
        };
      }
    } else if (
      typeof parameter2.a == 'undefined' &&
      typeof parameter1.a == 'undefined'
    ) {
      if (parameter1.hasOwnProperty('x') && parameter2.hasOwnProperty('y')) {
        return { x: parameter1.x, y: parameter2.y };
      } else if (
        parameter1.hasOwnProperty('y') &&
        parameter2.hasOwnProperty('x')
      ) {
        return { x: parameter2.x, y: parameter1.y };
      } else {
        return null;
      }
    }

    if (parameter1.a == parameter2.a) {
      return null;
    }

    const joinpointx =
      (parameter2.b - parameter1.b) / (parameter1.a - parameter2.a);
    const joinpointy =
      (parameter1.a * parameter2.b - parameter2.a * parameter1.b) /
      (parameter1.a - parameter2.a);

    const point = { x: joinpointx, y: joinpointy };
    return point;
  }

  // 垂直线
  getVerticalLine(line, point) {
    if (typeof line.a === 'undefined') {
      if (line.hasOwnProperty('x')) {
        return { y: point.y };
      } else if (line.hasOwnProperty('y')) {
        return { x: point.x };
      } else {
        return null;
      }
    } else if (line.a == 0) {
      return { x: point.x };
    } else {
      const tl = {} as any as VerticalLineType;
      tl.a = -1 / line.a;
      const result = this.createLine2(tl, point);
      return result;
    }
  }

  // 经过point且与line垂直的直线，该直线与line的交点
  getJoinLinePoint(point, line) {
    const verticalLine = this.getVerticalLine(line, point);
    const join = this.getIntersectionPoint(line, verticalLine);
    return join;
  }

  // 与lineA平行并且point在线上
  createLine2(lineA, point) {
    const parameter = {} as any as {
      x: number;
      y: number;
      a: number;
      b: number;
    };
    if (typeof lineA.a === 'undefined') {
      if (typeof lineA.x !== 'undefined') {
        parameter.x = point.x;
      } else if (typeof lineA.y !== 'undefined') {
        parameter.y = point.y;
      }
    } else {
      parameter.a = lineA.a;
      parameter.b = point.y - point.x * lineA.a;
    }
    return parameter;
  }

  createLine1(point1, point2) {
    if (point1.x == point2.x && point1.y == point2.y) {
      return null;
    } else if (this.getFixed(Math.abs(point1.x - point2.x)) == 0) {
      return { x: point1.x };
    } else if (this.getFixed(Math.abs(point1.y - point2.y)) == 0) {
      return { y: point1.y };
    }

    const parametera = (point1.y - point2.y) / (point1.x - point2.x);
    const parameterb =
      (point1.x * point2.y - point2.x * point1.y) / (point1.x - point2.x);
    if (this.getFixed(parametera) == 0) {
      return { y: this.getFixed(parameterb) };
    }
    const parameter = {
      a: this.getFixed(parametera),
      b: this.getFixed(parameterb),
    };
    return parameter;
  }

  //返回true表示平行
  isParallel(line1, line2) {
    if (typeof line1.a == 'undefined' && typeof line2.a == 'undefined') {
      if (line1.hasOwnProperty('x') && line2.hasOwnProperty('x')) {
        return true;
      } else if (line1.hasOwnProperty('y') && line2.hasOwnProperty('y')) {
        return true;
      } else {
        return false;
      }
    } else if (typeof line1.a == 'undefined' || typeof line2.a == 'undefined') {
      return false;
    } else if (this.getFixed(line1.a) == this.getFixed(line2.a)) {
      return true;
    } else {
      return false;
    }
  }

  getFixed(num) {
    const decimal = 2;
    return parseFloat(num.toFixed(decimal));
  }

  isPointInPoly(position, points) {
    const x = position.x;
    const y = position.y;

    let inside = false;

    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const pt1 = points[i];
      const pt2 = points[j];

      const xi = pt1.x;
      const yi = pt1.y;
      const xj = pt2.x;
      const yj = pt2.y;

      const intersect =
        yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }

    return inside;
  }

  getMoveIndex(angle) {
    if (angle < 0) {
      angle = 360 + angle;
    }

    for (let i = 0; i < 8; ++i) {
      if (angle < 45 * i + 45 / 2) {
        return i;
      }
    }

    //超过了337
    return 0;
  }

  getOffsetAngle(angle1, angle2) {
    if (angle1 < 0) {
      angle1 = 360 + angle1;
      //return Math.min(Math.abs(angle1-angle2),Math.abs());
    }

    if (angle2 < 0) {
      angle2 = 360 + angle2;
    }

    return Math.min(Math.abs(angle1 - angle2), 360 - Math.abs(angle1 - angle2));
  }
}
