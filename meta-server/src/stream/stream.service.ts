import { Injectable, Logger } from '@nestjs/common';
import { DataChannel } from 'node-datachannel';
// import * as path from 'path';
import { existsSync, readFileSync } from 'fs';
import * as streamBuffers from 'stream-buffers';
import { BehaviorSubject } from 'rxjs';
import { CacheService } from 'src/cache/cache.service';
import { join } from 'path';

@Injectable()
export class StreamService {
  private channel: DataChannel;
  private readonly chunk_size = 16000;
  private readonly block = 36;
  private logger: Logger = new Logger('StreamService');
  public onSteaming = new BehaviorSubject<boolean>(false);
  public lastStreamFrame = new BehaviorSubject<StreamFrameType>({
    frame: -1,
    clipPath: '',
    metaData: '',
  });

  // constructor() { }

  setChannel(channel: DataChannel) {
    this.channel = channel;
  }
  closeChannel() {
    this.channel = null;
  }
  /**
   * stream core push normal stream
   * @param data meta Json
   */

  pushNormalDataToStream(data: any) {
    const replyBin = JSON.stringify(data).replace(/\s/g, '');
    const buff = Buffer.from(replyBin, 'utf-8');
    if (this.channel && this.channel.isOpen()) {
      this.channel.sendMessageBinary(buff);
    }
  }

  /**
   * stream core push with block meta stream
   * @param data meta Json
   */
  pushMetaDataToSteam(stream: StreamMetaType): Promise<StreamPushResponse> {
    return new Promise((resolve, reject) => {
      try {
        const metaData = stream.metaData;
        const frame = stream.frame;
        const metaDataBin = metaData.replace(/\s/g, '');
        const buff = Buffer.from(metaDataBin, 'utf-8');

        // const block = 36;
        const blockBuff = Buffer.alloc(this.block);
        const packBuffer = Buffer.concat([blockBuff, buff]);

        const statusPack = new DataView(
          packBuffer.buffer.slice(
            packBuffer.byteOffset,
            packBuffer.byteOffset + packBuffer.byteLength,
          ),
        );

        statusPack.setUint32(0, 1437227610);
        // 16 bit slot
        statusPack.setUint16(6, this.block);
        statusPack.setUint16(8, frame);
        statusPack.setUint16(10, 255);
        statusPack.setUint16(24, 0);
        statusPack.setUint16(26, 0);

        // 32 bit slot
        statusPack.setUint32(12, buff.byteLength);
        statusPack.setUint32(16, 0);
        // statusPack.setUint32(20, 0);
        statusPack.setUint32(24, 0);
        statusPack.setUint32(28, 0);
        statusPack.setUint32(32, 0);

        if (this.channel && this.channel.isOpen()) {
          const done = this.channel.sendMessageBinary(
            Buffer.from(statusPack.buffer),
          );
          return resolve({ frame: stream.frame, done: done });
        } else {
          return resolve({ frame: stream.frame, done: false });
        }
      } catch (error) {
        this.logger.error(error);
        return reject({ frame: stream.frame, done: false });
      }
    });
  }

  /**
   *  stream core push with block  stream
   * @param stream   meta Json and stream
   */

