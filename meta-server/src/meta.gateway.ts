import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { Server } from 'ws';
import * as WebSocket from 'ws';

import {
  PeerConnection,
  initLogger,
  DataChannel,
  cleanup,
} from 'node-datachannel';

import { Buffer } from 'buffer';
import { Logger } from '@nestjs/common';
import * as path from 'path';
import { createReadStream } from 'fs';
import { SceneService } from './scene/scene.service';
import { ConfigService } from '@nestjs/config';
import { stringify } from 'querystring';

// 'Verbose' | 'Debug' | 'Info' | 'Warning' | 'Error' | 'Fatal';
initLogger('Debug');

@WebSocketGateway({
  transports: ['websocket'],
  cors: '*',
  // namespace: "ws",
  path: '/ws',
})
export class MetaGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly sceneService: SceneService,
    private readonly configService: ConfigService,
  ) { }
  private logger: Logger = new Logger('MetaGateway');
  private peer: PeerConnection = null;
  private timer: NodeJS.Timeout;
  private _webrtcInterval: NodeJS.Timeout;
  private heartBeatFlag: number;
  private gameChanel: DataChannel;
  private user_id: string;
  private roomId: string;
  private startstreamingSub: any;
  @WebSocketServer() server: Server;

  // @SubscribeMessage('message')
  // handleMessage(client: any, payload: any) {
  //   this.logger.log(`payload: ${JSON.stringify(payload)}`);
  // }
  afterInit(server: Server) {
    this.logger.log('Init MetaGateway');
  }

  @SubscribeMessage('init')
  handleInit(client: any, payload: any) {
    this.logger.log(`socket::init: ${JSON.stringify(payload)}`);
  }

  @SubscribeMessage('heartbeat')
  handleHeartBeat(client: any, payload: any) {
    // this.logger.log(`heartbeat: ${JSON.stringify(payload)}`);
    // console.log('hb', payload);
    this.heartBeatFlag = payload;
    const pong = {
      channel_id: '',
      client_os: '',
      data: payload,
      fe_version: '',
      id: 'heartbeat',
      packet_id: '',
      room_id: '',
      session_id: '',
      trace_id: '',
      user_id: '',
    };

    return pong;
  }

  @SubscribeMessage('init_webrtc')
  handleInitWebRtc(client: any, payload: any): void {
    // TODO 可能会中断连接
    // cleanup();
    this.logger.log('action::handleInitWebRtc', JSON.stringify(payload));
    const stun_server = this.configService.get('stun.server');
    const portRangeBegin = this.configService.get('stun.portRangeBegin');
    const portRangeEnd = this.configService.get('stun.portRangeEnd');

    this.peer = new PeerConnection('roomRtc', {
      portRangeBegin: portRangeBegin,
      portRangeEnd: portRangeEnd,
      iceServers: stun_server,
      // enableIceTcp: true,
      // maxMessageSize: 65535,
      // maxMessageSize: 16000, // 16k
      mtu: 1500,
    });

    this.peer.onLocalDescription((sdp, type) => {
      // console.warn('peer SDP:', sdp, ' Type:', type);
      const offer = { sdp, type };
      const offerFormat = {
        id: 'offer',
        data: Buffer.from(JSON.stringify(offer)).toString('base64'),
      };
      this.logger.log('peer::onLocalDescription', JSON.stringify(offerFormat));
      client.send(JSON.stringify(offerFormat));
    });

    const replaceToPublic = (candidate) => {
      const PRIVATE_IP = this.configService.get('server.private_ip');
      const PUBLIC_IP = this.configService.get('server.public_ip');
      this.logger.log(
        'peer::replaceToPublic',
        `private_ip:${PRIVATE_IP} to public_ip:${PUBLIC_IP}`,
      );
      return candidate.replace(PRIVATE_IP, PUBLIC_IP);
    };

    this.peer.onLocalCandidate((candidate, mid) => {
      if (/172\./.test(candidate)) {
        this.logger.log('server private Ip process', JSON.stringify(candidate));
        const PRIVATE_IP = this.configService.get('server.private_ip');
        if (candidate.includes(PRIVATE_IP)) {
          candidate = replaceToPublic(candidate);
        } else {
          return;
        }
      }
      if (/192.168\./.test(candidate)) {
        this.logger.warn('是192.168.10测试网段' + candidate);
        const PRIVATE_IP = this.configService.get('server.private_ip');
        if (candidate.includes(PRIVATE_IP)) {
          candidate = replaceToPublic(candidate);
        } else {
          return;
        }
      }
      this.logger.warn('onLocalCandidate last Candidate:' + candidate);

      const iceRes = {
        candidate,
        sdpMid: mid,
        sdpMLineIndex: 0,
      };

      const res = {
        channel_id: '',
        client_os: '',
        data: Buffer.from(JSON.stringify(iceRes)).toString('base64'),
        fe_version: '',
        id: 'ice_candidate',
        packet_id: '',
        room_id: '',
        session_id: '',
        trace_id: '',
        user_id: '',
      };

      client.send(JSON.stringify(res));
    });

    this.peer.onStateChange((state) => {
      console.log('peer-State:', state);
    });
    this.peer.onGatheringStateChange((state) => {
      console.log('GatheringState:', state);
    });

    this.peer.onTrack((track) => {
      console.log('track', track);
    });

    this.gameChanel = this.peer.createDataChannel('game-input', {
      // ordered: true,
      // negotiated: false,
    });

    this.peer.onDataChannel((dc) => {
      console.log('onDataChannel', dc);
    });

    this.gameChanel.onOpen(() => {
      this.logger.log('channel is open');
      if (this.gameChanel.isOpen()) {
        const peers = this.peer.getSelectedCandidatePair();
        this.logger.log('配对成功', JSON.stringify(peers));
        console.log('gameChanel', this.gameChanel.isOpen());
        this.sendWertcHeartPack(this.gameChanel);
        this.sceneService.handleDataChanelOpen(this.gameChanel, this.peer);
      } else {
        console.log('gameChanel has problem');
      }

      // Number.prototype.padLeft = function (n, str) {
      //   return Array(n - String(this).length + 1).join(str || '0') + this;
      // };
    });
    this.gameChanel.onClosed(() => {
      console.log('gameChanel close');
      this.sceneService.handleDataChanelClose();
      this.stopSendWertcHeartPack();
      cleanup();
      if (this.startstreamingSub) {
        this.startstreamingSub.unsubscribe();
      }
    });
    this.gameChanel.onMessage((event) => {
      this.sceneService.handleMessage(event);
    });
    this.gameChanel.onError(() => {
      console.log('gameChanel onError');
      this.stopSendWertcHeartPack();
    });
  }

  sendWertcHeartPack(channel: DataChannel) {
    const heartPack = new DataView(new ArrayBuffer(4));
    heartPack.setUint32(0, 2009889916);
    this._webrtcInterval = setInterval(() => {
      if (channel && channel.isOpen()) {
        channel.sendMessageBinary(Buffer.from(heartPack.buffer));
      }
    }, 200);
  }

  stopSendWertcHeartPack(): void {
    clearInterval(this._webrtcInterval);
  }

  @SubscribeMessage('ice_candidate')
  handlerIceCandidate(client: any, payload: any) {
    const iceCandidate = Buffer.from(payload, 'base64').toString('utf-8');
    const candidate = JSON.parse(iceCandidate);
    // console.warn('收到ice_candidate',);
    this.logger.log('server get ice_candidate', JSON.stringify(candidate));
    this.peer.addRemoteCandidate(candidate.candidate, candidate.sdpMid);
  }

  @SubscribeMessage('answer')
  handerAnswer(client: any, payload: any) {
    const answer = Buffer.from(payload, 'base64').toString('utf-8');
    console.log('answer', answer);
    const clientAnswer = JSON.parse(answer);
    this.peer.setLocalDescription(clientAnswer.sdp);
    this.peer.setRemoteDescription(clientAnswer.sdp, clientAnswer.type);
  }

  @SubscribeMessage('start')
  handlerWebrtcStart(client: any, payload: any) {
    console.log('start', payload);
    try {
      const obj = JSON.parse(payload);
      const requestPayLoad: InitRequest = Object.assign({}, obj, {
        user_id: this.user_id,
        roomId: this.roomId,
      });
      this.sceneService.init(requestPayLoad);
      this.logger.log(
        'start and send to gprc sceneService,method=>init',
        JSON.stringify(requestPayLoad),
      );

      const startReply = {
        id: 'start',
        data: '{"IsHost":false,"SkinID":"0000000001","SkinDataVersion":"1008900008","RoomTypeID":""}',
        room_id: 'aea5406a-3099-48db-b428-30917872e58a',
        channel_id: '3a1a62e9a3c74de6___channel',
        user_id: 'ed58c8d4ce38c',
        trace_id: '394df10a-d924-43a9-940d-1dbb41e43f24',
        packet_id: '',
        session_id: '67087ad820ea4c89af311e27281d73a6',
        client_os: '',
        fe_version: '',
      };
      this.startstreamingSub = this.sceneService.startSteaming.subscribe(
        (val) => {
          if (val) {
            console.log('onSteaming-start', val);
            client.send(JSON.stringify(startReply));
          }
        },
      );
    } catch (error) { }
  }

  handleConnection(client: WebSocket, ...args: any[]) {
    const { url } = args[0];
    console.log('url', url);
    const params = new URLSearchParams(url.replace('/ws?', ''));

    console.log('useId', params.get('userId'));
    console.log('roomId', params.get('roomId'));

    console.log('reconnect', params.get('reconnect'));

    this.user_id = params.get('userId');
    this.roomId = params.get('roomId');
    const reconnect = params.get('reconnect');
    this.sceneService.setConfig(this.user_id, this.roomId);

    this.logger.log(`Client connected:`);

    const connected = {
      channel_id: '',
      client_os: '',
      data: '',
      fe_version: '',
      id: 'init',
      packet_id: '',
      room_id: '',
      session_id: '',
      trace_id: '',
      user_id: '',
    };
    const tt = JSON.stringify(connected);

    client.send(tt);
  }
  handleDisconnect(client: WebSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.peer && this.peer.close();
    if (this.startstreamingSub) {
      this.startstreamingSub.unsubscribe();
      this.startstreamingSub = null;
    }
    this.sceneService.stopStream();
  }
}
