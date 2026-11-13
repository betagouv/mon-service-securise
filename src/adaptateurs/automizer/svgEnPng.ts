import { Resvg } from '@resvg/resvg-js';
import { readdirSync } from 'node:fs';
import path from 'node:path';

const DOSSIER_POLICES = 'src/vuesPdf/fonts';

const polices = readdirSync(DOSSIER_POLICES).map((fichier) =>
  path.join(DOSSIER_POLICES, fichier)
);

export const svgEnPng = (svg: string, largeur: number): Buffer =>
  new Resvg(svg, {
    fitTo: { mode: 'width', value: largeur },
    font: {
      fontFiles: polices,
      loadSystemFonts: false,
      defaultFontFamily: 'Marianne',
    },
  })
    .render()
    .asPng();
