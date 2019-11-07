function promisify(fn, key) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      const cb = args.pop();
      let isFn = true;
      if (typeof cb !== 'function') {
        if (key !== 'clear') {
          args.push(cb);
        }
        isFn = false;
      }
      args.push((items) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        isFn && cb(items);
        resolve(items);
      });
      fn.apply(chrome.storage.local, args);
    });
  };
}

export default new Proxy(
  {},
  {
    get(target, key) {
      if (chrome.storage.local[key]) {
        return promisify(chrome.storage.local[key], key);
      } else {
        throw new Error(`no such api [${key}]`);
      }
    },
  }
);
