import log from '../../../utils/log.js';
import Processor from './processor.js';
import { sendRequest } from '../../../utils/helpers.js';
import Event from '../../../utils/event.js';
import { EVENT_GIFT_LIST_PROGRESS } from '../../../utils/config.js';

export async function exportCsv(params = {}) {
  const start = new Date();
  let processor = new Processor(params.begin_time);
  try {
    await getData(params, processor);
  } catch (err) {
    processor = null;
    return Promise.reject(err);
  }
  processor.download();
  log.log(
    `export csv success, cost ${Math.round((Date.now() - start) / 1000)}s`
  );
}

export async function exportMonthCsv(params = {}) {
  const start = new Date();
  const { begin_time } = params;
  const [year = '', month = ''] = begin_time.split('-');
  let processor = new Processor(`${year}-${month}`);
  const day = getDay(month);
  try {
    await new Array(day).fill().reduce((p, _, idx) => {
      return p.then(() => {
        const dayStr = `0${idx + 1}`.slice(-2);
        return getData(
          {
            ...params,
            begin_time: `${year}-${month}-${dayStr}`,
          },
          processor
        );
      });
    }, Promise.resolve());
  } catch (err) {
    processor = null;
    return Promise.reject(err);
  }
  processor.download();
  log.log(
    `export csv success, cost ${Math.round((Date.now() - start) / 1000)}s`
  );
}

function getDay(month) {
  return [1, 3, 5, 7, 8, 10, 12].includes(+month) ? 31 : month === 2 ? 29 : 30;
}

function triggerProgress(data = {}) {
  const event = Event.getInstance();
  event.emit(EVENT_GIFT_LIST_PROGRESS, data);
}

async function getPageData(params = {}) {
  const { page_num, begin_time, page_size } = params;
  if (page_num == 1) {
    triggerProgress({
      date: begin_time,
      total: 0,
      cur: page_num,
    });
  }
  const { list = [], total = 0 } = await sendRequest(
    'https://api.live.bilibili.com/xlive/revenue/v1/giftStream/getReceivedGiftStreamList',
    {
      query: params,
    }
  );
  triggerProgress({
    date: begin_time,
    total: total ? Math.ceil(total / page_size) : page_num,
    cur: page_num,
  });
  return list;
}

async function getData(params = {}, processor) {
  return getPageData(params).then((list) => {
    processor.write(list);
    if (list.length < params.page_size) {
      return;
    }
    return getData(
      {
        ...params,
        page_num: params.page_num + 1,
      },
      processor
    );
  });
}
