import { find } from '../../../utils/helpers.js';
import log from '../../../utils/log.js';
import { exportCsv, exportMonthCsv } from './exporter.js';
import { injectMsger, sendToPageWithRet, ACTIONS } from '../../../utils/msg.js';

const Btn = {
  gen({ id = '', klass = '', text = '下载' } = {}) {
    return `
      <div id="${id}" class="__bili_btn__ ${klass}">
        <span class="__loading__"></span>
        <span class="__text__">${text}</span>
      </div>
    `;
  },
  _click(el, cb) {
    const runningClass = '__running__';
    if (el.classList.contains(runningClass)) {
      return;
    }
    el.classList.add(runningClass);
    let p = cb && cb(el);
    if (!(p && typeof p.then === 'function')) {
      p = Promise.resolve()
    }
    p.finally(() => {
      el.classList.remove(runningClass);
    });
  },
  onClick(el, cb) {
    el.addEventListener('click', () => {
      Btn._click(el, cb);
    }, false);
  },
};

function injectDownloadBtn(id, cb, opts) {
  const _hasInjected = hasInjected(id);
  if (_hasInjected) {
    log.log(`id: ${id} has been injected`);
    return;
  }
  log.log(`id: ${id} is injected`);
  return find('.select-bar')
    .then((els) => {
      const el = els[0];
      el.insertAdjacentHTML('beforeend', Btn.gen({
        id,
        klass: id,
        ...opts,
      }));
    })
    .then(() => {
      find(`#${id}`).then((els) => {
        const el = els[0];
        Btn.onClick(el, () => {
          if (cb) {
            return cb();
          }
        });
      });
    });
}

async function getParams() {
  await injectMsger();
  const el = '.my-room-gift-list';
  const data = await sendToPageWithRet({
    action: ACTIONS.get('GET_EL_VUE_INS'),
    el,
    pick: [
      'coinTypeLabel',
      'coinTypes',
      'giftLabel',
      'gifts',
      'uname',
      'pageSize',
      'beginTime',
    ],
  });
  if (!data.ins || !data.ins.length || !data.ins[0]) {
    return Promise.reject(new Error(`el: ${el} has not vue instance`));
  }
  const {
    coinTypeLabel = '',
    coinTypes = [],
    giftLabel = '',
    gifts = [],
    uname = '',
    pageSize = 20,
    beginTime,
  } = data.ins[0];
  const type = coinTypes.find((item) => {
    return item.label === coinTypeLabel;
  }).Ym;
  const gift = gifts.find((item) => {
    return item.label === giftLabel;
  });
  return {
    page_num: 1,
    page_size: pageSize,
    coin_type: !type ? 0 : (type === 'gold' ? 1 : 2 ),
    gift_id: gift ? gift.Ym : '',
    begin_time: beginTime,
    uname,
  };
}

function hasInjected(id) {
  return document.querySelector(`#${id}`);
}

export async function inject() {
  injectDownloadBtn('__btn_gift_list_download__', () => {
    return getParams().then(exportCsv).catch((err) => {
      alert(`出错了：${err.message}`);
    });
  }, {
    text: '下载当天',
  });
  injectDownloadBtn('__btn_gift_list_download_all__', () => {
    return getParams().then(exportMonthCsv).catch((err) => {
      alert(`出错了：${err.message}`);
    });
  }, {
    klass: '__btn_gift_list_download__',
    text: '下载当月',
  });
}
