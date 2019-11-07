import { delay } from './helpers.js';
import log from './log.js';

// NOTE: 只处理返回值是 json 格式的, 处理 B 站数据
export default function request(url = '', options = {}) {
  const timeout = options.timeout || 10000;
  return Promise.race([
    doFetch(url, options),
    delay(timeout).then(() => Promise.reject(new Error(`timeout: ${timeout}`))),
  ]);
}

function doFetch(url = '', options = {}) {
  const opts = handleOptions({ url, ...options });
  const start = Date.now();
  return fetch(opts.url, opts).then(handleJsonResp).then((resp) => {
    const elapse = Date.now() - start;
    log.log(`request success, elapse: ${elapse}ms, url:`, opts.url, opts);
    return resp;
  }).catch((err) => {
    const elapse = Date.now() - start;
    log.log(`request error, elapse: ${elapse}ms, err:`, err, opts.url, opts);
    return Promise.reject(err);
  });
}

function handleOptions(options = {}) {
  const opts = {
    method: 'get',
    credentials: 'include',
    ...options,
  };
  opts.url = createURL(opts);
  opts.method = opts.method && opts.method.toLowerCase();
  opts.headers = new Headers({
    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    ...opts.headers,
  });
  opts.body = formatBody(opts);
  return opts;
}

function handleJsonResp(response) {
  return response.json().then((json) => {
    if (response.ok) {
      if (json.code === 0) {
        return json.data;
      }
      const err = new Error(
        `code: ${json.code}, message: ${json.message}, ` +
          `data: ${JSON.stringify(json.data)}`
      );
      return Promise.reject(err);
    }
    const err = new Error(
      `response error, status: ${response.status}, statusText: ${response.statusText}`
    );
    return Promise.reject(err);
  });
}

function createURL(opts) {
  const { url, query } = opts;
  if (!query) return url;
  const dimimiter = url.includes('?') ? '&' : '?';
  return `${url}${dimimiter}${queryStringify(query)}`;
}

function queryStringify(params) {
  if (!params) return;
  return Object.entries(params).reduce((pre, entry, i) => {
    const [param, value] = entry;
    const str = `${param}=${encodeURIComponent(value)}`;
    const encoded = i === 0 ? str : `&${str}`;
    return `${pre}${encoded}`;
  }, '');
}

function formatBody(opts) {
  const method = opts.method;
  if (method === 'get') return;

  const type = opts.headers.get('content-type');
  if (!type) return;

  if (type.includes('x-www-form-urlencoded')) return queryStringify(opts.body);
  if (type.includes('json')) return JSON.stringify(opts.body);

  return opts.body;
}