  pushFrameToSteam(stream: StreamFrameType): Promise<StreamPushResponse> {
    return new Promise((resolve, reject) => {
      try {
        // let start, stop;
        const start = performance.now();
        //TODO process.env 开发路径
        let clipPath: string;
        if (process.env.NODE_ENV === 'development') {
          const src = stream.clipPath.replace('/mnt/metaverse/scene', '');
          const srcTmp = join(__dirname, `../ws/${src}`);
          clipPath = srcTmp;
        } else {
          clipPath = stream.clipPath;
        }
        // 增加不存在帧数据中断数据，原因有太多不准确的路径。
        // 其次其他地方会拿这里的最后一帧数据会出错，由于上流数据很多不稳定问题尽可保流的稳定性。
        if (!existsSync(clipPath)) {
          this.logger.error('不存在的推流路径::' + clipPath);
          return resolve({ frame: stream.frame, done: false });
        }
        // const clipPath = stream.clipPath;
        const metaData = stream.metaData || '{}';
        const frame = stream.frame;
        const serverTime = stream.serverTime || 754871824;
        const dir = stream.DIR || 1;

        this.lastStreamFrame.next({
          clipPath: stream.clipPath,
          metaData: metaData,
          frame: frame,
          serverTime: serverTime,
          DIR: dir,
        });

        const metaDataString = metaData.replace(/\s/g, '');
        const coordBuff = Buffer.from(metaDataString, 'utf-8');
        // console.warn('coordBuff', coordBuff.byteLength);
        // const steamStat = statSync(clipPath);
        // const steamTotalSize = metaData.length + steamStat.size;

        const clipBuffer = readFileSync(clipPath);

        const steam = new streamBuffers.ReadableStreamBuffer({
          frequency: 1, // in milliseconds.
          chunkSize: this.chunk_size - this.block, // in bytes.
        });
        steam.put(coordBuff);
        steam.put(clipBuffer);

        let steamByteLength = 0;

        steam.on('data', (data: Buffer) => {
          this.onSteaming.next(true);

          // this.logger.log('data', data, data.byteLength);
          const blockBuffStart = Buffer.alloc(this.block);
          const packBuffer = Buffer.concat([blockBuffStart, data]);

          const framePack = new DataView(
            packBuffer.buffer.slice(
              packBuffer.byteOffset,
              packBuffer.byteOffset + packBuffer.byteLength,
            ),
          );

          // 16 bit slot
          // framePack.setUint32(4)
          framePack.setUint16(6, this.block);
          framePack.setUint16(8, frame); // first render cnt
          framePack.setUint16(10, dir); // isDIR
          framePack.setUint16(24, 0);
          framePack.setUint16(26, 0);

          // 32 bit slot
          // statusPack.setUint32(12, buff.byteLength);
          // this.logger.log('metaLen', coordBuff.byteLength);
          // this.logger.log('metaLen', clipBuffer.byteLength);

          framePack.setUint32(0, 1437227610);
          framePack.setUint32(12, coordBuff.byteLength); // metaLen
          framePack.setUint32(16, clipBuffer.byteLength); // mediaLen
          framePack.setUint32(20, serverTime); //server_time
          framePack.setUint32(24, 0);
          framePack.setUint32(28, 0);
          framePack.setUint32(this.block - 4, steamByteLength);
          const isLastFrame = framePack.byteLength - this.chunk_size < 0;

          // this.logger.log('statusPack', statusPack);
          if (this.channel && this.channel.isOpen()) {
            this.channel.sendMessageBinary(Buffer.from(framePack.buffer));
          }
          steamByteLength += data.byteLength;
          if (isLastFrame) {
            // this.logger.log('isLastFrame', isLastFrame);
            // steamByteLength = 0;
            // this.onSteaming.next(false);
            steam.stop();
          }
        });
        //TODO steam can't trigger end
        steam.on('end', () => {
          steamByteLength = 0;
          // this.logger.log('stream end');
          const stop = performance.now();
          const inMillSeconds = stop - start;
          const rounded = Number(inMillSeconds).toFixed(3);
          this.logger.log(
            `[timer]-当前流:${stream.clipPath}流耗时-->${rounded}ms`,
          );
          if (this.onSteaming.value) {
            this.onSteaming.next(false);
          }

          return resolve({ frame: stream.frame, done: true });
        });
        steam.on('error', (error) => {
          this.logger.error('steam-error', error.message);
          return reject({ frame: stream.frame, done: false });
        });
      } catch (error) {
        this.logger.error(error);
        return reject({ frame: stream.frame, done: false });
      }
    });
  }
}
