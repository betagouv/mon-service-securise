import { ErreurDonneeManquante } from '../../../src/modeles/journalMSS/erreurs.js';
import { unUUID, unUUIDRandom } from '../../constructeurs/UUID.ts';
import EvenementAdminNommeSurOrganisation from '../../../src/modeles/journalMSS/evenementAdminNommeSurOrganisation.ts';
import { hacheEnMajuscules } from '../../mocks/adaptateurChiffrementQuiHacheEnMajuscules.js';

describe("Un événement de nomination d'admin sur une organisation", () => {
  it("hache l'identifiant de l'acteur", () => {
    const evenement = new EvenementAdminNommeSurOrganisation(
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
    const evenement = new EvenementAdminNommeSurOrganisation(
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
    const evenement = new EvenementAdminNommeSurOrganisation(
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
    const evenement = new EvenementAdminNommeSurOrganisation(
      {
        idActeur: unUUID('a'),
        idCible: unUUID('c'),
        siret: 'abcd',
      },
      { date: '17/11/2022', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).to.eql({
      type: 'ADMIN_NOMME_SUR_ORGANISATION',
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
          new EvenementAdminNommeSurOrganisation(donneesTest, {
            adaptateurChiffrement: hacheEnMajuscules,
          })
      ).toThrow(ErreurDonneeManquante);
    }
  );
});
