import log from '../../utils/log.js';
import { injectMsger, sendToPageWithRet, ACTIONS } from '../../utils/msg.js';
import * as inject from './inject.js';

export async function init() {
  const oid = await getOid();
  log.log('current page oid', oid);
  if (!oid) {
    return;
  }
  inject.init(oid);
}

async function getOid() {
  const ret = location.pathname.match(/\/av(\d+)/);
  const oid = ret && ret[1];
  if (oid) {
    return oid;
  }
  // av 号升级 bv 号之后， url 发生变更
  await injectMsger();
  const data = await sendToPageWithRet({
    action: ACTIONS.get('GET_OID'),
  });
  return data.id;
}
