/* eslint-disable no-unused-expressions */
import {createCarousel} from './carousel.base.js'

export default async function decorate(block){
    const cfg ={
        navButtons: true,
        dotButtons: true,
        infiniteScroll: true,
        autoScroll: false,
    }
    await createCarousel(block,cfg)
}