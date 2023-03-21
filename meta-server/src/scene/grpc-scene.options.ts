import { Transport, ClientOptions } from '@nestjs/microservices';
import { join } from 'path';
import configuration from 'src/config/configuration';
console.log('grpc.url', configuration().grpc.url);
export const grpcClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: configuration().grpc.url,
    package: 'scene',
    protoPath: join(__dirname, '..', 'proto/scene.proto'),
    loader: {
      keepCase: true,
    },
  },
};
