import { unUUID } from '../../constructeurs/UUID.ts';
import EvenementGroupeServicesSupprime, {
  DonneesEvenementGroupeServicesSupprime,
} from '../../../src/modeles/journalMSS/evenementGroupeServicesSupprime.ts';
import { ErreurDonneeManquante } from '../../../src/modeles/journalMSS/erreurs.js';

describe('Un événement de groupe de services supprimé', () => {
  const hacheEnMajuscules = {
    hacheSha256: (valeur: string) => valeur?.toUpperCase(),
  };

  const unGroupe = (): DonneesEvenementGroupeServicesSupprime => ({
    idGroupe: unUUID('g'),
    idUtilisateur: unUUID('u'),
  });

  it("hache l'identifiant du groupe qui lui est donné", () => {
    const evenement = new EvenementGroupeServicesSupprime(unGroupe(), {
      adaptateurChiffrement: hacheEnMajuscules,
    });

    expect(evenement.donnees.idGroupe).toBe(unUUID('G'));
  });

  it("hache l'identifiant de l'utilisateur qui lui est donné", () => {
    const evenement = new EvenementGroupeServicesSupprime(unGroupe(), {
      adaptateurChiffrement: hacheEnMajuscules,
    });

    expect(evenement.donnees.idUtilisateur).toBe(unUUID('U'));
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementGroupeServicesSupprime(unGroupe(), {
      date: '27/03/2023',
      adaptateurChiffrement: hacheEnMajuscules,
    });

    expect(evenement.toJSON()).toEqual({
      date: '27/03/2023',
      donnees: {
        idGroupe: unUUID('G'),
        idUtilisateur: unUUID('U'),
      },
      type: 'GROUPE_SERVICES_SUPPRIME',
    });
  });

  it.each(['idGroupe', 'idUtilisateur'])(
    'exige que `%s` soit renseigné',
    (propriete) => {
      expect(
        () =>
          new EvenementGroupeServicesSupprime({
            ...unGroupe(),
            [propriete]: undefined,
          })
      ).toThrow(ErreurDonneeManquante);
    }
  );
});
