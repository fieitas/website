export default async function decorate(block) {
  // locate main section
  const firstDivAfterAccordion = block.querySelector('.covid-19-accordion > div:first-child > div');

  // locate remaining sections
  const remainingDivsAfterAccordion = block.querySelectorAll('.covid-19-accordion > div:not(:first-child) > div');

  // Extract image
  const pictureElement = firstDivAfterAccordion.querySelector('picture');

  // Extract all content up to the buttons
  const elementsAfterPicture = Array.from(firstDivAfterAccordion.children).slice(1);
  const firstLinkIndex = elementsAfterPicture.findIndex((element) => element.className === 'button-container');
  const elementsBeforeFirstLink = elementsAfterPicture.slice(0, firstLinkIndex);

  let extractedInnerHTML = '';
  elementsBeforeFirstLink.forEach((element) => {
    extractedInnerHTML += element.outerHTML;
  });

  // Extract all links
  const linksArray = firstDivAfterAccordion.querySelectorAll('a');

  // Remove original source elements
  firstDivAfterAccordion.innerHTML = '';

  // Create new structure and append extracted content
  const container = document.createElement('div');
  container.classList.add('container');

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

  const links = document.createElement('div');
  links.classList.add('links');

  // Add extracted links as buttons
  linksArray.forEach((link) => {
    const button = document.createElement('button');
    button.textContent = link.textContent;
    // eslint-disable-next-line no-return-assign
    button.onclick = () => window.location.href = link.href;
    links.appendChild(button);
  });

  const details = document.createElement('div');
  details.classList.add('details');
  remainingDivsAfterAccordion.forEach((div) => {
    details.appendChild(div);
  });

  // clean original source elements
  remainingDivsAfterAccordion.innerHTML = '';

  container.appendChild(banner);
  container.appendChild(links);
  container.appendChild(details);

  // Replace original source elements with new structure
  firstDivAfterAccordion.appendChild(container);
}
