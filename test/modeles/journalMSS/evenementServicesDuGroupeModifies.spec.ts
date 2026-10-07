import { unUUID } from '../../constructeurs/UUID.ts';
import EvenementServicesDuGroupeModifies, {
  DonneesEvenementServicesDuGroupeModifies,
} from '../../../src/modeles/journalMSS/evenementServicesDuGroupeModifies.ts';
import { ErreurDonneeManquante } from '../../../src/modeles/journalMSS/erreurs.js';

describe("Un événement de modification des services d'un groupe", () => {
  const hacheEnMajuscules = {
    hacheSha256: (valeur: string) => valeur?.toUpperCase(),
  };

  const uneModification = (): DonneesEvenementServicesDuGroupeModifies => ({
    idGroupe: unUUID('g'),
    idUtilisateur: unUUID('u'),
    nombreServicesAssocies: 3,
  });

  it("hache l'identifiant du groupe qui lui est donné", () => {
    const evenement = new EvenementServicesDuGroupeModifies(uneModification(), {
      adaptateurChiffrement: hacheEnMajuscules,
    });

    expect(evenement.donnees.idGroupe).toBe(unUUID('G'));
  });

  it("hache l'identifiant de l'utilisateur qui lui est donné", () => {
    const evenement = new EvenementServicesDuGroupeModifies(uneModification(), {
      adaptateurChiffrement: hacheEnMajuscules,
    });

    expect(evenement.donnees.idUtilisateur).toBe(unUUID('U'));
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementServicesDuGroupeModifies(uneModification(), {
      date: '27/03/2023',
      adaptateurChiffrement: hacheEnMajuscules,
    });

    expect(evenement.toJSON()).toEqual({
      date: '27/03/2023',
      donnees: {
        idGroupe: unUUID('G'),
        idUtilisateur: unUUID('U'),
        nombreServicesAssocies: 3,
      },
      type: 'SERVICES_DU_GROUPE_MODIFIES',
    });
  });

  it('accepte un nombre de services associés nul', () => {
    const evenement = new EvenementServicesDuGroupeModifies(
      { ...uneModification(), nombreServicesAssocies: 0 },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.donnees.nombreServicesAssocies).toBe(0);
  });

  it.each(['idGroupe', 'idUtilisateur', 'nombreServicesAssocies'])(
    'exige que `%s` soit renseigné',
    (propriete) => {
      expect(
        () =>
          new EvenementServicesDuGroupeModifies({
            ...uneModification(),
            [propriete]: undefined,
          })
      ).toThrow(ErreurDonneeManquante);
    }
  );
});
