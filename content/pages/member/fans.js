import log from '../../utils/log.js';
import Processor from './fans_processor.js';
import { MSG_TYPE_CONTENT } from '../../utils/config.js';

export async function exportCsv(year) {
  const start = new Date();
  let processor = new Processor(year);
  try {
    await getAll(year, processor);
  } catch (err) {
    processor = null;
    return;
  }
  processor.download();
  log.log(`export csv success, cost ${Math.round((Date.now() - start) / 1000)}s`);
}

function sendRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type: MSG_TYPE_CONTENT,
        data: {
          url,
          options,
        },
      },
      function(resp) {
        const lastError = chrome.runtime.lastError;
        if (lastError) {
          log.log('can not connect to bg:', lastError.message);
          reject(lastError);
          return;
        }

        if (resp.type === 'error') {
          reject(new Error('retry overflow'));
          return;
        }
        resolve(resp.data);
      }
    );
  });
}

async function getMonth(month) {
  const ret = await sendRequest('http://member.bilibili.com/x/web/data/action', {
    query: {
      tmid: '364225566',
      month,
    },
  });
  const data = ret.relation_fans_history;
  if (!data) {
    return [];
  }
  const { follow, unfollow } = data;
  return Object.keys(follow).map((month) => {
    return {
      month,
      f: follow[month],
      u: unfollow[month],
    };
  }).sort((a, b) => {
    return a.month > b.month ? 1 : -1;
  });
}

async function getAll(year, processor) {
  await Array(12).fill().reduce((p, c, i) => {
    return p.then(() => {
      const month = `${i + 1}`.padStart(2, '0');
      return getMonth(`${year}${month}01`).then((list) => {
        return processor.write(list);
      }).catch((err) => {
        console.log('err', err);
      });
    });
  }, Promise.resolve());
}
