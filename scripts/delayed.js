// eslint-disable-next-line import/no-cycle
import { loadCSS, sampleRUM } from './lib-franklin.js';
import { PrintMeteoHeader } from '../blocks/header/header.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

loadCSS(`${window.hlx.codeBasePath}/styles/weather/weather-icons.min.css`);
// add more delayed functionality here
PrintMeteoHeader();
