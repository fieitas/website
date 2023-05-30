import { loadBlocks } from '../../scripts/lib-franklin.js';
import globals from '../../scripts/globals.js';
import { decorateMain } from '../../scripts/scripts.js';

/**
 * Gets the nav path and extract the language
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

function getLocalPath() {
  const lang = getLang();
  if (lang === UNSET_LANG) {
    return '/404';
  }
  return `/${lang}/${globals.SECTION_URL}/404`;
}

export default async function decorate(block) {
  const navPath = getLocalPath();
  let resp = await fetch(`${navPath}.plain.html`);
  // use default 404 if not able to find in the language folder
  if (!resp.ok) {
    resp = await fetch(`/${globals.DEFAULT_LANG}/${globals.SECTION_URL}/404.plain.html`);
  }
  if (resp.ok) {
    const html = await resp.text();
    const div = document.createElement('div');
    div.innerHTML = html;
    decorateMain(div);
    await loadBlocks(div);
    block.replaceWith(div);
  }
}
