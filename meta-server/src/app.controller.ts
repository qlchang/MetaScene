import { Controller, Get, OnModuleInit } from '@nestjs/common';
import { AppService } from './app.service';
import { grpcClientOptions } from './scene/grpc-scene.options';
import { ClientGrpc, Client } from '@nestjs/microservices';
import { SceneService } from './scene/scene.service';

@Controller()
export class AppController implements OnModuleInit {
  @Client(grpcClientOptions) private readonly client: ClientGrpc;
  private sceneGrpcService: SceneGrpcService;

  constructor(
    private readonly appService: AppService,
    private readonly sceneService: SceneService,
  ) {}

  onModuleInit() {
    // console.log('this.client', this.client);
    // this.sceneGrpcService =
    //   this.client.getService<SceneGrpcService>('SceneGrpcService');
    // console.log('this.sceneGrpcService', this.sceneGrpcService);
  }
  @Get()
  getHello(): string {
    // console.log('UtilsModule', UtilsModule);
    // const params: RouteRequest = {
    //   sLocation: {
    //     x: '6.0',
    //     y: '0.0',
    //     z: '-4.0',
    //   },
    //   eLocation: {
    //     x: '4.0',
    //     y: '0.0',
    //     z: '-3.0',
    //   },
    //   sceneCode: 'Hello',
    // };
    // // // console.log('params', params);
    // const test = this.sceneGrpcService.getRoute(params);
    // test.subscribe((val) => {
    //   console.log('val', val);
    // });

    try {
      // const demo_test = {
      //   user_id: '92dd7e2f-cca9-495d-8f16-458e628ea827',
      //   nick_name: 'Hello',
      //   skin_id: 'ce098a8f-a7fc-4721-9c37-31bdbc580c59',
      //   avatar_id: 'c961561e-78e5-4478-b158-944e3b9c9287',
      //   room_id: 'c38187b6-d4af-44bb-8028-7ad1e5461cd8',
      //   app_id: '2282e1b5-6129-4e0d-a30b-2339a1c761cd',
      //   player: {
      //     position: {
      //       x: '0.0',
      //       y: '0.0',
      //       z: '0.0',
      //     },
      //     angle: {
      //       pitch: 10,
      //       yaw: 10,
      //       roll: 10,
      //     },
      //   },
      // };
      // const initReply = this.sceneGrpcService.init(demo_test);
      // initReply.subscribe((val) => {
      //   console.log('val', val);
      // });
      // const params = {
      //   action_type: 1009,
      //   echo_msg: {
      //     echoMsg: 'Hello',
      //   },
      //   trace_id: '2b6e3444-63eb-40a7-8049-1d6616f16664',
      //   user_id: '31a6322c-78f1-4744-99df-bc042f50bebc',
      // };
      // console.log('initReply');
    } catch (error) {
      console.log('test', error);
    }
    return this.appService.getHello();
  }
}
