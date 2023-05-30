import { createOptimizedPicture, decorateIcons, loadCSS } from '../../scripts/lib-franklin.js';
import { createCarousel } from './carousel.base.js';

// Given a image it will return the src file without query parameters
function extractImageName(clickedImage) {
  const fullSrc = clickedImage.src;
  // Extract the file name from the full src
  const fileNameWithParameters = fullSrc.split('/')
    .pop();
  // Remove the  query parameters
  const fileName = fileNameWithParameters.split('?')[0];
  return fileName;
}

// filter function to match the image name with the file name
function byFileName(fileName) {
  return (picture) => {
    const imgName = extractImageName(picture.querySelector('img'));
    return imgName === fileName;
  };
}

export class CarouselFullscreen {
  constructor(block, cfg = {}) {
    this.isFullScreen = cfg.isFullScreen || false;
    this.FSC = cfg.FSC || null;
    this.carousel = cfg.carousel || null;
    this.smallCarousel = cfg.smallCarousel || null;
    this.block = block;
    this.images = this.findImages();
    this.fromSmallCarousel = cfg.fromSmallCarousel || false;
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

    this.images = this.findImages();

    const cfg = {
      navButtons: true,
      dotButtons: true,
      infiniteScroll: false,
      autoScroll: false,
      defaultStyling: true,
      renderItem(item) {
        const img = item.querySelector('img');
        const picture = createOptimizedPicture(img.src, img.alt, false, [
          { media: '(min-width: 768px)', width: '1600' },
          { width: '700' },
        ]);

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
    this.carousel = await createCarousel(carousel, cfg, this.images);
    this.FSC = el;
    return el;
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

  async exitFullScreen() {
    if (this.isFullScreen) {
      this.isFullScreen = false;
      const body = document.querySelector('body');
      body.classList.remove('overflow');
      document.removeEventListener('keydown', this.exitFullScreen);
      if (this.fromSmallCarousel) {
        const gotoIndex = this.findSmallCarrouselIndex();
        this.smallCarousel.navigateTo(gotoIndex);
      }
      this.FSC.remove();
    }
  }

  // matches the current image name displayed in the fullscreen carousel
  // with the image name in the small carousel and returns the small carousel index
  // this is required because the carrousel index differs depending on how it is generated
  // eg: clones for infinite scroll
  findSmallCarrouselIndex() {
    const currentImage = this.carousel.block.querySelector('#gallery-full-screen .selected img');
    const fileName = extractImageName(currentImage);
    const pictureArray = Array.from(this.smallCarousel.block.querySelectorAll('picture'));
    const index = pictureArray.findIndex(byFileName(fileName));
    const nestedImage = pictureArray[index].querySelector('img').getAttribute('src');
    const w = this.smallCarousel.block.querySelector(`img[src="${nestedImage}"]`);
    // extract the index from the class name, usually carousel-index-{index}
    const gotoIndex = w.closest('div.carousel-item').classList[1].split('-').pop();
    return gotoIndex;
  }

  async goFullScreen(targetImage) {
    if (!this.isFullScreen) {
      this.isFullScreen = true;

      const body = document.querySelector('body');
      body.classList.add('overflow');

      const main = document.querySelector('main');
      main.prepend(await this.generateFullScreenView());

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
      let index = targetImage;
      if (this.fromSmallCarousel) {
        // find index
        index = this.carousel.data.findIndex(byFileName(targetImage));
      }
      this.carousel.navigateTo(index);
    }
  }

  // renderItem is a callback function that is called passed to "small" carousel
  // and adds the click event listener to the images
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

    columns.forEach((column) => {
      column.classList.add('carousel-item-column');
      columnContainer.appendChild(column);
    });

    // go full screen when an image is clicked
    columnContainer.addEventListener('click', (e) => {
      const clickedElement = e.target;
      // if clicked element or its closest ancestor is an img, handle the event
      if (clickedElement.tagName === 'IMG' || clickedElement.closest('img')) {
        // Extract the src of the image
        const fileName = extractImageName(clickedElement);
        this.goFullScreen(fileName);
      }
    });

    return columnContainer;
  }

  async render(cfg) {
    this.smallCarousel = await createCarousel(
      this.block,
      { ...cfg, renderItem: this.renderItem.bind(this) });
  }
}

export async function createFullScreenCarousel(block, config) {
  // gallery has the CSS needed for the carousel
  loadCSS('/blocks/gallery/gallery.css');
  const carousel = new CarouselFullscreen(block, config);
  carousel.render();
}
