import { getMetadata } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  const resp = await fetch('covid19.plain.html');
  if (resp.ok) {
    const html = await resp.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const classNames = ['icon','intro', 'info', 'links'];
    const divs = doc.querySelectorAll('div:nth-of-type(-n+4)');

    // create map with classNames and divs
    const map = new Map(classNames.slice(0, divs.length)
      .map((className, index) => [className, divs[index]]));
    const container = document.createElement('div');
    container.classList.add('container');

    // generate banner
    const banner = document.createElement('div');
    banner.setAttribute('class', 'banner');
    container.appendChild(banner);

    // eslint-disable-next-line no-restricted-syntax
    for (const className of ['intro', 'icon']) {
      const div = map.get(className);
      div.classList.add(`${className}`);
      div.setAttribute('class', className);
      banner.append(div);
    }
    // const buttons = document.createElement('div');
    // buttons.setAttribute('class', 'buttons');
    //
    // container.appendChild(banner);





    // divs.forEach((div, i) => {
    //   div.classList.add(`${classNames[i]}`);
    //   container.append(div);
    // });
    block.append(container);
  }
}
