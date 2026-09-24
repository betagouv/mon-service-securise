import EvenementRetourUtilisateurMesure from '../../../src/modeles/journalMSS/evenementRetourUtilisateurMesure.ts';
import { hacheEnMajuscules } from '../../mocks/adaptateurChiffrementQuiHacheEnMajuscules.js';
import { unUUID } from '../../constructeurs/UUID.ts';

describe('Un événement de retour utilisateur sur une mesure', () => {
  const unRetour = (commentaire = 'unCommentaire') => ({
    idService: unUUID('a'),
    idUtilisateur: unUUID('d'),
    idMesure: 'uneMesure',
    idRetour: 'unRetour',
    commentaire,
  });

  it("consigne les identifiants hachés du service et de l'utilisateur, et le retour", () => {
    const evenement = new EvenementRetourUtilisateurMesure(unRetour(), {
      date: '17/11/2022',
      adaptateurChiffrement: hacheEnMajuscules,
    });

    expect(evenement.toJSON()).toEqual({
      type: 'RETOUR_UTILISATEUR_MESURE_RECU',
      donnees: {
        idService: unUUID('A'),
        idUtilisateur: unUUID('D'),
        idMesure: 'uneMesure',
        idRetour: 'unRetour',
        commentaire: 'unCommentaire',
      },
      date: '17/11/2022',
    });
  });

  it('limite la longueur du commentaire à 2 000 caractères pour éviter les contenus mal intentionnés', () => {
    const tropLong = 'a'.repeat(2500);

    const evenement = new EvenementRetourUtilisateurMesure(unRetour(tropLong), {
      adaptateurChiffrement: hacheEnMajuscules,
    });

    expect((evenement.donnees.commentaire as string).length).toBe(2000);
  });
});
