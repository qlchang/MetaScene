import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MetaGateway } from './meta.gateway';
import { RoomModule } from './room/room.module';
import { SceneModule } from './scene/scene.module';
// import { CacheModule } from './cache/cache.module';
import configuration from './config/configuration';
import { LoggerConfig } from './logConfig';
import {
  // utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
// import * as winston from 'winston';
// import { join } from 'path';
import { StreamModule } from './stream/stream.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    RoomModule,
    SceneModule,
    WinstonModule.forRoot(LoggerConfig),
    StreamModule,
  ],
  controllers: [AppController],
  providers: [AppService, MetaGateway],
})
export class AppModule {}
