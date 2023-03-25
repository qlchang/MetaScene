import {
  concat,
  empty,
  of,
  Subject,
  Subscription,
  timer,
  EMPTY,
  BehaviorSubject,
} from 'rxjs';
import {
  concatMap,
  ignoreElements,
  startWith,
  switchMap,
} from 'rxjs/operators';

import RxQueue from '../rx-queue';

/**
 * DelayQueue passes all the items and add delays between items.
 * T: item type
 */
export class DelayQueue<T = unknown> extends RxQueue<T> {
  private subscription: Subscription;
  public subject: Subject<T>;

  /**
   *
   * @param period milliseconds
   */
  constructor(
    period?: number, // milliseconds
  ) {
    super(period);
    this.subject = new Subject<T>();
    this.initQueue();
  }

  initQueue(): void {
    if (!this.subject) {
      this.subject = new Subject<T>();
    }
    this.subscription = this.subject
      .pipe(
        concatMap((x) =>
          concat(
            of(x), // emit first item right away
            /**
             * Issue #71 - DelayQueue failed: behavior breaking change after RxJS from v6 to v7
             *  https://github.com/huan/rx-queue/issues/71
             */
            timer(this.period).pipe(ignoreElements()),
          ),
        ),
      )
      .subscribe((item: T) => super.next(item));
  }

  override next(item: T) {
    this.subject.next(item);
  }

  override unsubscribe() {
    this.subscription.unsubscribe();
    super.unsubscribe();
  }

  override clean(): void {
    this.subscription.unsubscribe();
    this.subject.complete();
    this.subscription = null;
    this.subject = null;
    // this.subject
    //   .asObservable()
    //   .pipe(switchMap(() => EMPTY))
    //   .pipe(ignoreElements());
    // .subscribe((item: T) => super.next(item));

    this.initQueue();
    console.log('clean-DelayQueue');
  }
}

export default DelayQueue;
