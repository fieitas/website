import { readBlockConfig, decorateIcons } from '../../scripts/lib-franklin.js';
import { div } from '../../scripts/dom-helpers.js';
import globals from '../../scripts/globals.js';

/**
 * Gets the footer path and extract the language
 * @returns {string}
 */
const UNSET_LANG = 'unset';
function getLang() {
  const path = window.location.pathname;
  const parts = path.split('/');
  if (parts.length >= 2) {
    const language = parts[1];
    if (language) {
      return `${language}`;
    }
  }
  return UNSET_LANG;
}

/**
 * Gets the footer path for the current language or defaults to /unsetfooter
 * @returns {string}
 */
function getLocalFooterPath() {
  const lang = getLang();
  if (lang === UNSET_LANG) {
    return '/unsetfooter';
  }
  return `/${lang}/${globals.SECTION_URL}/footer`;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  // fetch footer content
  const footerPath = cfg.footer || getLocalFooterPath();
  const resp = await fetch(`${footerPath}.plain.html`, window.location.pathname.endsWith('/footer') ? { cache: 'reload' } : {});

  if (resp.ok) {
    const html = await resp.text();

    // decorate footer DOM
    const footer = document.createElement('div');
    footer.innerHTML = html;

    const image = div({ class: 'footer logo' }, footer.querySelector(':scope > div p'));
    const links = div({ class: 'footer links' }, footer.querySelector(':scope > div ul'));

    const footerFull = div({ class: 'footer container' }, image, links);

    footer.innerHTML = '';
    footer.append(footerFull);

    decorateIcons(footer);
    block.append(footer);
  }
}
