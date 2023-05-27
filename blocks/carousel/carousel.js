/* eslint-disable no-unused-expressions */
import { createCarousel } from './carousel.base.js';
import { decorateIcons, loadCSS } from '../../scripts/lib-franklin.js';

export class CarouselFullScreen {
  constructor(block) {
    this.isFullScreen = false;
    this.FSC = null;
    this.carousel = null;
    // set data
    this.block = block;
  }

  async generateFullScreenView() {
    const el = document.createElement('div');
    el.id = 'gallery-full-screen';
    el.classList.add('custom');

    const close = document.createElement('div');
    close.classList.add('close');
    close.onclick = () => {
      this.exitFullScreen();
    };
    const closeIcon = document.createElement('span');
    closeIcon.classList.add('icon', 'icon-close');

    close.appendChild(closeIcon);
    el.appendChild(close);

    await decorateIcons(close);

    const container = document.createElement('div');
    container.classList.add('gallery-fs-container');
    el.appendChild(container);

    const carousel = document.createElement('div');
    container.appendChild(carousel);
    this.FSC = el;
    return el;
  }

  async exitFullScreen() {
    if (this.isFullScreen) {
      this.isFullScreen = false;

      const body = document.querySelector('body');
      body.classList.remove('overflow');
      document.removeEventListener('keydown', this.exitFullScreen);

      // this.carousel.navigateTo(0)

      this.FSC.remove();
    }
  }

  async goFullScreen(id) {
    if (!this.isFullScreen) {
      this.isFullScreen = true;

      const body = document.querySelector('body');
      body.classList.add('overflow');

      const main = document.querySelector('main');
      main.prepend(await this.generateFullScreenView());
      // copy the existing carousel into the fullscreen gallery container
      const runningCarrousel = document.querySelector('.carousel-wrapper');
      const container = document.querySelector('.gallery-fs-container');

      const childElements = Array.from(runningCarrousel.children);
      childElements.forEach((item) => {
        console.log(item);
        // clone the item
        const cloneItem = item.cloneNode(true);
        // remove carousel extra classes to get fullscreen styling
        if (cloneItem.classList.contains('carousel')) {
          cloneItem.className = '';
          cloneItem.classList.add('carousel');
        }
        container.appendChild(cloneItem);
      });

      onkeydown = (event) => {
        if (event.key === 'Escape') {
          console.log('exit full screen');
          this.exitFullScreen();
        }
        if (event.key === 'ArrowRight' || event.key === ' ') {
          this.carousel.nextItem();
        }
        if (event.key === 'ArrowLeft') {
          this.carousel.prevItem();
        }
      };
      this.carousel.navigateTo(id);
    }
  }

  renderItem(item) {
    // create the carousel content
    const columnContainer = document.createElement('div');
    columnContainer.classList.add('carousel-item-columns-container');

    const columns = [document.createElement('div')];

    const itemChildren = [...item.children];
    itemChildren.forEach((itemChild, idx) => {
      if (itemChild.querySelector('img')) {
        itemChild.classList.add('carousel-item-image');
      } else {
        itemChild.classList.add('carousel-item-text');
      }
      columns[idx].appendChild(itemChild);
    });

    columns.forEach((column, i) => {
      column.classList.add('carousel-item-column');
      column.addEventListener('click', () => {
        this.goFullScreen(i);
      });
      columnContainer.appendChild(column);
    });
    return columnContainer;
  }

  async render(cfg) {
    this.carousel = await createCarousel(
      this.block,
      { ...cfg, renderItem: this.renderItem.bind(this) });
  }
}

async function createFullScreenCarousel(block) {
  // gallery has the CSS needed for the carousel
  loadCSS('/blocks/gallery/gallery.css');
  const carousel = new CarouselFullScreen(block);
  carousel.render();
}

export default async function decorate(block) {
  const cfg = {
    navButtons: true,
    dotButtons: true,
    infiniteScroll: true,
    autoScroll: false,
  };
  if (block.classList.contains('fullscreen')) {
    await createFullScreenCarousel(block, cfg);
  } else {
    await createCarousel(block, cfg);
  }
}
