export type Point = [number, number];

export type Alignement = 'start' | 'middle' | 'end';

export type LibelleDuRadar = {
  point: Point;
  alignement: Alignement;
  sousLeCentre: boolean;
};

type ParametresDuRadar = {
  taille: number;
  nombreAxes: number;
  noteMax: number;
  ecartDesLibelles: number;
};

const PROPORTION_OCCUPEE_PAR_LA_TOILE = 0.95;
const ANGLE_DU_PREMIER_AXE = -Math.PI / 2;

const alignementSelonLAngle = (angleEnDegres: number): Alignement => {
  const versLeHaut = angleEnDegres > 320 || angleEnDegres < 40;
  const versLeBas = angleEnDegres > 140 && angleEnDegres < 220;
  if (versLeHaut || versLeBas) return 'middle';
  if (angleEnDegres > 140) return 'end';
  return 'start';
};

export const enAttributPoints = (points: Point[]) =>
  points.map(([x, y]) => `${x} ${y}`).join(' ');

export const creeRadar = ({
  taille,
  nombreAxes,
  noteMax,
  ecartDesLibelles,
}: ParametresDuRadar) => {
  const centre: Point = [taille / 2, taille / 2];
  const rayonMax = (PROPORTION_OCCUPEE_PAR_LA_TOILE * taille) / 2;
  const ecartEntreLesAxes = (2 * Math.PI) / nombreAxes;

  const pointSurLAxe = (indexAxe: number, rayon: number): Point => {
    const angle = indexAxe * ecartEntreLesAxes + ANGLE_DU_PREMIER_AXE;
    return [
      centre[0] + rayon * Math.cos(angle),
      centre[1] + rayon * Math.sin(angle),
    ];
  };

  const polygoneDeRayon = (rayon: number) =>
    Array.from({ length: nombreAxes }, (_, index) =>
      pointSurLAxe(index, rayon)
    );

  const rayonDeLaNote = (note: number) => (note / noteMax) * rayonMax;

  const graduations = Array.from({ length: noteMax + 1 }, (_, note) => ({
    note,
    rayon: rayonDeLaNote(note),
    polygone: polygoneDeRayon(rayonDeLaNote(note)),
  }));

  const libelles: LibelleDuRadar[] = polygoneDeRayon(
    rayonMax + ecartDesLibelles
  ).map((point, index) => {
    const angleEnDegres = index * (360 / nombreAxes);
    return {
      point,
      alignement: alignementSelonLAngle(angleEnDegres),
      sousLeCentre: angleEnDegres > 90 && angleEnDegres < 270,
    };
  });

  return {
    centre,
    axes: polygoneDeRayon(rayonMax),
    graduations,
    libelles,
    pointsDesNotes: (notes: number[]) =>
      notes.map((note, index) => pointSurLAxe(index, rayonDeLaNote(note))),
  };
};
