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

export default async function decorate(block) {
    const lang = getLang()
    console.log(lang)


}

// <!--      <svg viewBox="1 0 38 18" class="error-number">-->
// <!--        <text x="0" y="17">404</text>-->
// <!--      </svg>-->
// <!--      <h2 class="error-message">Page Not Found</h2>-->
// <!--      <p class="button-container">-->
// <!--        <a href="/" class="button secondary error-button-home">Go home</a>-->
// <!--      </p>-->