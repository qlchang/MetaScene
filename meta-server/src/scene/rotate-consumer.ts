import {
  OnGlobalQueueCompleted,
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
import { SceneService } from './scene.service';
import { StreamService } from './stream/stream.service';

@Processor('rotate')
@Injectable()
export class RotateConsumer {
  constructor(
    private streamService: StreamService,
    private sceneService: SceneService,
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
    console.log(`onDrained`);
  }

  @OnQueueCompleted()
  onQueueComplete(job: Job) {
    console.log(`onQueueComplete-frame`, job.data.frame);
    this._checkerRotateDone = setTimeout(() => {
      console.log('1秒后开流');
      const next = job.data.frame + 1;
      this.sceneService.resumeStream();
      this.sceneService.onRotating.next(false);
      this.sceneService.frameCnt.next(next);
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
