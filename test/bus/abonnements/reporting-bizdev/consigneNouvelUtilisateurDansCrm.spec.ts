import { consigneNouvelUtilisateurDansCrm } from '../../../../src/bus/abonnements/reporting-bizdev/consigneNouvelUtilisateurDansCrm.ts';
import EvenementUtilisateurInscrit from '../../../../src/bus/evenementUtilisateurInscrit.js';
import { unUtilisateur } from '../../../constructeurs/constructeurUtilisateur.js';

describe("L'abonné qui consigne un nouvel utilisateur dans le CRM", () => {
  it("consigne l'entité de l'utilisateur", async () => {
    const reportingTest = { consigneEntiteUtilisatrice: vi.fn() };
    const utilisateur = unUtilisateur()
      .quiTravaillePourUneEntiteAvecSiret('12345678900011')
      .construis();
    const uneInscription = new EvenementUtilisateurInscrit({ utilisateur });

    await consigneNouvelUtilisateurDansCrm({ reportingCrm: reportingTest })(
      uneInscription
    );

    expect(reportingTest.consigneEntiteUtilisatrice).toHaveBeenCalledWith(
      utilisateur.entite
    );
  });
});
