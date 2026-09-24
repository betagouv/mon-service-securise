import EvenementRoleUtilisateurAdministreAttribue from '../../../src/modeles/journalMSS/evenementRoleUtilisateurAdministreAttribue.ts';
import { Autorisation } from '../../../src/modeles/autorisations/autorisation.ts';
import { hacheEnMajuscules } from '../../mocks/adaptateurChiffrementQuiHacheEnMajuscules.js';
import { unUUID } from '../../constructeurs/UUID.ts';

describe("Un événement d'attribution de rôle à un utilisateur administré", () => {
  it("consigne les identifiants hachés de l'admin, de l'utilisateur administré et des services, et le rôle", () => {
    const evenement = new EvenementRoleUtilisateurAdministreAttribue(
      {
        idAdmin: unUUID('a'),
        idUtilisateurAdministre: unUUID('u'),
        role: Autorisation.RESUME_NIVEAU_DROIT.PROPRIETAIRE,
        idsServices: [unUUID('s'), unUUID('t')],
      },
      { date: '17/11/2022', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).toEqual({
      type: 'ROLE_UTILISATEUR_ADMINISTRE_ATTRIBUE',
      donnees: {
        idAdmin: unUUID('A'),
        idUtilisateurAdministre: unUUID('U'),
        role: 'PROPRIETAIRE',
        idsServices: [unUUID('S'), unUUID('T')],
      },
      date: '17/11/2022',
    });
  });
});
