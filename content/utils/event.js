function checkTypeAndListener(type, listener) {
  if (typeof type !== 'string') {
    throw new Error('type must be a string');
  }
  if (typeof listener !== 'function') {
    throw new Error('listener must be a function');
  }
}

function onceWrapper(...args) {
  if (!this.fired) {
    this.target.off(this.type, this.wrapFn);
    this.fired = true;
    return this.listener.apply(this.ctx, args);
  }
}

function _onceWrap(type, listener, ctx, target) {
  const state = {
    fired: false,
    wrapFn: undefined,
    type,
    listener,
    ctx,
    target,
  };
  const wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  wrapped.ctx = ctx;
  state.wrapFn = wrapped;
  return wrapped;
}

/**
 * 事件类，支持链式调用
 */
class Event {
  constructor() {
    this.reset();
  }

  reset() {
    this.store = Object.create(null);
    this.count = 0;
    return this;
  }

  /**
   * 监听事件
   * @param {String} type - 事件类型
   * @param {Function} listener - 事件回调
   * @param {Object} ctx - 事件回调的 context
   */
  on(type, listener, ctx) {
    checkTypeAndListener(type, listener);
    const events = this.store[type];
    if (events === undefined) {
      ++this.count;
      this.store[type] = [];
    }
    this.store[type].push({
      listener,
      ctx,
    });

    return this;
  }

  /**
   * 监听只执行一次的事件
   * @param {String} type - 事件类型
   * @param {Function} listener - 事件回调
   * @param {Object} ctx - 事件回调的 context
   */
  once(type, listener, ctx) {
    checkTypeAndListener(type, listener);
    return this.on(type, _onceWrap(type, listener, ctx, this), ctx);
  }

  /**
   * 触发事件
   * @param {String} type - 事件类型
   * @param {...any} args - 参数
   */
  emit(type, ...args) {
    let events = this.store[type];
    if (events === undefined) {
      return this;
    }
    events = events.slice(0);
    events.forEach(({ listener, ctx }) => {
      listener.apply(ctx, args);
    });
    return this;
  }

  /**
   * 移除事件
   *  1. 没有参数全部移除
   *  2. 有事件类型参数，移除某一类型事件
   *  3. 有事件类型和事件回调参数，移除符合条件的事件
   * @param {String} args[0] - 事件类型
   * @param {Fcuntion} args[1] - 事件回调
   * @param {Object} args[2] - 事件context
   */
  off(...args) {
    // 移除全部事件
    if (args.length === 0) {
      return this.reset();
    }

    let [type, listener, ctx] = args;
    if (typeof type !== 'string') {
      return this.reset();
    }
    const events = this.store[type];
    if (events === undefined) {
      return this;
    }
    const minus = () => {
      if (--this.count === 0) {
        return this.reset();
      }
      delete this.store[type];
      return this;
    };
    // 移除某类事件
    if (args.length === 1) {
      return minus();
    }

    const len = events.length;
    let cb;
    let context;
    for (let i = len - 1; i >= 0; i--) {
      cb = events[i].listener;
      context = events[i].ctx;
      if (cb === listener || cb.listener === listener) {
        if (!ctx) {
          events.splice(i, 1);
        } else if (context === ctx || cb.ctx === ctx) {
          events.splice(i, 1);
        }
      }
    }

    if (events.length === 0) {
      minus();
    }

    return this;
  }
}

let ins = null;
Event.getInstance = () => {
  if (!ins) {
    ins = new Event();
  }
  return ins;
};

export default Event;
