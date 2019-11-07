import * as pageAction from './page_action.js';
import * as requestWorker from './request_worker.js';

chrome.runtime.onInstalled.addListener(function() {
  pageAction.init();
  requestWorker.init();
});
