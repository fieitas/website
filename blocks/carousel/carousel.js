/* eslint-disable no-unused-expressions */
import { createCarousel } from './carousel.base.js';
import { createFullScreenCarousel } from './carousel.fullscreen.js';

export default async function decorate(block) {
  const cfg = {
    navButtons: true,
    dotButtons: true,
    infiniteScroll: false,
    autoScroll: false,
  };
  if (block.classList.contains('fullscreen')) {
    await createFullScreenCarousel(block, cfg);
  } else {
    await createCarousel(block, cfg);
  }
}
