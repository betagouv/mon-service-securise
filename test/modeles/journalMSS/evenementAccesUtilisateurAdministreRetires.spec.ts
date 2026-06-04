import { ErreurDonneeManquante } from '../../../src/modeles/journalMSS/erreurs.js';
import { unUUID, unUUIDRandom } from '../../constructeurs/UUID.ts';
import EvenementAccesUtilisateurAdministreRetires from '../../../src/modeles/journalMSS/evenementAccesUtilisateurAdministreRetires.ts';

describe("Un événement de retrait d'accès à un utilisateur administré", () => {
  const hacheEnMajuscules = {
    hacheSha256: (valeur: string) => valeur.toUpperCase(),
  };

  it("hache l'identifiant de l'admin", () => {
    const evenement = new EvenementAccesUtilisateurAdministreRetires(
      {
        idAdmin: unUUID('a'),
        idUtilisateurAdministre: unUUIDRandom(),
        idsServices: [unUUIDRandom()],
      },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON().donnees.idAdmin).toBe(unUUID('A'));
  });

  it("hache l'identifiant de l'utilisateur administré", () => {
    const evenement = new EvenementAccesUtilisateurAdministreRetires(
      {
        idAdmin: unUUIDRandom(),
        idUtilisateurAdministre: unUUID('u'),
        idsServices: [unUUIDRandom()],
      },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON().donnees.idUtilisateurAdministre).toBe(
      unUUID('U')
    );
  });

  it('hache les identifiants des services', () => {
    const evenement = new EvenementAccesUtilisateurAdministreRetires(
      {
        idAdmin: unUUIDRandom(),
        idUtilisateurAdministre: unUUIDRandom(),
        idsServices: [unUUID('s'), unUUID('t')],
      },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON().donnees.idsServices).toEqual([
      unUUID('S'),
      unUUID('T'),
    ]);
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementAccesUtilisateurAdministreRetires(
      {
        idAdmin: unUUID('a'),
        idUtilisateurAdministre: unUUID('u'),
        idsServices: [unUUID('s'), unUUID('t')],
      },
      { date: '17/11/2022', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).to.eql({
      type: 'ACCES_UTILISATEUR_ADMINISTRE_RETIRES',
      donnees: {
        idAdmin: unUUID('A'),
        idUtilisateurAdministre: unUUID('U'),
        idsServices: [unUUID('S'), unUUID('T')],
      },
      date: '17/11/2022',
    });
  });

  it.each(['idAdmin', 'idUtilisateurAdministre', 'idsServices'])(
    'exige que %s soit renseigné',
    (proprieteRequise) => {
      const donneesTest = {
        idAdmin: unUUID('a'),
        idUtilisateurAdministre: unUUID('u'),
        idsServices: [unUUID('s'), unUUID('t')],
      };
      delete donneesTest[
        proprieteRequise as
          | 'idAdmin'
          | 'idUtilisateurAdministre'
          | 'idsServices'
      ];

      expect(
        () =>
          new EvenementAccesUtilisateurAdministreRetires(donneesTest, {
            adaptateurChiffrement: hacheEnMajuscules,
          })
      ).toThrow(ErreurDonneeManquante);
    }
  );
});
