/**
 * Creates a banner with the extracted leading text and the picture element
 * @param pictureElement
 * @param extractedInnerHTML
 * @returns {HTMLDivElement}
 */
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
 * Creates a div with the extracted links from the first row of document
 * @param linksArray
 * @returns {HTMLDivElement}
 */
function createLinks(linksArray) {
  const links = document.createElement('div');
  links.classList.add('links');

  linksArray.forEach((link, index) => {
    const button = document.createElement('button');
    button.textContent = link.textContent;

    if (index === 0) {
      setupFirstButton(button);
    } else {
      // eslint-disable-next-line no-return-assign
      button.onclick = () => (window.location.href = link.href);
    }

    links.appendChild(button);
  });

  return links;
}

/**
 * Sets up the first button to expand the accordion and adds a close button to the accordion
 * @param button
 */
function setupFirstButton(button) {
  button.setAttribute('id', 'expand-accordion');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', 'details');
  button.addEventListener('click', () => {
    const accordion = document.querySelector('.covid-19-accordion .container .details');
    const existingDivider = accordion.querySelector('.custom-divider');

    if (!existingDivider) {
      const newDiv = createDividerWithCloseButton();
      accordion.prepend(newDiv);
    }

    accordion.classList.toggle('expanded');
    if (accordion.classList.contains('expanded')) {
      button.setAttribute('aria-expanded', 'true');
    } else {
      button.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * Creates dividers with close buttons for the expanded content of accordion
 * @returns {HTMLDivElement}
 */
function createDividerWithCloseButton() {
  const newDiv = document.createElement('div');
  newDiv.classList.add('covid-19-accordion', 'custom-divider');

  const hr = document.createElement('hr');
  newDiv.appendChild(hr);

  const closeButton = document.createElement('button');
  closeButton.classList.add('covid-19-accordion', 'close-button');
  // empty as we fill in from after pseudo element
  closeButton.innerHTML = '';
  closeButton.addEventListener('click', () => {
    const accordion = document.querySelector('.covid-19-accordion .container .details');
    const button = document.querySelector('#expand-accordion');

    accordion.classList.remove('expanded');
    button.setAttribute('aria-expanded', 'false');
  });
  newDiv.appendChild(closeButton);

  return newDiv;
}


function createDetails(remainingDivsAfterAccordion) {
  const details = document.createElement('div');
  details.classList.add('details');
  details.setAttribute('aria-labelledby', 'expand-accordion');
  remainingDivsAfterAccordion.forEach((div) => {
    details.appendChild(div);
  });

  return details;
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
  container.appendChild(createLinks(linksArray));
  container.appendChild(createDetails(remainingDivsAfterAccordion));

  firstDivAfterAccordion.appendChild(container);
}
