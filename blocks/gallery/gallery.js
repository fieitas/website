

const CLASS_IMAGE_CONTAINER ="gallery-image-container"
const CLASS_IMAGE ="gallery-image"
const CLASS_CAPTION ="gallery-caption"
const CLASS_MISSING_IMAGE ="gallery-missing-image"

export class Gallery {

    constructor(block, config) {
        // Set defaults
        this.cssFiles = [];
        this.defaultStyling = false;

        // status
        this.isFullScreen = false;
        this.FSC = null;

        // set data
        this.block = block;
    }

    /*
    applyStyle navigates the gallery dom and applies styling where needed
     */
    async applyStyle(){
        const childNodes = this.block.childNodes;
        let imgId = 0
        for (let i = 0; i < childNodes.length; i++) {
            const childNode = childNodes[i];

            if (childNode.nodeType === Node.ELEMENT_NODE) {
                const picEle = childNode.querySelector('picture');
                // hide cards that don't contain an image
                if (picEle === null){
                    childNode.classList.add(CLASS_MISSING_IMAGE);
                }else {
                    childNode.classList.add(CLASS_IMAGE_CONTAINER);

                    const id = imgId;
                    picEle.onclick = () => {
                        this.viewImage(id);
                    };
                    imgId++;

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
                        const caption = childNode.querySelector('p:not(.gallery-image)');
                        caption.classList.add(CLASS_CAPTION)
                    }
                }
            }
        }
    }

    /*
    creates the DOM elements used in the full screen mode
     */
    async generateFullScreenDom(){

    }

    viewImage(id){
        this.goFullScreen()


        console.log(id)
    }

    async goFullScreen(){
        if( !this.isFullScreen){
            this.isFullScreen = true

            const body =  document.querySelector('body');
            body.classList.add("overflow")
            body.prepend(this.FSC)

        }
    }

    async exitFullScreen(){
        if( this.isFullScreen){
            this.isFullScreen = false

            const body =  document.querySelector('body');
            body.classList.remove("overflow")
            this.FSC.remove()
        }
    }

    /*
    Pre-generates a DOM that will contain the image carousel
     */
    async generateFSC(){
        const el = document.createElement("div")
        el.id="gallery-full-screen"
        el.onclick = () => {
            this.exitFullScreen()
        }
        this.FSC = el
    }


    async render() {
        this.applyStyle()
        this.generateFSC()



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
