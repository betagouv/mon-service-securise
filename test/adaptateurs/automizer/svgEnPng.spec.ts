import { svgEnPng } from '../../../src/adaptateurs/automizer/svgEnPng.js';

const SIGNATURE_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

const dimensionsDuPng = (png: Buffer) => ({
  largeur: png.readUInt32BE(16),
  hauteur: png.readUInt32BE(20),
});

describe("La conversion d'un SVG en PNG", () => {
  const unCarre =
    '<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" fill="red"/></svg>';

  it('produit une image PNG', () => {
    const png = svgEnPng(unCarre, 100);

    expect(png.subarray(0, 4).equals(SIGNATURE_PNG)).toBe(true);
  });

  it("met l'image à la largeur demandée, en gardant ses proportions", () => {
    const png = svgEnPng(unCarre, 420);

    expect(dimensionsDuPng(png)).toEqual({ largeur: 420, hauteur: 420 });
  });
});
