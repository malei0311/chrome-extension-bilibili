const CATES = [
  'time',
  'timeEnd',
  'table',
  'log',
  'warn',
  'error',
  'info',
  'debug',
];
const PREFIX = '[bilibili analysis]';

function transform(cate = 'log', isTurnoff = true) {
  if (isTurnoff) {
    return () => {};
  }
  return (...args) => {
    if (cate !== 'table') {
      if (cate === 'time' || cate === 'timeEnd') {
        args[0] = `${PREFIX} ${args[0]}`;
      } else {
        args.unshift(PREFIX);
      }
    }
    Function.prototype.call.call(console[cate], console, ...args);
  };
}

function init() {
  const isTurnoff = false;
  return CATES.reduce((ret, cate) => {
    ret[cate] = transform(cate, isTurnoff);
    return ret;
  }, {});
}

export default init();
