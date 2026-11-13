import { creeRadar, enAttributPoints } from '../../src/geometrie/radar.js';

const arrondis = (points: [number, number][]) =>
  points.map(([x, y]) => [Number(x.toFixed(2)), Number(y.toFixed(2))]);

describe('Le radar', () => {
  const unRadar = () =>
    creeRadar({
      taille: 100,
      nombreAxes: 4,
      noteMax: 5,
      ecartDesLibelles: 10,
    });

  it('place son centre au milieu', () => {
    expect(unRadar().centre).toEqual([50, 50]);
  });

  it("trace un axe par catégorie, le premier vers le haut puis dans le sens des aiguilles d'une montre", () => {
    expect(arrondis(unRadar().axes)).toEqual([
      [50, 2.5],
      [97.5, 50],
      [50, 97.5],
      [2.5, 50],
    ]);
  });

  it('trace une graduation par note, de 0 à la note maximale', () => {
    const { graduations } = unRadar();

    expect(graduations.map(({ note }) => note)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(graduations[2].rayon).toBeCloseTo(19);
    expect(arrondis(graduations[2].polygone)).toEqual([
      [50, 31],
      [69, 50],
      [50, 69],
      [31, 50],
    ]);
  });

  it('place chaque note sur son axe, en proportion de la note maximale', () => {
    const points = unRadar().pointsDesNotes([5, 2.5, 0, 1]);

    expect(arrondis(points)).toEqual([
      [50, 2.5],
      [73.75, 50],
      [50, 50],
      [40.5, 50],
    ]);
  });

  it('place chaque libellé au-delà de son axe, aligné selon son côté du radar', () => {
    const { libelles } = unRadar();

    expect(
      libelles.map(({ point, alignement, sousLeCentre }) => ({
        point: arrondis([point])[0],
        alignement,
        sousLeCentre,
      }))
    ).toEqual([
      { point: [50, -7.5], alignement: 'middle', sousLeCentre: false },
      { point: [107.5, 50], alignement: 'start', sousLeCentre: false },
      { point: [50, 107.5], alignement: 'middle', sousLeCentre: true },
      { point: [-7.5, 50], alignement: 'end', sousLeCentre: false },
    ]);
  });

  it("écrit des points dans le format de l'attribut `points` d'un polygone SVG", () => {
    expect(
      enAttributPoints([
        [1, 2],
        [3.5, 4],
      ])
    ).toBe('1 2 3.5 4');
  });
});
