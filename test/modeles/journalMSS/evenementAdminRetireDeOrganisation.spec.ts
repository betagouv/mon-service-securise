import { ErreurDonneeManquante } from '../../../src/modeles/journalMSS/erreurs.js';
import { unUUID, unUUIDRandom } from '../../constructeurs/UUID.ts';
import EvenementAdminRetireDeOrganisation from '../../../src/modeles/journalMSS/evenementAdminRetireDeOrganisation.ts';

describe("Un événement de retrait d'admin d'une organisation", () => {
  const hacheEnMajuscules = {
    hacheSha256: (valeur: string) => valeur.toUpperCase(),
  };

  it("hache l'identifiant de l'acteur", () => {
    const evenement = new EvenementAdminRetireDeOrganisation(
      {
        idActeur: unUUID('a'),
        idCible: unUUIDRandom(),
        siret: '12345678901234',
      },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON().donnees.idActeur).toBe(unUUID('A'));
  });

  it("hache l'identifiant de la cible", () => {
    const evenement = new EvenementAdminRetireDeOrganisation(
      {
        idActeur: unUUIDRandom(),
        idCible: unUUID('c'),
        siret: '12345678901234',
      },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON().donnees.idCible).toBe(unUUID('C'));
  });

  it('hache le siret', () => {
    const evenement = new EvenementAdminRetireDeOrganisation(
      {
        idActeur: unUUIDRandom(),
        idCible: unUUIDRandom(),
        siret: 'abcd',
      },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON().donnees.siret).toBe('ABCD');
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementAdminRetireDeOrganisation(
      {
        idActeur: unUUID('a'),
        idCible: unUUID('c'),
        siret: 'abcd',
      },
      { date: '17/11/2022', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).to.eql({
      type: 'ADMIN_RETIRE_DE_ORGANISATION',
      donnees: {
        idActeur: unUUID('A'),
        idCible: unUUID('C'),
        siret: 'ABCD',
      },
      date: '17/11/2022',
    });
  });

  it.each(['idActeur', 'idCible', 'siret'])(
    'exige que %s soit renseigné',
    (proprieteRequise) => {
      const donneesTest = {
        idActeur: unUUID('a'),
        idCible: unUUID('c'),
        siret: '12345678901234',
      };
      delete donneesTest[proprieteRequise as 'idActeur' | 'idCible' | 'siret'];

      expect(
        () =>
          new EvenementAdminRetireDeOrganisation(donneesTest, {
            adaptateurChiffrement: hacheEnMajuscules,
          })
      ).toThrow(ErreurDonneeManquante);
    }
  );
});
