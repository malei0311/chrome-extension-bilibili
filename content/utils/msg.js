import {
  MSG_TYPE_CONTENT,
  MSG_TYPE_INJECT,
} from './config.js';

const MSG_TYEPS = new Set([
  MSG_TYPE_INJECT,
  MSG_TYPE_CONTENT,
]);

function checkType(type) {
  if (!MSG_TYEPS.has(type)) {
    throw new Error('type is invalid');
  }
}

export function buildMsg(type = MSG_TYPE_CONTENT, data = {}) {
  checkType(type);
  return {
    type,
    data,
  };
}

function send(type, data) {
  window.postMessage(buildMsg(type, data), '*');
}

function on(type = MSG_TYPE_CONTENT, callback) {
  checkType(type);
  window.addEventListener(
    'message',
    function(event) {
      if (event.source !== window || !event.data || event.data.type !== type) {
        return;
      }
      callback && callback(event.data.data);
    },
    false
  );
}

export default {
  send,
  on,
  onPage: on.bind(null, MSG_TYPE_INJECT),
  onContent: on.bind(null, MSG_TYPE_CONTENT),
  sendToPage: send.bind(null, MSG_TYPE_CONTENT),
  sendToContent: send.bind(null, MSG_TYPE_INJECT),
};
