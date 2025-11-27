import EvenementNouveauServiceCree from '../../../src/modeles/journalMSS/evenementNouveauServiceCree.ts';
import { ErreurDonneeManquante } from '../../../src/modeles/journalMSS/erreurs.js';
import { unUUID } from '../../constructeurs/UUID.ts';
import { VersionService } from '../../../src/modeles/versionService.ts';

describe('Un événement de nouveau service créé', () => {
  const hacheEnMajuscules = {
    hacheSha256: (valeur: string) => valeur.toUpperCase(),
  };

  it("chiffre l'identifiant du service qui lui est donné", () => {
    const evenement = new EvenementNouveauServiceCree(
      {
        idService: unUUID('a'),
        idUtilisateur: unUUID('b'),
        versionService: VersionService.v1,
      },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON().donnees.idService).toBe(unUUID('A'));
  });

  it("chiffre l'identifiant utilisateur qui lui est donné", () => {
    const evenement = new EvenementNouveauServiceCree(
      {
        idService: unUUID('a'),
        idUtilisateur: unUUID('b'),
        versionService: VersionService.v1,
      },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON().donnees.idUtilisateur).toBe(unUUID('B'));
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementNouveauServiceCree(
      {
        idService: unUUID('a'),
        idUtilisateur: unUUID('b'),
        versionService: VersionService.v1,
      },
      { date: '17/11/2022', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).to.eql({
      type: 'NOUVEAU_SERVICE_CREE',
      donnees: {
        idService: unUUID('A'),
        idUtilisateur: unUUID('B'),
        versionService: 'v1',
      },
      date: '17/11/2022',
    });
  });

  it.each(['idUtilisateur', 'idService', 'versionService'])(
    'exige que %s soit renseigné',
    (proprieteRequise) => {
      const donneesTest = {
        idService: unUUID('a'),
        idUtilisateur: unUUID('b'),
        versionService: VersionService.v1,
      };
      delete donneesTest[
        proprieteRequise as 'idService' | 'idUtilisateur' | 'versionService'
      ];

      expect(
        () =>
          new EvenementNouveauServiceCree(donneesTest, {
            adaptateurChiffrement: hacheEnMajuscules,
          })
      ).toThrowError(ErreurDonneeManquante);
    }
  );
});
