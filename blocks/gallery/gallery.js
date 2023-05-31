import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { CarouselFullscreen } from '../carousel/carousel.fullscreen.js';

const CLASS_IMAGE_CONTAINER = 'gallery-image-container';
const CLASS_IMAGE = 'gallery-image';
const CLASS_CAPTION = 'gallery-caption';
const CLASS_MISSING_IMAGE = 'gallery-missing-image';

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
            this.carousel.goFullScreen(id);
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

  async render() {
    this.applyStyle();
    this.carousel = new CarouselFullscreen(this.block);
    await this.carousel.generateFullScreenView();
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
