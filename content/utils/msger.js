import { onContent, sendToContent, ACTIONS } from './msg.js';

onContent(({ data = {}, id } = {}) => {
  let ret = {};
  switch(data.action) {
    case ACTIONS.get('GET_OID'):
      ret = {
        id: window.__INITIAL_STATE__ && window.__INITIAL_STATE__.aid,
      };
      break;
    case ACTIONS.get('GET_EL_VUE_INS'):
      const el = document.querySelectorAll(data.el);
      ret = {
        ins: Array.from(el).map((item) => {
          const ins = item.__vue__;
          if (!ins) {
            return undefined;
          }
          const pick = data.pick || [];
          return pick.reduce((p, c) => {
            p[c] = ins[c] || undefined;
            return p;
          }, {});
        }),
      };
      break;
    default:
  }
  sendToContent(ret, id);
}, true);