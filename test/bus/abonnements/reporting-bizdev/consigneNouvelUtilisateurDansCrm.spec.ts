import { consigneNouvelUtilisateurDansCrm } from '../../../../src/bus/abonnements/reporting-bizdev/consigneNouvelUtilisateurDansCrm.ts';

describe("L'abonné qui consigne un nouvel utilisateur dans le CRM", () => {
  it('existe', () => {
    expect(consigneNouvelUtilisateurDansCrm).toBeDefined();
  });
});
