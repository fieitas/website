/* eslint-disable no-unused-expressions */
import { decorateIcons, loadCSS } from '../../scripts/lib-franklin.js';
import { span } from '../../scripts/dom-helpers.js';

const AUTOSCROLL_INTERVAL = 7000;

/**
 * Clone a carousel item
 * @param {Element} item carousel item to be cloned
 * @returns the clone of the carousel item
 */
function cloneItem(item) {
  const clone = item.cloneNode(true);
  clone.classList.add('clone');
  clone.classList.remove('selected');

  return clone;
}

export class Carousel {
  constructor(block, config, data) {
    // Set defaults
    this.cssFiles = [];
    this.defaultStyling = false;
    this.dotButtons = true;
    this.navButtons = true;
    this.infiniteScroll = true;
    this.autoScroll = true; // only available with infinite scroll
    this.autoScrollInterval = AUTOSCROLL_INTERVAL;
    this.currentIndex = 0;
    this.cardRenderer = this;
    // this is primarily controlled by CSS,
    // but we need to know then intention for scrolling pourposes
    this.visibleItems = [
      {
        items: 1,
        condition: () => true,
      },
    ];

    // Set information
    this.block = block;
    this.data = data || [...block.children];

    // Will be replaced after rendering, if available
    this.navButtonLeft = null;
    this.navButtonRight = null;

    // Apply overwrites
    Object.assign(this, config);

    if (this.defaultStyling) {
      this.cssFiles.push('/blocks/carousel/carousel.css');
    }
  }

  getBlockPadding() {
    if (!this.blockStyle) {
      this.blockStyle = window.getComputedStyle(this.block);
    }
    return +(this.blockStyle.getPropertyValue('padding-left').replace('px', ''));
  }

  updateCounterText(newIndex = this.currentIndex) {
    this.currentIndex = newIndex;
    if (this.counter) {
      const items = this.block.querySelectorAll('.carousel-item:not(.clone)');
      const counterTextBlock = this.block.parentElement.querySelector('.carousel-counter .carousel-counter-text p');
      const pageCounter = `${this.currentIndex + 1} / ${items.length}`;
      counterTextBlock.innerHTML = this.counterText ? `${this.counterText} ${pageCounter}` : pageCounter;
    }
  }

  /**
     * Scroll the carousel to the next item
     */
  nextItem() {
    !this.infiniteScroll && this.navButtonRight && this.navButtonRight.classList.remove('disabled');
    !this.infiniteScroll && this.navButtonLeft && this.navButtonLeft.classList.remove('disabled');

    const dotButtons = this.block.parentNode.querySelectorAll('.carousel-dot-button');
    const items = this.block.querySelectorAll('.carousel-item:not(.clone)');
    const selectedItem = this.block.querySelector('.carousel-item.selected');

    let index = [...items].indexOf(selectedItem);
    index = index !== -1 ? index : 0;

    const newIndex = (index + 1) % items.length;
    const newSelectedItem = items[newIndex];
    if (newIndex === 0 && !this.infiniteScroll) {
      return;
    }

    const currentVisibleItems = this.visibleItems
      .filter((e) => !e.condition || e.condition())[0].items;
    if (newIndex === items.length - currentVisibleItems && !this.infiniteScroll) {
      this.navButtonRight.classList.add('disabled');
    }

    if (newIndex === 0) {
      // create the ilusion of infinite scrolling
      newSelectedItem.parentNode.scrollTo({
        top: 0,
        left: (
          newSelectedItem.previousElementSibling.offsetLeft
                    - this.getBlockPadding()
                    - this.block.offsetLeft
        ),
      });
    }

    newSelectedItem.parentNode.scrollTo({
      top: 0,
      left: newSelectedItem.offsetLeft - this.getBlockPadding() - this.block.offsetLeft,
      behavior: 'smooth',
    });

    items.forEach((item) => item.classList.remove('selected'));
    dotButtons.forEach((item) => item.classList.remove('selected'));
    newSelectedItem.classList.add('selected');
    if (dotButtons && dotButtons.length !== 0) {
      dotButtons[newIndex].classList.add('selected');
    }

    this.updateCounterText(newIndex);
  }

