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
    const config = { ...cfg, fromSmallCarousel: true };
    await createFullScreenCarousel(block, config);
  } else {
    await createCarousel(block, cfg);
  }
}
