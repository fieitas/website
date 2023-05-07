/**
 * Creates a banner with the extracted leading text and the picture element
 * @param pictureElement
 * @param extractedInnerHTML
 * @returns {HTMLDivElement}
 */
import { button, div, domEl } from '../../scripts/dom-helpers.js';

function createBanner(pictureElement, extractedInnerHTML) {
  const banner = document.createElement('div');
  banner.classList.add('banner');

  const info = document.createElement('div');
  info.classList.add('info');
  info.innerHTML = extractedInnerHTML;
  banner.appendChild(info);

  const icon = document.createElement('div');
  icon.classList.add('icon');
  icon.innerHTML = pictureElement.outerHTML;
  banner.appendChild(icon);

  return banner;
}

/**
 * Creates dividers with close buttons for the expanded content of accordion
 * @param block
 * @returns {HTMLDivElement}
 */
function createDividerWithCloseButton(block) {
  function closeAccordion() {
    const accordion = block.querySelector('.container .details');
    const closeButton = block.querySelector('#expand-accordion');

    accordion.classList.remove('expanded');
    closeButton.setAttribute('aria-expanded', 'false');
  }
  return (
    div(
      { class: 'covid-19-accordion custom-divider' },
      domEl('hr'),
      button({ class: 'covid-19-accordion close-button', onclick: closeAccordion }),
    )
  );
}

/**
 * Sets up the first button to expand the accordion and adds a close button to the accordion
 * @param button
 * @param block
 */
function setupFirstButton(expandButton, block) {
  function toggleAccordion() {
    const accordion = block.querySelector('.covid-19-accordion .container .details');
    const existingDivider = accordion.querySelector('.custom-divider');
    if (!existingDivider) {
      const newDiv = createDividerWithCloseButton(block);
      accordion.prepend(newDiv);
    }
    accordion.classList.toggle('expanded');
    if (accordion.classList.contains('expanded')) {
      expandButton.setAttribute('aria-expanded', 'true');
    } else {
      expandButton.setAttribute('aria-expanded', 'false');
    }
  }
  expandButton.setAttribute('id', 'expand-accordion');
  expandButton.setAttribute('aria-expanded', 'false');
  expandButton.setAttribute('aria-controls', 'details');
  expandButton.addEventListener('click', toggleAccordion);
}

/**
 * Creates a div with the extracted links from the first row of document
 * @param linksArray
 * @param block
 * @returns {HTMLDivElement}
 */
function createLinks(linksArray, block) {
  const links = document.createElement('div');
  links.classList.add('links');

  linksArray.forEach((link, index) => {
    const linkButton = document.createElement('button');
    linkButton.textContent = link.textContent;

    if (index === 0) {
      setupFirstButton(button, block);
    } else {
      // eslint-disable-next-line no-return-assign
      linkButton.onclick = () => (window.location.href = link.href);
    }

    links.appendChild(linkButton);
  });

  return links;
}

function createDetails(remainingDivsAfterAccordion) {
  return (
    div(
      { class: 'details', 'aria-labelledby': 'expand-accordion' },
      ...remainingDivsAfterAccordion,
    ));
}

export default async function decorate(block) {
  const firstDivAfterAccordion = block.querySelector('.covid-19-accordion > div:first-child > div');
  const remainingDivsAfterAccordion = block.querySelectorAll('.covid-19-accordion > div:not(:first-child) > div');
  const pictureElement = firstDivAfterAccordion.querySelector('picture');

  const elementsAfterPicture = Array.from(firstDivAfterAccordion.children).slice(1);
  const firstLinkIndex = elementsAfterPicture.findIndex((element) => element.className === 'button-container');
  const elementsBeforeFirstLink = elementsAfterPicture.slice(0, firstLinkIndex);

  let extractedInnerHTML = '';
  elementsBeforeFirstLink.forEach((element) => {
    extractedInnerHTML += element.outerHTML;
  });

  const linksArray = firstDivAfterAccordion.querySelectorAll('a');
  firstDivAfterAccordion.innerHTML = '';

  const container = document.createElement('div');
  container.classList.add('container');

  container.appendChild(createBanner(pictureElement, extractedInnerHTML));
  container.appendChild(createLinks(linksArray, block));
  container.appendChild(createDetails(remainingDivsAfterAccordion));
  firstDivAfterAccordion.appendChild(container);
}
