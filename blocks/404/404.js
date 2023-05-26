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
