import * as inject from './inject.js';
import initContainer from '../common/container.js';

export function init() {
  initContainer();
  inject.init();
}
