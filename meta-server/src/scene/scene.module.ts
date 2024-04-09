import { Module, OnModuleInit } from '@nestjs/common';
import { SceneService } from './scene.service';
import { CacheModule } from '../cache/cache.module';
import { CacheService } from '../cache/cache.service';
import { StreamService } from './stream/stream.service';
import { RotateService } from '../rotate/rotate.service';
import { MoveService } from '../move/move.service';
import { GetRouterService } from 'src/get-router/get-router.service';
@Module({
  imports: [CacheModule],
  controllers: [],
  providers: [
    SceneService,
    CacheService,
    StreamService,
    RotateService,
    MoveService,
    GetRouterService,
  ],
  exports: [SceneService, CacheService, RotateService, MoveService],
})
export class SceneModule implements OnModuleInit {
  onModuleInit() {
    //
  }
}
