import { createCarousel } from '../carousel/carousel.base.js';
import { createOptimizedPicture, decorateIcons } from '../../scripts/lib-franklin.js';

const CLASS_IMAGE_CONTAINER = 'gallery-image-container';
const CLASS_IMAGE = 'gallery-image';
const CLASS_CAPTION = 'gallery-caption';
const CLASS_MISSING_IMAGE = 'gallery-missing-image';

const ID_FS = 'gallery-full-screen';
const CLASS_FS_CONTAINER = 'gallery-fs-container';

export class Gallery {
  constructor(block) {
    // status
    this.isFullScreen = false;
    this.FSC = null;
    this.carousel = null;

    // set data
    this.block = block;
  }

  /*
    applyStyle navigates the gallery dom and applies styling where needed
     */
  async applyStyle() {
    const imgs = this.block.querySelectorAll('img');
    if (imgs.length === 1) {
      imgs.forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '650' }])));
    } else {
      imgs.forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '300' }])));
    }

    const { childNodes } = this.block;
    let imgId = 0;

    /* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
    for (let i = 0; i < childNodes.length; i++) {
      const childNode = childNodes[i];

      if (childNode.nodeType === Node.ELEMENT_NODE) {
        const picEle = childNode.querySelector('picture');
        // hide cards that don't contain an image
        if (picEle === null) {
          childNode.classList.add(CLASS_MISSING_IMAGE);
        } else {
          childNode.classList.add(CLASS_IMAGE_CONTAINER);

          const id = imgId;
          picEle.onclick = () => {
            this.goFullScreen(id);
          };
          imgId += 1;

          const parentPic = picEle.parentNode;
          if (parentPic.nodeName === 'DIV') {
            // only image in the container
            const pElement = document.createElement('p');
            pElement.classList.add(CLASS_IMAGE);
            parentPic.prepend(pElement);
            pElement.appendChild(picEle);
          } else {
            // we assume the parrent is a p element, and we have more elements in the div
            parentPic.classList.add(CLASS_IMAGE);
            const caption = childNode.querySelector('p:not(.gallery-image)');
            caption.classList.add(CLASS_CAPTION, `${CLASS_CAPTION}-custom`);
          }
        }
      }
    }
  }

  async goFullScreen(id) {
    if (!this.isFullScreen) {
      this.isFullScreen = true;

      const body = document.querySelector('body');
      body.classList.add('overflow');

      const main = document.querySelector('main');
      main.prepend(this.FSC);

      onkeydown = (event) => {
        if (event.key === 'Escape') {
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

  /*
    Pre-generates a DOM that will contain the image carousel
     */
  async generateFSC() {
    const el = document.createElement('div');
    el.id = ID_FS;
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
    container.classList.add(CLASS_FS_CONTAINER);
    el.appendChild(container);

    const carousel = document.createElement('div');
    container.appendChild(carousel);

    const images = this.findImages();

    const cfg = {
      navButtons: true,
      dotButtons: true,
      infiniteScroll: false,
      autoScroll: false,
      defaultStyling: true,
      renderItem(item) {
        const img = item.querySelector('img');
        const picture = createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 768px)', width: '1600' }, { width: '700' }]);

        // create the carousel content
        const columnContainer = document.createElement('div');
        columnContainer.classList.add('carousel-item-columns-container');

        const column = document.createElement('div');
        column.classList.add('carousel-item-column');
        picture.classList.add('carousel-item-image');

        column.appendChild(picture);
        columnContainer.appendChild(column);

        return columnContainer;
      },

    };
    const car = await createCarousel(carousel, cfg, images);

    this.FSC = el;
    this.carousel = car;
  }

  /*
    findImages navigates the gallery dom and returns a list of images to be used in the
    overlay carousel
    */
  findImages() {
    const { childNodes } = this.block;
    const items = [];

    /* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
    for (let i = 0; i < childNodes.length; i++) {
      const childNode = childNodes[i];

      if (childNode.nodeType === Node.ELEMENT_NODE) {
        const picEle = childNode.querySelector('picture');
        // hide cards that don't contain an image
        if (picEle != null) {
          items.push(picEle);
        }
      }
    }
    return items;
  }

  async render() {
    this.applyStyle();
    await this.generateFSC();
  }
}

export default async function decorate(block) {
  const cfg = {
    infiniteScroll: true,
    autoScroll: false,
  };

  const gallery = new Gallery(block, cfg);
  await gallery.render();
  return gallery;
}
