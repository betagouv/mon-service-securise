import { creeRadar, enAttributPoints, Point } from '../../geometrie/radar.js';
import { IndiceCyberDeCategorie } from '../../modeles/objetsPowerpoint/indiceCyber.js';
import { auDixieme } from './texte.js';

const LARGEUR = 560;
const HAUTEUR = 300;
const TAILLE_DU_RADAR = 240;
const ECART_DES_LIBELLES = 12;
const TAILLE_DES_LIBELLES = 15;
const TAILLE_DES_GRADUATIONS = 11;

const echappe = (texte: string) =>
  texte.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const decalageVerticalDuLibelle = (sousLeCentre: boolean, point: Point) => {
  if (sousLeCentre) return TAILLE_DES_LIBELLES;
  const surUnCote = Math.abs(point[1] - TAILLE_DU_RADAR / 2) < 1;
  return surUnCote ? TAILLE_DES_LIBELLES * 0.35 : 0;
};

export const svgRadarIndiceCyber = (
  categories: IndiceCyberDeCategorie[],
  noteMax: number
): string => {
  const radar = creeRadar({
    taille: TAILLE_DU_RADAR,
    nombreAxes: categories.length,
    noteMax,
    ecartDesLibelles: ECART_DES_LIBELLES,
  });
  const [xCentre, yCentre] = radar.centre;

  const axes = radar.axes
    .map(
      ([x, y]) =>
        `<line x1="${xCentre}" y1="${yCentre}" x2="${x}" y2="${y}" stroke="#D9D9D9" stroke-width="1"/>`
    )
    .join('');

  const graduations = radar.graduations
    .map(
      ({ note, rayon, polygone }) =>
        `<polygon points="${enAttributPoints(polygone)}" stroke="#D9D9D9" stroke-width="1"/>${
          note === 0
            ? ''
            : `<text x="${xCentre + 3}" y="${yCentre - rayon + 4}" font-size="${TAILLE_DES_GRADUATIONS}" fill="#000000">${note}</text>`
        }`
    )
    .join('');

  const libelles = radar.libelles
    .map(({ point, alignement, sousLeCentre }, index) => {
      const { libelle, note } = categories[index];
      return `<text x="${point[0]}" y="${point[1]}" dy="${decalageVerticalDuLibelle(sousLeCentre, point)}" text-anchor="${alignement}" font-size="${TAILLE_DES_LIBELLES}" fill="#667892">${echappe(libelle)} <tspan fill="#0079D0" font-weight="bold" font-style="italic">${auDixieme(note)}</tspan></text>`;
    })
    .join('');

  const pointsDesNotes = radar.pointsDesNotes(
    categories.map(({ note }) => note)
  );
  const notes = pointsDesNotes
    .map(
      ([x, y]) =>
        `<circle cx="${x}" cy="${y}" r="3" fill="url(#degrade-point)"/>`
    )
    .join('');

  const decalageX = (LARGEUR - TAILLE_DU_RADAR) / 2;
  const decalageY = (HAUTEUR - TAILLE_DU_RADAR) / 2;

  return `<svg viewBox="0 0 ${LARGEUR} ${HAUTEUR}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="degrade-contour" x1="${xCentre}" y1="0" x2="${xCentre}" y2="${TAILLE_DU_RADAR}" gradientUnits="userSpaceOnUse">
      <stop stop-color="#54B8F6"/><stop offset="1" stop-color="#3479C9"/>
    </linearGradient>
    <linearGradient id="degrade-point" gradientTransform="rotate(90)">
      <stop offset="0%" stop-color="#54B8F6"/><stop offset="100%" stop-color="#3479C9"/>
    </linearGradient>
  </defs>
  <g transform="translate(${decalageX}, ${decalageY})">
    ${axes}${graduations}
    <polygon points="${enAttributPoints(pointsDesNotes)}" stroke="url(#degrade-contour)" stroke-width="2.5" stroke-linejoin="round"/>
    ${notes}${libelles}
  </g>
</svg>`;
};
