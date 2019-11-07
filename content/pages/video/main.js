import log from '../../utils/log.js';
import * as inject from './inject.js';

export function init() {
  const oid = getOid();
  log.log('current page oid', oid);
  if (!oid) {
    return;
  }
  inject.init(oid);
}

function getOid() {
  const ret = location.pathname.match(/\/av(\d+)/);
  return ret && ret[1];
}
