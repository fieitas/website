import { getMetadata, decorateIcons } from '../../scripts/lib-franklin.js';
import { div } from '../../scripts/dom-helpers.js';
import globals from '../../scripts/globals.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = expanded || isDesktop.matches ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('role');
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }
  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
}

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

/**
 * Gets the nav path for the current language or defaults to /unsetnav
 * @returns {string}
 */
function getLocalNavPath() {
  const lang = getLang();
  if (lang === UNSET_LANG) {
    return '/unsetnav';
  }
  return `/${lang}/${globals.SECTION_URL}/nav`;
}

const meteoId = 'meteo';

export async function PrintMeteoHeader() {
  const dataPath = '/datos.json?sheet=weather';
  const resp = await fetch(dataPath);

  // use default nav if no nav is configured for the current location
  if (resp.ok) {
    const json = await resp.text();
    const obj = JSON.parse(json);

    let icon = '';
    let location = '';
    let temp = '';

    /* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
    for (let i = 0; i < obj.data.length; i++) {
      if (obj.data[i].campo === 'iconoCielo') {
        switch (obj.data[i].valor) {
          case '101': // despejado
            icon = '<i class="wi wi-day-sunny"></i>';
            break;
          case '103': // nuves y claros
            icon = '<i class="wi wi-day-cloudy"></i>';
            break;
          case '105': // cubierto
            icon = '<i class="wi wi-cloudy"></i>';
            break;
          case '107': // chuvascos
            icon = '<i class="wi wi-day-rain"></i>';
            break;
          case '111': // lluvia
            icon = '<i class="wi wi-rain"></i>';
            break;
          case '201': // noche despejada
            icon = '<i class="wi wi-night-clear"></i>';
            break;
          case '211': // noche lluvia
            icon = '<i class="wi wi-night-rain"></i>';
            break;
          default:
        }
      }

      if (obj.data[i].campo === 'concello') {
        location = obj.data[i].valor;
      }

      if (obj.data[i].campo === 'valorTemp') {
        temp = `${obj.data[i].valor}º`;
      }
    }

    let country = '';

    switch (getLang()) {
      case 'es':
      case 'gl':
        country = 'España';
        break;
      case 'fr':
        country = 'Espagne';
        break;
      default:
        country = 'Spain';
    }

    const meteoContent = div({ class: 'fade-in' });
    meteoContent.innerHTML = `${icon} ${location}, ${country} ${temp}`;
    document.querySelector(`#${meteoId}`).append(meteoContent);
  }
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // fetch nav content
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta).pathname : getLocalNavPath();
  let resp = await fetch(`${navPath}.plain.html`);

  // use default nav if no nav is configured for the current location
  if (!resp.ok) {
    resp = await fetch('/unsetnav.plain.html');
  }

  if (resp.ok) {
    const html = await resp.text();

    // decorate nav DOM
    const nav = document.createElement('nav');
    nav.id = 'nav';
    nav.innerHTML = html;

    const classes = ['brand', 'sections'];
    classes.forEach((c, i) => {
      const section = nav.children[i];
      if (section) section.classList.add(`nav-${c}`);
    });

    const navSections = nav.querySelector('.nav-sections');
    if (navSections) {
      navSections.querySelector('ul').setAttribute('role', 'menu');
      navSections.querySelectorAll(':scope > ul > li').forEach((navSection) => {
        navSection.setAttribute('role', 'menuitem');
        if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
        navSection.addEventListener('click', () => {
          if (isDesktop.matches) {
            const expanded = navSection.getAttribute('aria-expanded') === 'true';
            toggleAllNavSections(navSections);
            navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
          }
        });
      });
    }

    // add meteo information
    const meteo = div({ id: meteoId, class: ['meteo', 'nav-meteo'] });
    nav.prepend(meteo);

    // hamburger for mobile
    const hamburger = document.createElement('div');
    hamburger.classList.add('nav-hamburger');
    hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
        <span class="nav-hamburger-icon"></span>
      </button>`;
    hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
    nav.prepend(hamburger);
    nav.setAttribute('aria-expanded', 'false');
    // prevent mobile nav behavior on window resize
    toggleMenu(nav, navSections, isDesktop.matches);
    isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

    decorateIcons(nav);
    const navWrapper = document.createElement('div');
    navWrapper.className = 'nav-wrapper';
    navWrapper.append(nav);
    block.append(navWrapper);
  }
}
