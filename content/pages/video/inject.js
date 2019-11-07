import { find } from '../../utils/helpers.js';
import { exportCommentCsv } from './comment.js';

function injectDownloadBtn(oid) {
  document.body.insertAdjacentHTML(
    'beforeend',
    `
      <div id="__download_comment__" class="__btn_download_comment__">
        <span class="__loading__"></span>
        <span class="__text__">下载<br>评论</span>
      </div>
    `
  );
  find('#__download_comment__').then((els) => {
    const el = els[0];
    el.addEventListener('click', () => {
      const runningClass = '__running__';
      if (el.classList.contains(runningClass)) {
        return;
      }
      el.classList.add(runningClass);
      exportCommentCsv(oid).then(() => {
        el.classList.remove(runningClass);
      });
    }, false);
  });
}

export function init(oid) {
  injectDownloadBtn(oid);
}
