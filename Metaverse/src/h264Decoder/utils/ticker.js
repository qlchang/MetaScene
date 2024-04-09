const raf = (callback, delay) => {
  return setTimeout(callback, delay);
};

raf.cancel = (handler) => {
  clearTimeout(handler);
};

class Ticker {
  constructor() {
    this.extra = 0;
    this.timestamp = 0;
    this.interval = 1000 / 60;
    this.callbacks = [];
    this.handler = raf(this._tick.bind(this), this.interval);
  }

  setFps(fps) {
    if (fps) {
      this.interval = 1000 / fps;
    }
  }

  add(func) {
    this.callbacks.push(func);
  }

  remove(func) {
    for (let i = this.callbacks.length - 1; i >= 0; i--) {
      if (this.callbacks[i] == func) {
        this.callbacks.splice(i, 1);
      }
    }
  }

  destroy() {
    raf.cancel(this.handler);
    this.handler = null;
    this.callbacks = [];
  }

  _tick() {
    const now = this._now();
    if (!this.timestamp) {
      this.timestamp = now;
    }

    let extra = this.extra;
    const diff = now - this.timestamp + extra;
    let loop = Math.floor(diff / this.interval);
    extra = diff - this.interval * loop;
    if (extra >= this.interval / 1.5) {
      loop = Math.ceil(diff / this.interval);
      extra = 0;
    }

    if (loop) {
      for (let i = 0; i < this.callbacks.length; i++) {
        for (let j = 0; j < loop; j++) {
          this.callbacks[i](now - this.timestamp);
        }
      }
      this.extra = extra;
      this.timestamp = now;
    }

    this.handler = raf(this._tick.bind(this), this.interval);
  }

  _now() {
    if (window.performance && window.performance.now) {
      return window.performance.now();
    }
    return +new Date();
  }
}

export default Ticker;