  /**
     * Scroll the carousel to the previous item
     */
  prevItem() {
    !this.infiniteScroll && this.navButtonRight && this.navButtonRight.classList.remove('disabled');
    !this.infiniteScroll && this.navButtonLeft && this.navButtonLeft.classList.remove('disabled');

    const dotButtons = this.block.parentNode.querySelectorAll('.carousel-dot-button');
    const items = this.block.querySelectorAll('.carousel-item:not(.clone)');
    const selectedItem = this.block.querySelector('.carousel-item.selected');

    let index = [...items].indexOf(selectedItem);
    index = index !== -1 ? index : 0;
    const newIndex = index - 1 < 0 ? items.length - 1 : index - 1;
    const newSelectedItem = items[newIndex];

    if (newIndex === items.length - 1 && !this.infiniteScroll) {
      return;
    }

    if (newIndex === 0 && !this.infiniteScroll) {
      this.navButtonLeft.classList.add('disabled');
    }

    if (newIndex === items.length - 1) {
      // create the ilusion of infinite scrolling
      newSelectedItem.parentNode.scrollTo({
        top: 0,
        left: (
          newSelectedItem.nextElementSibling.offsetLeft
                    - this.getBlockPadding()
                    - this.block.offsetLeft
        ),
      });
    }

    newSelectedItem.parentNode.scrollTo({
      top: 0,
      left: newSelectedItem.offsetLeft - this.getBlockPadding() - this.block.offsetLeft,
      behavior: 'smooth',
    });

    items.forEach((item) => item.classList.remove('selected'));
    dotButtons.forEach((item) => item.classList.remove('selected'));
    newSelectedItem.classList.add('selected');
    if (dotButtons && dotButtons.length !== 0) {
      dotButtons[newIndex].classList.add('selected');
    }

    this.updateCounterText(newIndex);
  }

  /**
     * Create clone items at the beginning and end of the carousel
     * to give the appearance of infinite scrolling
     */
  createClones() {
    if (this.block.children.length < 2) return;

    const initialChildren = [...this.block.children];

    this.block.lastChild.after(cloneItem(initialChildren[0]));
    this.block.lastChild.after(cloneItem(initialChildren[1]));

    this.block.firstChild.before(cloneItem(initialChildren[initialChildren.length - 1]));
    this.block.firstChild.before(cloneItem(initialChildren[initialChildren.length - 2]));
  }

  /**
     * Create left and right arrow navigation buttons
     */
  createNavButtons(parentElement) {
    const buttonLeft = document.createElement('button');
    buttonLeft.classList.add('carousel-nav-left');
    buttonLeft.ariaLabel = 'Scroll to previous item';
    buttonLeft.append(span({ class: 'icon icon-chevron-left' }));
    buttonLeft.addEventListener('click', () => {
      clearInterval(this.intervalId);
      this.prevItem();
    });

    if (!this.infiniteScroll) {
      buttonLeft.classList.add('disabled');
    }

    const buttonRight = document.createElement('button');
    buttonRight.classList.add('carousel-nav-right');
    buttonRight.ariaLabel = 'Scroll to next item';
    buttonRight.append(span({ class: 'icon icon-chevron-right' }));
    buttonRight.addEventListener('click', () => {
      clearInterval(this.intervalId);
      this.nextItem();
    });

    [buttonLeft, buttonRight].forEach((navButton) => {
      navButton.classList.add('carousel-nav-button');
      parentElement.append(navButton);
    });

    this.navButtonLeft = buttonLeft;
    this.navButtonRight = buttonRight;
  }

  /**
     * Adds event listeners for touch UI swiping
     */
  addSwipeCapability() {
    if (this.block.swipeCapabilityAdded) {
      return;
    }

    let touchstartX = 0;
    let touchendX = 0;

    this.block.addEventListener('touchstart', (e) => {
      touchstartX = e.changedTouches[0].screenX;
    }, { passive: true });

    this.block.addEventListener('touchend', (e) => {
      touchendX = e.changedTouches[0].screenX;
      if (Math.abs(touchendX - touchstartX) < 10) {
        return;
      }

      if (touchendX < touchstartX) {
        clearInterval(this.intervalId);
        this.nextItem();
      }

      if (touchendX > touchstartX) {
        clearInterval(this.intervalId);
        this.prevItem();
      }
    }, { passive: true });
    this.block.swipeCapabilityAdded = true;
  }

  setInitialScrollingPosition() {
    const scrollToSelectedItem = () => {
      const item = this.block.querySelector('.carousel-item.selected');
      item.parentNode.scrollTo({
        top: 0,
        left: item.offsetLeft - this.getBlockPadding() - this.block.offsetLeft,
      });
    };

    const section = this.block.closest('.section');

    const observer = new MutationObserver((mutationList) => {
      mutationList.forEach((mutation) => {
        if (mutation.type === 'attributes'
                    && mutation.attributeName === 'data-section-status'
                    && section.attributes.getNamedItem('data-section-status').value === 'loaded') {
          scrollToSelectedItem();
          observer.disconnect();
        }
      });
    });

    observer.observe(section, { attributes: true });

    // just in case the mutation observer didn't work
    setTimeout(scrollToSelectedItem, 700);

    // ensure that we disconnect the observer
    // if the animation has kicked in, we for sure no longer need it
    setTimeout(() => { observer.disconnect(); }, AUTOSCROLL_INTERVAL);
  }

