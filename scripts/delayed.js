// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';
import { PrintMeteoHeader } from '../blocks/header/header.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
PrintMeteoHeader();
