/**
 * Creates a banner with the extracted leading text and the picture element
 * @param pictureElement
 * @param extractedInnerHTML
 * @returns {HTMLDivElement}
 */
import { button, div, domEl } from '../../scripts/dom-helpers.js';

function createBanner(pictureElement, elementsBeforeFirstLink) {
  return (
    div({ class: 'banner' },
      div({ class: 'info' },
        ...elementsBeforeFirstLink,
      ),
      div({ class: 'icon' },
        pictureElement,
      ),
    )
  );
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
function firstButton(originaLink, block) {
  function toggleAccordion(event) {
    const accordion = block.querySelector('.covid-19-accordion .container .details');
    const existingDivider = accordion.querySelector('.custom-divider');
    if (!existingDivider) {
      const newDiv = createDividerWithCloseButton(block);
      accordion.prepend(newDiv);
    }
    accordion.classList.toggle('expanded');
    if (accordion.classList.contains('expanded')) {
      event.currentTarget.setAttribute('aria-expanded', 'true');
    } else {
      event.currentTarget.setAttribute('aria-expanded', 'false');
    }
  }

  return button(
    {
      id: 'expand-accordion',
      'aria-expanded': 'false',
      'aria-controls': 'details',
      onclick: toggleAccordion,
    },
    originaLink.textContent,
  );
}

/**
 * Creates a div with the extracted links from the first row of document
 * @param linksArray
 * @param block
 * @returns {HTMLDivElement}
 */
function createLinks(linksArray, block) {
  const [firstLink, ...restOfLinks] = linksArray;

  return (
    div({ class: 'links' },
      firstButton(firstLink, block),
      ...restOfLinks,
    )
  );
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

  const linksArray = firstDivAfterAccordion.querySelectorAll('a');
  firstDivAfterAccordion.innerHTML = '';

  const container = div({ class: 'container' });

  container.appendChild(createBanner(pictureElement, elementsBeforeFirstLink));
  container.appendChild(createLinks(linksArray, block));
  container.appendChild(createDetails(remainingDivsAfterAccordion));
  firstDivAfterAccordion.appendChild(container);
}
