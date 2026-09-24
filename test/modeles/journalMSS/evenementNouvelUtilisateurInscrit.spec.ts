import EvenementNouvelUtilisateurInscrit from '../../../src/modeles/journalMSS/evenementNouvelUtilisateurInscrit.ts';
import { hacheEnMajuscules } from '../../mocks/adaptateurChiffrementQuiHacheEnMajuscules.js';
import { unUUID } from '../../constructeurs/UUID.ts';

describe('Un événement de nouvel utilisateur inscrit', () => {
  it("consigne l'identifiant haché de l'utilisateur", () => {
    const evenement = new EvenementNouvelUtilisateurInscrit(
      { idUtilisateur: unUUID('a') },
      { date: '17/11/2022', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).toEqual({
      type: 'NOUVEL_UTILISATEUR_INSCRIT',
      donnees: { idUtilisateur: unUUID('A') },
      date: '17/11/2022',
    });
  });
});
