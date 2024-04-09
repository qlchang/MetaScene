import { Module } from '@nestjs/common';
import { UtilsService } from './utils.service';

@Module({
  providers: [UtilsService],
  exports: [UtilsService],
})
export class UtilsModule {
  initPadleft(): void {
    // function padLeft(nr, n, str) {
    //   return Array(n - String(nr).length + 1).join(str || '0') + nr;
    // };
    //or as a Number prototype method:
    Number.prototype.padLeft = function (n, str) {
      return Array(n - String(this).length + 1).join(str || '0') + this;
    };
  }
}
