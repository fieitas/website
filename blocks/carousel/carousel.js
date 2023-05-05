/* eslint-disable no-unused-expressions */
import {createCarousel} from './carousel.base.js'




/**
 * Custom card style config and rendering of carousel items.
 */
// export function renderCardItem(item) {
//     item.classList.add('card');
//     item
//         .querySelectorAll('.button-container a')
//         .forEach((a) => a.append(span({ class: 'icon icon-chevron-right-outline', 'aria-hidden': true })));
//     decorateIcons(item);
//     return item;
// }
//
// const cardStyleConfig = {
//     cssFiles: ['/blocks/carousel/carousel-cards.css'],
//     navButtons: true,
//     dotButtons: false,
//     infiniteScroll: true,
//     autoScroll: false,
//     visibleItems: [
//         {
//             items: 1,
//             condition: () => window.screen.width < 768,
//         },
//         {
//             items: 2,
//             condition: () => window.screen.width < 1200,
//         }, {
//             items: 3,
//         },
//     ],
//     renderItem: renderCardItem,
// };

// export default async function decorate(block) {
//     // cards style carousel
//     const useCardsStyle = block.classList.contains('cards');
//     if (useCardsStyle) {
//         await createCarousel(block, [...block.children], cardStyleConfig);
//         return;
//     }
//
//     // use the default carousel
//     await createCarousel(block);
// }



export default async function decorate(block){

    const cfg ={
    // cssFiles: ['/blocks/carousel/carousel-cards.css'],
    navButtons: false,
    dotButtons: false,
    infiniteScroll: true,
    autoScroll: true,
    visibleItems: [
        {
            items: 1,
            condition: () => window.screen.width < 768,
        },
        {
            items: 2,
            condition: () => window.screen.width < 1200,
        }, {
            items: 3,
        },
    ],
    // renderItem: renderCardItem,<
    }
    // console.log("carousel")
    await createCarousel(block,cfg)
}