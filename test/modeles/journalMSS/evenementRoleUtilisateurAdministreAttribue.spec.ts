import { ErreurDonneeManquante } from '../../../src/modeles/journalMSS/erreurs.js';
import { unUUID, unUUIDRandom } from '../../constructeurs/UUID.ts';
import EvenementRoleUtilisateurAdministreAttribue from '../../../src/modeles/journalMSS/evenementRoleUtilisateurAdministreAttribue.ts';
import { Autorisation } from '../../../src/modeles/autorisations/autorisation.ts';

describe("Un événement d'attribution de rôle à un utilisateur administré", () => {
  const hacheEnMajuscules = {
    hacheSha256: (valeur: string) => valeur.toUpperCase(),
  };

  it("chiffre l'identifiant de l'admin", () => {
    const evenement = new EvenementRoleUtilisateurAdministreAttribue(
      {
        idAdmin: unUUID('a'),
        idUtilisateurAdministre: unUUIDRandom(),
        role: Autorisation.RESUME_NIVEAU_DROIT.PROPRIETAIRE,
        idsServices: [unUUIDRandom()],
      },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON().donnees.idAdmin).toBe(unUUID('A'));
  });

  it("chiffre l'identifiant de l'utilisateur administré", () => {
    const evenement = new EvenementRoleUtilisateurAdministreAttribue(
      {
        idAdmin: unUUIDRandom(),
        idUtilisateurAdministre: unUUID('u'),
        role: Autorisation.RESUME_NIVEAU_DROIT.PROPRIETAIRE,
        idsServices: [unUUIDRandom()],
      },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON().donnees.idUtilisateurAdministre).toBe(
      unUUID('U')
    );
  });

  it('chiffre les identifiants des services', () => {
    const evenement = new EvenementRoleUtilisateurAdministreAttribue(
      {
        idAdmin: unUUIDRandom(),
        idUtilisateurAdministre: unUUIDRandom(),
        role: Autorisation.RESUME_NIVEAU_DROIT.PROPRIETAIRE,
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
    const evenement = new EvenementRoleUtilisateurAdministreAttribue(
      {
        idAdmin: unUUID('a'),
        idUtilisateurAdministre: unUUID('u'),
        role: Autorisation.RESUME_NIVEAU_DROIT.PROPRIETAIRE,
        idsServices: [unUUID('s'), unUUID('t')],
      },
      { date: '17/11/2022', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).to.eql({
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

  it.each(['idAdmin', 'idUtilisateurAdministre', 'role', 'idsServices'])(
    'exige que %s soit renseigné',
    (proprieteRequise) => {
      const donneesTest = {
        idAdmin: unUUID('a'),
        idUtilisateurAdministre: unUUID('u'),
        role: Autorisation.RESUME_NIVEAU_DROIT.PROPRIETAIRE,
        idsServices: [unUUID('s'), unUUID('t')],
      };
      delete donneesTest[
        proprieteRequise as
          | 'idAdmin'
          | 'idUtilisateurAdministre'
          | 'role'
          | 'idsServices'
      ];

      expect(
        () =>
          new EvenementRoleUtilisateurAdministreAttribue(donneesTest, {
            adaptateurChiffrement: hacheEnMajuscules,
          })
      ).toThrowError(ErreurDonneeManquante);
    }
  );
});
