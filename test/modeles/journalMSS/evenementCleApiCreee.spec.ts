import { unUUID } from '../../constructeurs/UUID.ts';
import EvenementCleApiCreee, {
  DonneesEvenementCleApiCreee,
} from '../../../src/modeles/journalMSS/evenementCleApiCreee.ts';
import { ErreurDonneeManquante } from '../../../src/modeles/journalMSS/erreurs.js';
import { hacheEnMajuscules } from '../../mocks/adaptateurChiffrementQuiHacheEnMajuscules.js';

describe("Un événement de clé d'API créée", () => {
  const uneCle = (): DonneesEvenementCleApiCreee => ({
    idCle: unUUID('c'),
    idUtilisateur: unUUID('u'),
    dureeValiditeEnJours: 30,
    dateCreation: new Date('2026-09-01T10:00:00Z'),
    dateExpiration: new Date('2026-10-01T10:00:00Z'),
  });

  it("hache l'identifiant de la clé qui lui est donné", () => {
    const evenement = new EvenementCleApiCreee(uneCle(), {
      adaptateurChiffrement: hacheEnMajuscules,
    });

    expect(evenement.donnees.idCle).toBe(unUUID('C'));
  });

  it("hache l'identifiant de l'utilisateur qui lui est donné", () => {
    const evenement = new EvenementCleApiCreee(uneCle(), {
      adaptateurChiffrement: hacheEnMajuscules,
    });

    expect(evenement.donnees.idUtilisateur).toBe(unUUID('U'));
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementCleApiCreee(uneCle(), {
      date: '27/03/2023',
      adaptateurChiffrement: hacheEnMajuscules,
    });

    expect(evenement.toJSON()).toEqual({
      date: '27/03/2023',
      donnees: {
        idCle: unUUID('C'),
        idUtilisateur: unUUID('U'),
        dureeValiditeEnJours: 30,
        dateCreation: new Date('2026-09-01T10:00:00Z'),
        dateExpiration: new Date('2026-10-01T10:00:00Z'),
      },
      type: 'CLE_API_CREEE',
    });
  });

  it.each([
    'idCle',
    'idUtilisateur',
    'dureeValiditeEnJours',
    'dateCreation',
    'dateExpiration',
  ])('exige que `%s` soit renseigné', (propriete) => {
    expect(
      () =>
        new EvenementCleApiCreee({
          ...uneCle(),
          [propriete]: undefined,
        })
    ).toThrow(ErreurDonneeManquante);
  });
});
