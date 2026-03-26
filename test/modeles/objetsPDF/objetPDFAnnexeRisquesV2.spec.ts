import { unServiceV2 } from '../../constructeurs/constructeurService.js';
import { ObjetPDFAnnexeRisquesV2 } from '../../../src/modeles/objetsPDF/objetPDFAnnexeRisquesV2.ts';

describe("L'objet PDF des descriptions des risques", () => {
  let service = unServiceV2().avecNomService('Nom Service').construis();

  it('ajoute le nom du service', () => {
    const vueAnnexePDFRisques = new ObjetPDFAnnexeRisquesV2(service);

    const donnees = vueAnnexePDFRisques.donnees();

    expect(donnees.nomService).toEqual('Nom Service');
  });

  it('ajoute les risques v2', () => {
    const vueAnnexePDFRisques = new ObjetPDFAnnexeRisquesV2(service);

    const donnees = vueAnnexePDFRisques.donnees();

    expect(donnees.risques).toEqual({
      risques: expect.any(Array),
      risquesBruts: expect.any(Array),
      risquesCibles: expect.any(Array),
      risquesSpecifiques: expect.any(Array),
    });
  });

  it("n'ajoute pas les risques désactivés", () => {
    service = unServiceV2()
      .avecNomService('Nom Service')
      .avecRisquesV2({ risquesGeneraux: { R3: { desactive: true } } })
      .construis();
    const vueAnnexePDFRisques = new ObjetPDFAnnexeRisquesV2(service);

    const donnees = vueAnnexePDFRisques.donnees();

    expect(donnees.risques.risques.map((r) => r.id)).not.toContain('R3');
    expect(donnees.risques.risquesBruts.map((r) => r.id)).not.toContain('R3');
    expect(donnees.risques.risquesCibles.map((r) => r.id)).not.toContain('R3');
  });
});
