import { aDesDocumentsATelecharger } from '../../../lib/ui/tiroirs/documentsATelecharger';

describe('La présence de documents à télécharger pour un service', () => {
  it('est avérée quand au moins un PDF est disponible', () => {
    expect(
      aDesDocumentsATelecharger({
        documentsPdfDisponibles: ['annexes'],
        supportCommissionPptxDisponible: false,
      })
    ).toBe(true);
  });

  it('est avérée quand seul le support de commission est disponible', () => {
    expect(
      aDesDocumentsATelecharger({
        documentsPdfDisponibles: [],
        supportCommissionPptxDisponible: true,
      })
    ).toBe(true);
  });

  it('n’est pas avérée sans PDF ni support de commission', () => {
    expect(
      aDesDocumentsATelecharger({
        documentsPdfDisponibles: [],
        supportCommissionPptxDisponible: false,
      })
    ).toBe(false);
  });
});
