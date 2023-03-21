import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { WsAdapter } from '@nestjs/platform-ws';
import { WsAdapter } from './ws-adapter';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { WinstonModule } from 'nest-winston';
import { LoggerConfig } from './logConfig';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(LoggerConfig),
  });
  app.enableCors();
  app.useWebSocketAdapter(new WsAdapter(app));
  const configService = app.get(ConfigService);
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  const http = configService.get('http');

  await app.listen(http.port, http.host, function () {
    const logger = new Logger('bootstrap');
    logger.log(`listening on port ${http.port}`);
  });
}
bootstrap();
