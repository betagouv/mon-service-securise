import EvenementAccesUtilisateurAdministreRetires from '../../../src/modeles/journalMSS/evenementAccesUtilisateurAdministreRetires.ts';
import { hacheEnMajuscules } from '../../mocks/adaptateurChiffrementQuiHacheEnMajuscules.js';
import { unUUID } from '../../constructeurs/UUID.ts';

describe("Un événement de retrait d'accès à un utilisateur administré", () => {
  it("consigne les identifiants hachés de l'admin, de l'utilisateur administré et des services", () => {
    const evenement = new EvenementAccesUtilisateurAdministreRetires(
      {
        idAdmin: unUUID('a'),
        idUtilisateurAdministre: unUUID('u'),
        idsServices: [unUUID('s'), unUUID('t')],
      },
      { date: '17/11/2022', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).toEqual({
      type: 'ACCES_UTILISATEUR_ADMINISTRE_RETIRES',
      donnees: {
        idAdmin: unUUID('A'),
        idUtilisateurAdministre: unUUID('U'),
        idsServices: [unUUID('S'), unUUID('T')],
      },
      date: '17/11/2022',
    });
  });
});
