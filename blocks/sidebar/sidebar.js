/**
 * checks if a sidebar is configured in the metadata, if so
 * modified the main dom and decorates the sidebar
 * @param {Element} block The sidebar block element
 */
export default async function decorate(block) {
  const navPath = block.dataset.path;
  const resp = await fetch(`${navPath}.plain.html`);

  if (resp.ok) {
    const html = await resp.text();
    const div = document.createElement('div');
    div.id = 'sidebar';
    div.innerHTML = html;
    block.append(div);
  }
}
