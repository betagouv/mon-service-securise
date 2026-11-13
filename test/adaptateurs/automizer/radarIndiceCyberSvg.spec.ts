import { svgRadarIndiceCyber } from '../../../src/adaptateurs/automizer/radarIndiceCyberSvg.js';

const textesDuSvg = (svg: string) =>
  [...svg.matchAll(/<text[^>]*>(.*?)<\/text>/gs)].map(([, contenu]) =>
    contenu.replace(/<[^>]+>/g, '').trim()
  );

describe("Le radar de l'indice cyber par catégorie", () => {
  const categories = [
    { libelle: 'Gouvernance', note: 3.24 },
    { libelle: 'Protection', note: 1.8 },
    { libelle: 'Défense', note: 0.9 },
    { libelle: 'Résilience', note: 0.4 },
  ];

  it('écrit le libellé de chaque catégorie suivi de sa note, arrondie au dixième', () => {
    const svg = svgRadarIndiceCyber(categories, 5);

    expect(textesDuSvg(svg)).toEqual(
      expect.arrayContaining([
        'Gouvernance 3,2',
        'Protection 1,8',
        'Défense 0,9',
        'Résilience 0,4',
      ])
    );
  });

  it("gradue l'échelle de 1 à la note maximale", () => {
    const svg = svgRadarIndiceCyber(categories, 5);

    expect(textesDuSvg(svg)).toEqual(
      expect.arrayContaining(['1', '2', '3', '4', '5'])
    );
    expect(textesDuSvg(svg)).not.toContain('0');
  });

  it('échappe les caractères spéciaux des libellés', () => {
    const svg = svgRadarIndiceCyber(
      [{ libelle: 'Défense & <résilience>', note: 1 }],
      5
    );

    expect(svg).toContain('Défense &amp; &lt;résilience&gt;');
  });
});
