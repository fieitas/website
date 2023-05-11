import { decorateIcons, getMetadata } from '../../scripts/lib-franklin.js';
import { a, span } from '../../scripts/dom-helpers.js';

const meta = {
  title: encodeURIComponent(document.title),
  description: encodeURIComponent(getMetadata('description')),
  url: `${window.location.origin}${window.location.pathname}`,
};

const socialNetworks = {
  mail: {
    type: 'mail',
    label: 'mail',
    hrefTemplate: `mailto:?subject=${meta.title}&body=${meta.description} ${meta.url}`,
    icon: 'mail',
  },
  twitter: {
    type: 'twitter',
    label: 'twitter',
    hrefTemplate: `https://twitter.com/intent/tweet?url=${meta.url}&text=${meta.title}`,
    icon: 'twitter',
  },
  facebook: {
    type: 'facebook',
    label: 'facebook',
    hrefTemplate: `https://www.facebook.com/sharer/sharer.php?u=${meta.url}`,
    icon: 'facebook',
  },
  whatsapp: {
    type: 'whatsapp',
    label: 'whatsapp',
    hrefTemplate: `https://wa.me/?text=${meta.title}%20${meta.url}`,
    icon: 'whatsapp',
  },
  telegram: {
    type: 'telegram',
    label: 'telegram',
    hrefTemplate: `https://t.me/share/url?url=${meta.url}&text=${meta.title}`,
    icon: 'telegram',
  },
};

function socialDetails(networkName) {
  const network = socialNetworks[networkName];
  const titlePrefix = `Camping Os Fieitas - ${meta.title}`;

  if (!network) {
    return null;
  }

  return {
    ...network,
    href: network.hrefTemplate
      .replace(`${meta.title}`, `${titlePrefix}`)
      .replace(`${meta.description}`, `${meta.description}`)
      .replace(`${meta.url}`, encodeURIComponent(meta.url)),
  };
}

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
