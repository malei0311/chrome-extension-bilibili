import { find } from '../../utils/helpers.js';

function inject() {
  document.body.insertAdjacentHTML(
    'beforeend',
    `
      <div id="__bili_container_wrap__" class="__bili_container_wrap__">
        <div id="__bili_container__" class="__bili_container__">
        </div>
      </div>
      <div id="__bili_btn_open__" class="__bili_btn__ __bili_btn_open__"></div>
    `
  );
  find('#__bili_btn_open__').then((els) => {
    const el = els[0];
    const openClass = '__bili_container_open__';
    el.addEventListener(
      'click',
      () => {
        const container = el.previousElementSibling;
        if (container.classList.contains(openClass)) {
          container.classList.remove(openClass);
          el.classList.remove(openClass);
        } else {
          container.classList.add(openClass);
          el.classList.add(openClass);
        }
      },
      false
    );
  });
}

export default function init() {
  inject();
}
