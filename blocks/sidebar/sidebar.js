import {getMetadata, decorateIcons, buildBlock, decorateBlock, loadBlock} from '../../scripts/lib-franklin.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

// function closeOnEscape(e) {
//   if (e.code === 'Escape') {
//     const nav = document.getElementById('nav');
//     const navSections = nav.querySelector('.nav-sections');
//     const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
//     if (navSectionExpanded && isDesktop.matches) {
//       // eslint-disable-next-line no-use-before-define
//       toggleAllNavSections(navSections);
//       navSectionExpanded.focus();
//     } else if (!isDesktop.matches) {
//       // eslint-disable-next-line no-use-before-define
//       toggleMenu(nav, navSections);
//       nav.querySelector('button').focus();
//     }
//   }
// }

// function openOnKeydown(e) {
//   const focused = document.activeElement;
//   const isNavDrop = focused.className === 'nav-drop';
//   if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
//     const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
//     // eslint-disable-next-line no-use-before-define
//     toggleAllNavSections(focused.closest('.nav-sections'));
//     focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
//   }
// }

// function focusNavSection() {
//   document.activeElement.addEventListener('keydown', openOnKeydown);
// }

// /**
//  * Toggles all nav sections
//  * @param {Element} sections The container element
//  * @param {Boolean} expanded Whether the element should be expanded or collapsed
//  */
// function toggleAllNavSections(sections, expanded = false) {
//   sections.querySelectorAll('.nav-sections > ul > li').forEach((section) => {
//     section.setAttribute('aria-expanded', expanded);
//   });
// }

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
// function toggleMenu(nav, navSections, forceExpanded = null) {
//   const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
//   const button = nav.querySelector('.nav-hamburger button');
//   document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
//   nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
//   toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
//   button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
//   // enable nav dropdown keyboard accessibility
//   const navDrops = navSections.querySelectorAll('.nav-drop');
//   if (isDesktop.matches) {
//     navDrops.forEach((drop) => {
//       if (!drop.hasAttribute('tabindex')) {
//         drop.setAttribute('role', 'button');
//         drop.setAttribute('tabindex', 0);
//         drop.addEventListener('focus', focusNavSection);
//       }
//     });
//   } else {
//     navDrops.forEach((drop) => {
//       drop.removeAttribute('role');
//       drop.removeAttribute('tabindex');
//       drop.removeEventListener('focus', focusNavSection);
//     });
//   }
//   // enable menu collapse on escape keypress
//   if (!expanded || isDesktop.matches) {
//     // collapse menu on escape press
//     window.addEventListener('keydown', closeOnEscape);
//   } else {
//     window.removeEventListener('keydown', closeOnEscape);
//   }
// }

/**
 * decorates the sidebar
 * @param {Element} block The sidebar block element
 */
export default async function decorate(block) {
  // fetch nav content
  const navMeta = getMetadata('sidebar');

  if (navMeta !== ""){
    const navPath = new URL(navMeta).pathname;
    const resp = await fetch(`${navPath}.plain.html`);

    if (resp.ok) {
      const html = await resp.text();

      // decorate nav DOM
      const div = document.createElement('div');
      div.id = 'sidebar';
      div.innerHTML = html;


      block.append(div);
    }
  }



  // const navPath = navMeta ? new URL(navMeta).pathname : '/sidebar';
  // const resp = await fetch(`${navPath}.plain.html`);
  //
  // if (resp.ok) {
  //   const html = await resp.text();
  //
  //   // decorate nav DOM
  //   const div = document.createElement('div');
  //   div.id = 'sidebar';
  //   console.log(html)
  //   div.innerHTML = html;
  //
  //
  //   block.append(div);
  //
  //
  //
  // }
}

export function createSidebarSection(placeholder){
  const div = document.createElement('section');
  div.id = 'sidebar';
  div.innerHTML = html;
}

export function loadSidebar(sidebar) {
  const sidebarBlock = buildBlock('sidebar', '');
  sidebar.append(sidebarBlock);
  decorateBlock(sidebarBlock);
  return loadBlock(sidebarBlock);
}