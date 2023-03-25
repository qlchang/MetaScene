interface SceneGrpcService {
  getRoute(request: RouteRequest): Observable<any>;
  init(request: InitRequest): Observable<any>;
  rotate(request: RotateRequest): Observable<NormalReply>;
  move(request: MoveRequest): Observable<any>;
  getBreakPoint(request: GetBreakPointRequest): Observable<any>;
  joystick(request: JoystickRequest): Observable<any>;
  echo(request: EchoRequest): Observable<any>;
  exit(request: ExitRequest): Observable<any>;
}

interface Point {
  x: number;
  y: number;
  z: number;
}
interface Angle {
  pitch: number;
  yaw: number;
  roll: number;
}
interface Player {
  position: Point;
  angle: Angle;
}

interface ExitRequest {
  action_type: number;
  user_id: string;
  trace_id: string;
}
interface RouteRequest {
  sLocation: Point;
  eLocation: Point;
  sceneCode: string;
}

interface InitRequest {
  user_id: string;
  nick_name: string;
  skin_id: string;
  avatar_id: string;
  // room_id: string;
  app_id: string;
  player: Player;
  is_host: boolean;
  skin_data_version: string;
  rotation_render_type: number;
  is_all_sync: true;
  camera: {
    position: Point;
    angle: Angle;
  };
  person: number;
  sync_by_event: boolean;
  firends: string;
  area_name: string;
  path_name: string;
  attitude: string;
  room_type_id: string;
  syncToOthers: boolean;
  hasAvatar: boolean;
  prioritySync: boolean;
  extra: string;
  user_id: string;
  roomId: string;
}

interface RotateRequest {
  action_type: number;
  rotation_action?: RotationActionType;
  trace_id: string;
  user_id: string;
  sampleRate?: number;
}
interface MoveRequest {
  action_type: number;
  clicking_action: {
    clicking_point: Point;
    clicking_type: number;
    extra: string;
    attitude: string;
  };
  clicking_state: {
    roomTypeId: string;
    person: number;
    avatarId: string;
    skinId: string;
    roomId: string;
    isHost: boolean;
    isFollowHost: boolean;
    skinDataVersion: string;
    avatarComponents: string;
    nickName: string;
    movingMode: number;
    attitude: string;
    areaName: string;
    pathName: string;
    pathId: string;
    avatarSize: number;
    extra: string;
    prioritySync: true;
    player: {
      position: Point;
      angle: {
        pitch: number;
        yaw: number;
        roll: number;
      };
    };
    camera: {
      position: Point;
      angle: {
        pitch: number;
        yaw: number;
        roll: number;
      };
    };
    cameraCenter: Point;
  };
  trace_id: string;
  user_id: string;
}

interface GetBreakPointRequest {
  actionType: number;
  getNeighborPointsAction: {
    point: Point;
    level: number;
    containSelf: boolean;
    searchRange: number;
  };
  traceId: string;
  userId: string;
}
interface JoystickRequest {
  actionType: number;
  dirAction: {
    moveAngle: number;
    speedLevel: number;
  };
  traceId: string;
  userId: string;
  packetId: string;
}

interface EchoRequest {
  action_type: number;
  echo_msg: {
    echoMsg: string;
  };
  trace_id: string;
  user_id: string;
}

interface RTCEchoMessage {
  echoMsg: string;
}
interface RTCEchoMessage {
  echoMsg: string;
}

interface newUserStateType {
  userType: number;
}
interface RotationActionType {
  vertical_move: number;
  horizontal_move: number;
}

interface RTCMessageRequest {
  action_type: number;
  echo_msg?: RTCEchoMessage;
  MstType?: number;
  getNewUserStateAction?: newUserStateType;
  rotation_action?: RotationActionType;
  sampleRate?: number;
  trace_id: string;
  user_id: string;
}
interface NormalReply {
  code: number;
}
interface MovingLastUpdateType {
  mediaSrc: string;
  metaData: StreamReplyType;
}
