import log from '../../../utils/log.js';
import Processor from './processor.js';
import { sendRequest } from '../../../utils/helpers.js';

export async function exportCsv(params = {}) {
  const start = new Date();
  let processor = new Processor(params.begin_time);
  try {
    await getData(params, processor);
  } catch (err) {
    processor = null;
    return;
  }
  processor.download();
  log.log(`export csv success, cost ${Math.round((Date.now() - start) / 1000)}s`);
}

async function getPageData(params = {}) {
  const ret = await sendRequest('https://api.live.bilibili.com/xlive/revenue/v1/giftStream/getReceivedGiftStreamList', {
    query: params,
  });
  return ret.list || [];
}

async function getData(params = {}, processor) {
  return getPageData(params).then((list) => {
    processor.write(list);
    if (list.length < params.page_size) {
      return;
    }
    return getData({
      ...params,
      page_num: params.page_num + 1,
    }, processor);
  });
}
