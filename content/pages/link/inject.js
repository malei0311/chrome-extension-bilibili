import * as giftList from './gift_list/index.js';
import log from '../../utils/log.js';

const injectors = new Map([['#/my-room/gift-list', giftList]]);

function getCurPageHash() {
  return location.hash;
}

function hasInjector(hash) {
  return injectors.has(hash);
}

function run() {
  const hash = getCurPageHash();
  if (!hasInjector(hash)) {
    log.log('no injector', hash);
    return;
  }

  const injector = injectors.get(hash);
  log.log('inject to', hash);
  injector.inject();
}

export function init() {
  run();
  window.addEventListener(
    'hashchange',
    () => {
      log.log('hash changing');
      run();
    },
    false
  );
}
