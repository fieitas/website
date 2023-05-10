import { getMetadata, toCamelCase } from '../../scripts/lib-franklin.js';

const meta = {
  title: encodeURIComponent(document.title),
  description: encodeURIComponent(getMetadata('description')),
  url: `${window.location.origin}${window.location.pathname}`,
};

const socialDetails = function (networkName) {
  // eslint-disable-next-line default-case
  switch (networkName) {
    case 'mail':
      return {
        type: 'mail',
        label: 'mail',
        href: `mailto:?subject=${meta.title}&amp;body=${meta.description}%0D%0A%0D%0A${meta.url}`,
        icon: 'mail',
      };
    case 'twitter':
      return {
        type: 'twitter',
        label: 'twitter',
        href: `https://twitter.com/intent/tweet?url=${meta.url}&amp;text=${meta.title}`,
        icon: 'twitter',
      };
    case 'facebook':
      return {
        type: 'facebook',
        label: 'facebook',
        href: `https://www.facebook.com/sharer/sharer.php?u=${meta.url}`,
        icon: 'facebook',
      };
  }
};

// function buildMarkup(element, placeholders) {
//   element.classList.add('share');
//   element.classList.add('general-article-stage__share');
//   socials(placeholders).forEach((social) => {
//     const a = document.createElement('a');
//     a.setAttribute('data-type', social.type);
//     a.setAttribute('aria-label', social.label);
//     a.setAttribute('class', 'plain-link share__link');
//     a.setAttribute('target', '_blank');
//     a.setAttribute('href', social.href);
//     a.setAttribute('title', social.label);
//     a.innerHTML = `<span class="icon icon-${social.icon}"></span>`;
//     element.appendChild(a);
//   });
// }

export default async function decorate(block) {
  const socials = [];
  block.querySelectorAll('li').forEach((element) => {
    const network = element.textContent.toLowerCase();
    socials.push(socialDetails(network));
  });
  console.log(socials);
}
