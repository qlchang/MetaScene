import {
  OnQueueActive,
  OnQueueCleaned,
  OnQueueCompleted,
  OnQueueDrained,
  OnQueueStalled,
  Process,
  Processor,
} from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { MoveService } from 'src/move/move.service';
import { SceneService } from './scene.service';
import { StreamService } from './stream/stream.service';

@Processor('walking')
@Injectable()
export class WalkingConsumer {
  constructor(
    private streamService: StreamService,
    private sceneService: SceneService,
    private moveService: MoveService,
  ) {}
  private isDone = true;
  private _checkerRotateDone: NodeJS.Timeout;
  @Process()
  async processFrame(job: Job<unknown>) {
    const jobData = job.data as any as StreamFrameType;
    // console.log('jobData', jobData);
    const done = await this.streamService.pushFrameToSteam(jobData);
    // }
    return { done: done };
  }

  @OnQueueActive()
  onActive(job: Job) {
    clearTimeout(this._checkerRotateDone);
  }

  @OnQueueDrained()
  onDrained(job: Job) {
    console.log(`onDrained`, job);
  }

  @OnQueueCompleted()
  onQueueComplete(job: Job) {
    console.log(`walking-frame`, job.data.frame);
    this._checkerRotateDone = setTimeout(() => {
      console.log('walking--1秒后开流');
      const next = job.data.frame + 1;
      this.sceneService.resumeStream();
      this.sceneService.onRotating.next(false);
      this.sceneService.frameCnt.next(next);

      const { userId } = this.sceneService.getConfig();
      const lastFrame = JSON.parse(job.data.metaData);
      const breakPointId = lastFrame.marker.split('T')[1];
      const lastReply = lastFrame;
      this.moveService.updateUser(userId, breakPointId, lastReply);
    }, 1000);
  }

  // @OnGlobalQueueCompleted()
  // onGlobalQueueCompleted() {
  //   console.log(`onGlobalQueueCompleted`);
  // }

  @OnQueueStalled()
  onStalled() {
    console.log(`OnQueueStalled`);
  }
  @OnQueueCleaned()
  onCleaned() {
    console.log(`OnQueueCleaned`);
  }
}
