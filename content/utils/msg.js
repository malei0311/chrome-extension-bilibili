import {
  MSG_TYPE_CONTENT,
  MSG_TYPE_INJECT,
} from './config.js';

import { delay } from './helpers.js';

let id = 0;

const MSG_TYEPS = new Set([
  MSG_TYPE_INJECT,
  MSG_TYPE_CONTENT,
]);

const ACTIONS = new Map([
  ['GET_OID', '__get_oid__'],
  ['GET_EL_VUE_INS', '__get_el_vue_ins__'],
]);

function checkType(type) {
  if (!MSG_TYEPS.has(type)) {
    throw new Error('type is invalid');
  }
}

function increaseId() {
  id = ++id % Number.MAX_SAFE_INTEGER;
  return id;
}

function buildMsg(type = MSG_TYPE_CONTENT, data = {}, id) {
  checkType(type);
  return {
    id: id || increaseId(),
    type,
    data,
  };
}

function send(type, data, id) {
  const msg = buildMsg(type, data, id);
  window.postMessage(msg, '*');
  return msg.id;
}

function on(type = MSG_TYPE_CONTENT, callback, raw = false, id) {
  checkType(type);
  window.addEventListener(
    'message',
    function(event) {
      if (
        event.source !== window ||
        !event.data ||
        event.data.type !== type ||
        (id && id !== event.data.id)
      ) {
        return;
      }
      callback && callback(raw ? event.data : { ...event.data.data });
    },
    false
  );
}

async function sendWithRet(type, data, timeout = 1000) {
  const onType = type === MSG_TYPE_INJECT ? MSG_TYPE_CONTENT : MSG_TYPE_INJECT;
  return Promise.race([
    new Promise((resolve) => {
      on(onType, (resp) => {
        resolve(resp)
      }, false, send(type, data))
    }),
    delay(timeout).then(() => Promise.reject(new Error(`timeout: ${timeout}`))),
  ])
}

function injectMsger() {
  const script = document.createElement('script');
  if (!(chrome.runtime && chrome.runtime.getURL)) {
    return;
  }
  const id = `${chrome.runtime.id}_msger`;
  if (document.querySelector(`#${id}`)) {
    return;
  }
  script.src = chrome.runtime.getURL('content/utils/msger.js');
  script.id = id;
  script.type = 'module';
  document.body.appendChild(script);
  return new Promise((resolve) => {
    script.onload = resolve;
  })
}

const onPage = on.bind(null, MSG_TYPE_INJECT);
const onContent = on.bind(null, MSG_TYPE_CONTENT);
const sendToPage = send.bind(null, MSG_TYPE_CONTENT);
const sendToContent = send.bind(null, MSG_TYPE_INJECT);
const sendToPageWithRet = sendWithRet.bind(null, MSG_TYPE_CONTENT);
const sendToContentWithRet = sendWithRet.bind(null, MSG_TYPE_INJECT);

export {
  ACTIONS,
  send,
  on,
  onPage,
  onContent,
  sendToPage,
  sendToContent,
  injectMsger,
  sendWithRet,
  sendToPageWithRet,
  sendToContentWithRet,
};
