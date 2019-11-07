import { MSG_TYPE_CONTENT } from '../content/utils/config.js';
import log from '../content/utils/log.js';
import request from '../content/utils/request.js';
import { retry } from '../content/utils/helpers.js';

export function init() {
  chrome.runtime.onMessage.addListener((resp, sender, sendResponse) => {
    if (resp.type !== MSG_TYPE_CONTENT) {
      return;
    }
    log.log('bg on content message', resp, 'sender', sender);
    // async
    requestTask(resp.data, sendResponse);
    return true;
  });
}

function requestTask({ url = '', options = {} } = {}, sendResponse) {
  return retry(request)(url, options)
    .then((data) => {
      sendResponse({
        type: 'success',
        data,
      });
    })
    .catch((err) => {
      log.log('request task err:', err.message);
      // NOTE: can not pass Error Object
      sendResponse({
        type: 'error',
      });
    });
}

// NOTE: 测试完多 tab 的情况，如果不行，使用如下方式发送消息
// function sendToContent(url = '', options = {}) {
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     log.log(`bg send to content message, tabs`, tabs);
//     tabs.map((tab) => {
//       chrome.tabs.sendMessage(tab.id, {
//         type: MSG_TYPE_BG,
//         data: {
//           url,
//           options
//         }
//       })
//     })
//   })
// }
