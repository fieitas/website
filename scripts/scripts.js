import {
  buildBlock,
  decorateBlock,
  decorateBlocks,
  decorateButtons,
  decorateIcons,
  decorateSections,
  getMetadata,
  loadBlock,
  loadBlocks,
  loadCSS,
  loadFooter,
  loadHeader,
  sampleRUM,
  waitForLCP,
} from './lib-franklin.js';

const LCP_BLOCKS = ['hero']; // add your LCP blocks to the list

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
// TODO: AFAIK we don't need the hero block
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  // document.documentElement.lang = 'en';
  // decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
export function addFavIcon(href) {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/svg+xml';
  link.href = href;
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.parentElement.replaceChild(link, existingLink);
  } else {
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

let memoizedPrices = null;
const pricesURL = '/datos.json?sheet=prices';
const priceCurrencySymbol = '€';
const pricePlaceholderPrefix = 'precio ';

/**
 * replaces pricing placeholders found in the blocks, placeholders match the format
 * ||precio <item>||, where <item> is the item to get the price of.
 * prices are fetched from the pricesURL and cached in a memoizedPrices Map.
 * @param blocks
 */
export async function replacePricePlaceHolders(blocks) {
  // Initialize the prices map and a flag for fetch errors
  let fetchError = false;

  if (memoizedPrices === null) {
    try {
      // Fetch the JSON data
      const response = await fetch(pricesURL);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { data } = await response.json();

      // Convert the data into a map for easy lookup
      memoizedPrices = new Map(data.map((item) => [item.tipo, item.precio]));
    } catch (error) {
      fetchError = true;
      memoizedPrices = new Map(); // so we don't try to fetch again
    }
  }

  // Define our placeholder regex
  const placeholderRegex = new RegExp(`\\|\\|(${pricePlaceholderPrefix}.+?)\\|\\|`, 'g');

  // Process each block
  blocks.forEach((block) => {
    // Select all text nodes in the document
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    let node;

    // Walk through each text node
    // eslint-disable-next-line no-cond-assign
    while (node = walker.nextNode()) {
      // Replace each instance of the placeholder with the corresponding price
      // extractedText contains the value of the first capturing group defined in the regex

      // eslint-disable-next-line no-loop-func
      node.textContent = node.textContent.replace(placeholderRegex, (match, extractedText) => {
        // If there was a fetch error, replace all placeholders with 'N/A'
        if (fetchError) return 'N/A';

        if (extractedText.startsWith(pricePlaceholderPrefix)) {
          // eslint-disable-next-line no-param-reassign
          extractedText = extractedText.slice(pricePlaceholderPrefix.length);
        } else {
          return match;
        }

        // Return the corresponding price or 'N/A' if the price does not exist
        const price = memoizedPrices.get(extractedText);
        // format price w/ currency symbol
        return price ? `${price}${priceCurrencySymbol}` : 'N/A';
      });
    }
  });

  // Return the modified blocks
  return blocks;
}

/**
 * Loads the sidebar placeholder into the dom
 * @param {Element} element the containing item where the section will be added at the end
 */
export async function loadSidebar(element) {
  const sidebarMeta = getMetadata('sidebar');
  if (sidebarMeta !== '') {
    element.classList.add('has-sidebar');

    const sidebarSection = document.createElement('div');
    sidebarSection.classList.add('section');

    const sidebarBlock = buildBlock('sidebar', '');
    sidebarBlock.dataset.path = new URL(sidebarMeta).pathname;

    const numSections = element.children.length;
    element.style = `grid-template-rows: repeat(${numSections}, auto);`;

    sidebarSection.append(sidebarBlock);

    decorateBlock(sidebarBlock);
    element.append(sidebarSection);
    loadBlock(sidebarBlock).then(() => {
      replacePricePlaceHolders([sidebarBlock]);
    });
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);
  await replacePricePlaceHolders([main]);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadSidebar(doc.querySelector('main'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadCSS(`${window.hlx.codeBasePath}/styles/weather/weather-icons.min.css`);
  addFavIcon(`${window.hlx.codeBasePath}/styles/favicon.png`);
  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 1600);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
