export default async function decorate(block) {
  /* make div clickable with the URL from the first link */
  function clickHandler(event) {
    const buttonLink = event.currentTarget.querySelector('a');
    window.location.href = buttonLink.getAttribute('href');
  }

  block.addEventListener('click', clickHandler);
}
