import { find } from '../../utils/helpers.js';
import { exportCsv } from './fans.js';

function injectDownloadBtn(year) {
  find('#__bili_container__').then((els) => {
    const el = els[0];
    el.insertAdjacentHTML(
      'afterbegin',
      `
        <div class="__bili_container_item__ __bili_container_item_flex__">
          <input class="__download_fans_input__" type="text" value="${year}"/>
          <div id="__download_fans__" class="__bili_btn__ __btn_download_fans__">
            <span class="__loading__"></span>
            <span class="__text__">下载粉丝</span>
          </div>
        </div>
      `
    );
  }).then(() => {
    find('#__download_fans__').then((els) => {
      const el = els[0];
      el.addEventListener('click', () => {
        const runningClass = '__running__';
        if (el.classList.contains(runningClass)) {
          return;
        }
        el.classList.add(runningClass);
        const inputYear = parseInt(el.previousElementSibling.value, 10) || year;
        exportCsv(inputYear).then(() => {
          el.classList.remove(runningClass);
        });
      }, false);
    });
  })
}

function curYear() {
  return new Date().getFullYear();
}

export function init(year = curYear()) {
  injectDownloadBtn(year);
}
