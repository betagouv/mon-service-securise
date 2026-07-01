import { AdaptateurPdfTypst } from '../src/adaptateurs/adaptateurPdf.typst.js';
import fs from 'node:fs';

const adaptateur = new AdaptateurPdfTypst();

const buffer = await adaptateur.genereSyntheseSecurite();

fs.writeFileSync('pocTypst.pdf', buffer, 'utf8');
console.log('done');

// node --import tsx --watch-path=./poc-pdf --watch-path=src poc-pdf/feedback.ts
