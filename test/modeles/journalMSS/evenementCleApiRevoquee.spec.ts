import { unUUID } from '../../constructeurs/UUID.ts';
import EvenementCleApiRevoquee, {
  DonneesEvenementCleApiRevoquee,
} from '../../../src/modeles/journalMSS/evenementCleApiRevoquee.ts';
import { ErreurDonneeManquante } from '../../../src/modeles/journalMSS/erreurs.js';
import { hacheEnMajuscules } from '../../mocks/adaptateurChiffrementQuiHacheEnMajuscules.js';

describe("Un événement de clé d'API révoquée", () => {
  const uneCle = (): DonneesEvenementCleApiRevoquee => ({
    idCle: unUUID('c'),
    idUtilisateur: unUUID('u'),
    dateRevocation: new Date('2026-09-15T10:00:00Z'),
  });

  it("hache l'identifiant de la clé qui lui est donné", () => {
    const evenement = new EvenementCleApiRevoquee(uneCle(), {
      adaptateurChiffrement: hacheEnMajuscules,
    });

    expect(evenement.donnees.idCle).toBe(unUUID('C'));
  });

  it("hache l'identifiant de l'utilisateur qui lui est donné", () => {
    const evenement = new EvenementCleApiRevoquee(uneCle(), {
      adaptateurChiffrement: hacheEnMajuscules,
    });

    expect(evenement.donnees.idUtilisateur).toBe(unUUID('U'));
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementCleApiRevoquee(uneCle(), {
      date: '27/03/2023',
      adaptateurChiffrement: hacheEnMajuscules,
    });

    expect(evenement.toJSON()).toEqual({
      date: '27/03/2023',
      donnees: {
        idCle: unUUID('C'),
        idUtilisateur: unUUID('U'),
        dateRevocation: new Date('2026-09-15T10:00:00Z'),
      },
      type: 'CLE_API_REVOQUEE',
    });
  });

  it.each(['idCle', 'idUtilisateur', 'dateRevocation'])(
    'exige que `%s` soit renseigné',
    (propriete) => {
      expect(
        () =>
          new EvenementCleApiRevoquee({
            ...uneCle(),
            [propriete]: undefined,
          })
      ).toThrow(ErreurDonneeManquante);
    }
  );
});
