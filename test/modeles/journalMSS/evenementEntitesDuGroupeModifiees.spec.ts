import { unUUID } from '../../constructeurs/UUID.ts';
import EvenementEntitesDuGroupeModifiees, {
  DonneesEvenementEntitesDuGroupeModifiees,
} from '../../../src/modeles/journalMSS/evenementEntitesDuGroupeModifiees.ts';
import { ErreurDonneeManquante } from '../../../src/modeles/journalMSS/erreurs.js';

describe("Un événement d'entités du groupe modifiées", () => {
  const hacheEnMajuscules = {
    hacheSha256: (valeur: string) => valeur?.toUpperCase(),
  };

  const unGroupe = (): DonneesEvenementEntitesDuGroupeModifiees => ({
    idGroupe: unUUID('g'),
    idUtilisateur: unUUID('u'),
    nombreEntitesAssociees: 3,
  });

  it("hache l'identifiant du groupe qui lui est donné", () => {
    const evenement = new EvenementEntitesDuGroupeModifiees(unGroupe(), {
      adaptateurChiffrement: hacheEnMajuscules,
    });

    expect(evenement.donnees.idGroupe).toBe(unUUID('G'));
  });

  it("hache l'identifiant de l'utilisateur qui lui est donné", () => {
    const evenement = new EvenementEntitesDuGroupeModifiees(unGroupe(), {
      adaptateurChiffrement: hacheEnMajuscules,
    });

    expect(evenement.donnees.idUtilisateur).toBe(unUUID('U'));
  });

  it("conserve le nombre d'entités associées", () => {
    const evenement = new EvenementEntitesDuGroupeModifiees(unGroupe(), {
      adaptateurChiffrement: hacheEnMajuscules,
    });

    expect(evenement.donnees.nombreEntitesAssociees).toBe(3);
  });

  it("accepte un groupe qui n'a plus aucune entité associée", () => {
    const evenement = new EvenementEntitesDuGroupeModifiees(
      { ...unGroupe(), nombreEntitesAssociees: 0 },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.donnees.nombreEntitesAssociees).toBe(0);
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementEntitesDuGroupeModifiees(unGroupe(), {
      date: '27/03/2023',
      adaptateurChiffrement: hacheEnMajuscules,
    });

    expect(evenement.toJSON()).toEqual({
      date: '27/03/2023',
      donnees: {
        idGroupe: unUUID('G'),
        idUtilisateur: unUUID('U'),
        nombreEntitesAssociees: 3,
      },
      type: 'ENTITES_DU_GROUPE_MODIFIEES',
    });
  });

  it.each(['idGroupe', 'idUtilisateur', 'nombreEntitesAssociees'])(
    'exige que `%s` soit renseigné',
    (propriete) => {
      expect(
        () =>
          new EvenementEntitesDuGroupeModifiees({
            ...unGroupe(),
            [propriete]: undefined,
          })
      ).toThrow(ErreurDonneeManquante);
    }
  );
});
