import { decorateIcons, getMetadata } from '../../scripts/lib-franklin.js';
import { a, div, span } from '../../scripts/dom-helpers.js';

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
        href: `mailto:?subject=${meta.title}&body=${meta.description} ${meta.url}`,
        icon: 'mail',
      };
    case 'twitter':
      return {
        type: 'twitter',
        label: 'twitter',
        href: `https://twitter.com/intent/tweet?url=${meta.url}&text=${meta.title}`,
        icon: 'twitter',
      };
    case 'facebook':
      return {
        type: 'facebook',
        label: 'facebook',
        href: `https://www.facebook.com/sharer/sharer.php?u=${meta.url}`,
        icon: 'facebook',
      };
    case 'whatsapp':
      return {
        type: 'whatsapp',
        label: 'whatsapp',
        href: `https://wa.me/?text=${meta.title}%20${meta.url}`,
        icon: 'whatsapp',
      };
    case 'telegram':
      return {
        type: 'telegram',
        label: 'telegram',
        href: `https://t.me/share/url?url=${meta.url}&text=${meta.title}`,
        icon: 'telegram',
      };
  }
};

function buildShortened(block, socials) {
  const allLinks = [];
  socials.forEach((social) => {
    const currentLink = a({
      class: 'plain-link share__link',
      href: social.href,
      target: '_blank',
      title: social.label,
      'data-type': social.type,
      'aria-label': social.label,
    },
    span({ class: `icon icon-${social.icon}` }));
    allLinks.push(currentLink);
  });
  return allLinks;
}

export default async function decorate(block) {
  const socials = [];
  block.querySelectorAll('li').forEach((element) => {
    const network = element.textContent.toLowerCase();
    socials.push(socialDetails(network));
  });
  block.innerHTML = '';
  block.append(...buildShortened(block, socials));
  await decorateIcons(block);
}
