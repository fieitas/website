/**
 * checks if a sidebar is configured in the metadata, if so
 * modified the main dom and decorates the sidebar
 * @param {Element} block The sidebar block element
 */
import { loadBlocks } from '../../scripts/lib-franklin.js';
import { decorateMain } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const navPath = block.dataset.path;
  const resp = await fetch(`${navPath}.plain.html`);

  if (resp.ok) {
    const html = await resp.text();
    const div = document.createElement('div');
    div.id = 'sidebar';
    div.classList.add('fade-in-fast');
    div.innerHTML = html;
    decorateMain(div);
    await loadBlocks(div);
    block.append(div);
  }
}