  createDotButtons() {
    const buttons = document.createElement('div');
    buttons.className = 'carousel-dot-buttons';
    const items = [...this.block.children];

    items.forEach((item, i) => {
      const button = document.createElement('button');
      button.ariaLabel = `Scroll to item ${i + 1}`;
      button.classList.add('carousel-dot-button');
      if (i === this.currentIndex) {
        button.classList.add('selected');
      }

      button.addEventListener('click', () => {
        clearInterval(this.intervalId);
        this.block.scrollTo({
          top: 0,
          left: item.offsetLeft - this.getBlockPadding(),
          behavior: 'smooth',
        });
        [...buttons.children].forEach((r) => r.classList.remove('selected'));
        items.forEach((r) => r.classList.remove('selected'));
        button.classList.add('selected');
        item.classList.add('selected');
        this.updateCounterText(i);
      });
      buttons.append(button);
    });
    this.block.parentElement.append(buttons);
  }

  /*
  clearSelected removes all the selected css class from the slides
   */
  clearSelected() {
    const items = this.block.querySelectorAll('.carousel-item.selected');
    items.forEach((item) => {
      item.classList.remove('selected');
    });
  }

  /*
  navigateTo navigates to the item with numbered index
   */
  navigateTo(index) {
    const item = this.block.querySelector(`.carousel-index-${index}`);
    this.block.scrollTo({
      top: 0,
      left: item.offsetLeft - this.getBlockPadding(),
    });
    this.clearSelected();
    item.classList.add('selected');

    // remove or add disabled class
    if (index !== 0) {
      this.navButtonLeft.classList.remove('disabled');
    }

    if (index === 0) {
      this.navButtonLeft.classList.add('disabled');
    }

    if (index === this.data.length - 1) {
      this.navButtonRight.classList.add('disabled');
    }
  }

  /*
    * Changing the default rendering may break carousels that rely on it
    * (e.g. CSS might not match anymore)
    */
  // eslint-disable-next-line class-methods-use-this
  renderItem(item) {
    // create the carousel content
    const columnContainer = document.createElement('div');
    columnContainer.classList.add('carousel-item-columns-container');

    const columns = [
      document.createElement('div'),
      document.createElement('div'),
    ];

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
    return columnContainer;
  }

  async render() {
    // copy carousel styles to the wrapper too
    this.block.parentElement.classList.add(
      ...[...this.block.classList].filter((item, idx) => idx !== 0 && item !== 'block'),
    );

    let defaultCSSPromise;
    if (Array.isArray(this.cssFiles) && this.cssFiles.length > 0) {
      // add default carousel classes to apply default CSS
      defaultCSSPromise = new Promise((resolve) => {
        this.cssFiles.forEach((cssFile) => {
          loadCSS(cssFile, (e) => resolve(e));
        });
      });
      this.block.parentElement.classList.add('carousel-wrapper');
      this.block.classList.add('carousel');
    }

    this.block.innerHTML = '';
    this.data.forEach((item, i) => {
      const itemContainer = document.createElement('div');
      itemContainer.className = 'carousel-item';
      itemContainer.classList.add(`carousel-index-${i}`);
      if (i === this.currentIndex) {
        itemContainer.classList.add('selected');
      }

      let renderedItem = this.cardRenderer.renderItem(item);
      renderedItem = Array.isArray(renderedItem) ? renderedItem : [renderedItem];
      renderedItem.forEach((renderedItemElement) => {
        itemContainer.appendChild(renderedItemElement);
      });
      this.block.appendChild(itemContainer);
    });

    // create autoscrolling animation
    this.autoScroll && this.infiniteScroll
        && (this.intervalId = setInterval(() => { this.nextItem(); }, this.autoScrollInterval));
    this.dotButtons && this.createDotButtons();
    this.navButtons && this.createNavButtons(this.block.parentElement);
    this.infiniteScroll && this.createClones();
    this.addSwipeCapability();
    this.infiniteScroll && this.setInitialScrollingPosition();
    this.cssFiles && (await defaultCSSPromise);
    await decorateIcons(this.block.parentNode);
  }
}

/**
 * Create and render default carousel.
 * Best practice: Create a new block and call the function, instead using or modifying this.
 * @param {Element}  block        required - target block
 * @param {Object}   config       optional - config object for
 * customizing the rendering and behaviour
 * @param {Array}    data         optional - a list of data elements.
 *  either a list of objects or a list of divs.
 *  if not provided: the div children of the block are used
 */
export async function createCarousel(block, config, data) {
  const carousel = new Carousel(block, config, data);
  await carousel.render();
  return carousel;
}
