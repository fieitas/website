

const CLASS_IMAGE_CONTAINER ="gallery-image-container"
const CLASS_IMAGE ="gallery-image"
const CLASS_MISSING_IMAGE ="gallery-missing-image"

export class Gallery {
    constructor(block, config) {
        // Set defaults
        this.cssFiles = [];
        this.defaultStyling = false;

        // set data
        this.block = block;

    }

    /*
    applyStyle navigates the gallery dom and applies styling where needed
     */
    applyStyle(){
        const childNodes = this.block.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            const childNode = childNodes[i];

            if (childNode.nodeType === Node.ELEMENT_NODE) {
                const picEle = childNode.querySelector('picture');
                // hide cards that don't contain an image
                if (picEle === null){
                    childNode.classList.add(CLASS_MISSING_IMAGE);
                }else {
                    childNode.classList.add(CLASS_IMAGE_CONTAINER);
                    const parentPic = picEle.parentNode
                    if (parentPic.nodeName === 'DIV') {
                        // only image in the container
                        const pElement = document.createElement('p');
                        pElement.classList.add(CLASS_IMAGE)
                        parentPic.prepend(pElement)
                        pElement.appendChild(picEle)
                    }else{
                        // we assume the parrent is a p element, and we have more elements in the div
                        parentPic.classList.add(CLASS_IMAGE)
                    }
                }
            }
        }
    }



    async render() {
        this.applyStyle()
        // // copy carousel styles to the wrapper too
        // this.block.parentElement.classList.add(
        //     ...[...this.block.classList].filter((item, idx) => idx !== 0 && item !== 'block'),
        // );
        //
        // let defaultCSSPromise;
        // if (Array.isArray(this.cssFiles) && this.cssFiles.length > 0) {
        //     // add default carousel classes to apply default CSS
        //     defaultCSSPromise = new Promise((resolve) => {
        //         this.cssFiles.forEach((cssFile) => {
        //             loadCSS(cssFile, (e) => resolve(e));
        //         });
        //     });
        //     this.block.parentElement.classList.add('carousel-wrapper');
        //     this.block.classList.add('carousel');
        // }
        //
        // this.block.innerHTML = '';
        // this.data.forEach((item, i) => {
        //     const itemContainer = document.createElement('div');
        //     itemContainer.className = 'carousel-item';
        //     if (i === this.currentIndex) {
        //         itemContainer.classList.add('selected');
        //     }
        //
        //     let renderedItem = this.cardRenderer.renderItem(item);
        //     renderedItem = Array.isArray(renderedItem) ? renderedItem : [renderedItem];
        //     renderedItem.forEach((renderedItemElement) => {
        //         itemContainer.appendChild(renderedItemElement);
        //     });
        //     this.block.appendChild(itemContainer);
        // });
        //
        // // create autoscrolling animation
        // this.autoScroll && this.infiniteScroll
        // && (this.intervalId = setInterval(() => { this.nextItem(); }, this.autoScrollInterval));
        // this.dotButtons && this.createDotButtons();
        // this.counter && this.createCounter();
        // this.navButtons && this.createNavButtons(this.block.parentElement);
        // this.infiniteScroll && this.createClones();
        // this.addSwipeCapability();
        // this.infiniteScroll && this.setInitialScrollingPosition();
        // this.cssFiles && (await defaultCSSPromise);
        // decorateIcons(this.block.parentNode);
    }

}

export default async function decorate(block) {
    const cfg = {
        infiniteScroll: true,
        autoScroll: false,
    };

    const gallery = new Gallery(block, cfg,         );
    await gallery.render();
    return gallery;
}
