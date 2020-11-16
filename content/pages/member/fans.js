import log from '../../utils/log.js';
import { sendRequest } from '../../utils/helpers.js';
import Processor from './fans_processor.js';

export async function exportCsv(year) {
  const start = new Date();
  let processor = new Processor(year);
  try {
    const id = await getId();
    await getAll(id, year, processor);
  } catch (err) {
    processor = null;
    return;
  }
  processor.download();
  log.log(`export csv success, cost ${Math.round((Date.now() - start) / 1000)}s`);
}

async function getId() {
  const ret = await sendRequest('http://member.bilibili.com/x/web/elec/user');
  return ret.mid
}

async function getMonth(id, month) {
  const ret = await sendRequest('http://member.bilibili.com/x/web/data/action', {
    query: {
      tmid: id,
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

async function getAll(id, year, processor) {
  await Array(12).fill().reduce((p, c, i) => {
    return p.then(() => {
      const month = `${i + 1}`.padStart(2, '0');
      return getMonth(id, `${year}${month}01`).then((list) => {
        return processor.write(list);
      }).catch((err) => {
        log.log('err', err);
      });
    });
  }, Promise.resolve());
}
