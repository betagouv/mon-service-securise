import { consigneNouvelUtilisateurDansCrm } from '../../../../src/bus/abonnements/reporting-bizdev/consigneNouvelUtilisateurDansCrm.ts';
import EvenementUtilisateurInscrit from '../../../../src/bus/evenementUtilisateurInscrit.js';
import { unUtilisateur } from '../../../constructeurs/constructeurUtilisateur.js';

describe("L'abonné qui consigne un nouvel utilisateur dans le CRM", () => {
  const reportingTest = () => ({
    consigneEntiteUtilisatrice: vi.fn().mockResolvedValue('id-entite-crm'),
    consigneUtilisateur: vi.fn(),
  });

  const uneInscription = () => {
    const utilisateur = unUtilisateur()
      .avecEmail('jean.dupont@mail.fr')
      .quiTravaillePourUneEntiteAvecSiret('12345678900011')
      .construis();
    return new EvenementUtilisateurInscrit({ utilisateur });
  };

  it("consigne l'entité de l'utilisateur", async () => {
    const reportingCrm = reportingTest();
    const inscription = uneInscription();

    await consigneNouvelUtilisateurDansCrm({ reportingCrm })(inscription);

    expect(reportingCrm.consigneEntiteUtilisatrice).toHaveBeenCalledWith(
      inscription.utilisateur.entite
    );
  });

  it("consigne l'utilisateur rattaché à son entité dans le CRM", async () => {
    const reportingCrm = reportingTest();

    await consigneNouvelUtilisateurDansCrm({ reportingCrm })(uneInscription());

    expect(reportingCrm.consigneUtilisateur).toHaveBeenCalledWith(
      'jean.dupont@mail.fr',
      'id-entite-crm'
    );
  });

  describe("quand l'utilisateur n'a pas de SIRET", () => {
    const uneInscriptionSansSiret = () => {
      const utilisateur = unUtilisateur()
        .avecEmail('jean.dupont@mail.fr')
        .construis();
      return new EvenementUtilisateurInscrit({ utilisateur });
    };

    it("ne consigne pas d'entité", async () => {
      const reportingCrm = reportingTest();

      await consigneNouvelUtilisateurDansCrm({ reportingCrm })(
        uneInscriptionSansSiret()
      );

      expect(reportingCrm.consigneEntiteUtilisatrice).not.toHaveBeenCalled();
    });

    it("consigne l'utilisateur sans entité", async () => {
      const reportingCrm = reportingTest();

      await consigneNouvelUtilisateurDansCrm({ reportingCrm })(
        uneInscriptionSansSiret()
      );

      expect(reportingCrm.consigneUtilisateur).toHaveBeenCalledWith(
        'jean.dupont@mail.fr',
        undefined
      );
    });
  });
});
