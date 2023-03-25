interface StreamFrameType {
  frame: number;
  clipPath: string;
  metaData: string;
  serverTime?: number;
  DIR?: number;
  mediaSrc?: string; // 临时
  mType?: string;
  newUserStates?: NewUserStatesType[];
  joystickIDR?: boolean;
}
interface StreamMetaType {
  frame: number;
  metaData: string;
}

interface NewUserStatesType {
  userId: string;
  playerState: PlayerStateType;
  renderInfo: RenderInfoType;
  event: string | null;
  relation: number;
}

interface PlayerStateType {
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
  prioritySync: boolean;
  player: {
    position: Point;
    angle: Angle;
  };
  camera: {
    position: Point;
    angle: Angle;
  };
  cameraCenter: Point;
}

interface RenderInfoType {
  renderType: number;
  videoFrame: null | string;
  cameraStateType: number;
  isMoving: number;
  needIfr: number;
  isVideo: number;
  stillFrame: number;
  isRotating: number;
  isFollowing: number;
  clientPanoTitlesBitmap: any[];
  clientPanoTreceId: string;
  prefetchVideoId: string;
  noMedia: boolean;
}
interface StreamReplyType {
  traceIds: string[];
  vehicle: string;
  mediaSrc?: string;
  newUserStates: NewUserStatesType[];
  actionResponses: any[];
  getStateType: number;
  code: number;
  msg: string;
  // breakPointId?: number;
  startBreakPointId?: number;
  endBreakPointId?: number;
  breakPointId?: number; //临时记录存在的点（）
  mType?: string; //类型
  DIR: ?number;
  isIDR?: boolean;
}

// interface NewUserStatesType{

// }

interface StreamPushResponse {
  frame: number;
  done: boolean;
  clipPath?: string;
}
