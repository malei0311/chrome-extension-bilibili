import log from './log.js';
import { MSG_TYPE_CONTENT } from './config.js';

export function debounce(fn, time = 500) {
  let timer = null;
  return function debounced(...args) {
    const ctx = this;
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(ctx, args);
    }, time);
  };
}

export function throttle(fn, time = 500) {
  let timer = null;
  let first = true;
  return function throttled(...args) {
    const ctx = this;
    if (first) {
      first = false;
      fn.apply(ctx, args);
      return;
    }
    if (timer) {
      return;
    }
    timer = setTimeout(() => {
      clearTimeout(timer);
      timer = null;
      fn.apply(ctx, args);
    }, time);
  };
}

export function observe(el = document.body, callback, config = {}) {
  const cb = (list) => {
    for (let mutation of list) {
      callback(mutation.type);
    }
  };
  const observer = new MutationObserver(cb);
  observer.observe(el, {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true,
    ...config,
  });
  return observer;
}

export function find(selector, maxTime = 100) {
  if (!selector) {
    return Promise.reject(new Error('selector is required'));
  }
  let timer = null;
  let times = 0;

  function doFind(el, resolve, reject) {
    if (timer) {
      clearTimeout(timer);
    }
    times += 1;
    const els = document.querySelectorAll(el);
    if (!els.length) {
      if (times >= maxTime) {
        const msg = `find selector: ${el}, times exceeded: ${maxTime}`;
        log.warn(msg);
        reject(new Error(msg));
        return;
      }
      timer = setTimeout(() => {
        doFind(el, resolve, reject);
      }, 500);
      return;
    }
    log.log(`find selector: ${el}, times: ${times}`);
    times = 0;
    timer = null;
    resolve(Array.from(els));
  }

  return new Promise((resolve, reject) => {
    doFind(selector, resolve, reject);
  });
}

export function logSearchParams(params) {
  if (!(params instanceof URLSearchParams)) {
    return;
  }
  log.table(Array.from(params));
}

export function formatDate (date, format) {
  const o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'H+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds() // 毫秒
  }
  let fmt = format || 'yyyy-MM-dd HH:mm:ss'
  if (/(y+)/.test(fmt)) { 
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      )
    }
  }
  return fmt
}

export function download(
  content = '',
  filename = '',
  mimeType = 'text/csv;encoding:utf-8'
) {
  filename = filename.replace(/[\/:*?"<>|\s]+/g, '_');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(
    new Blob([content], {
      type: mimeType,
    })
  );
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function inject(filepath) {
  const script = document.createElement('script');
  script.setAttribute('type', 'module');
  script.setAttribute('src', chrome.runtime.getURL(filepath));
  script.onload = function() {
    this.remove();
  };
  const head =
    document.head ||
    document.getElementsByTagName('head')[0] ||
    document.documentElement;
  head.insertBefore(script, head.lastChild);
}

export function delay(time = 1000) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

export function retry(fn, maxTimes = 5) {
  let times = 0;
  return async function tmp(...args) {
    try {
      const ret = await fn(...args);
      return ret;
    } catch (e) {
      log.log(
        `retry fn error, fn: ${fn.name}, times: ${times}, ` +
          `args=${args}, msg: ${e.message}`
      );
      times += 1;
      if (times >= maxTimes) {
        return Promise.reject(
          new Error(
            `retry times overflow, ` +
              `fn: ${fn.name}, times: ${times}, args: ${args}`
          )
        );
      }
      const buff = parseInt(4e3 * (Math.random() - 0.5), 10);
      return delay(Math.pow(2, times) * 1000 + buff).then(() => {
        return tmp(...args);
      });
    }
  };
}

export function sendRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type: MSG_TYPE_CONTENT,
        data: {
          url,
          options,
        },
      },
      function sendByBgCb(resp) {
        const lastError = chrome.runtime.lastError;
        if (lastError) {
          log.log('can not connect to bg:', lastError.message);
          reject(lastError);
          return;
        }

        if (resp.type === 'error') {
          reject(new Error('retry overflow'));
          return;
        }
        resolve(resp.data);
      }
    );
  });
}
