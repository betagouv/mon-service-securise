import expect from 'expect.js';
import EvenementNouveauServiceCree from '../../../src/modeles/journalMSS/evenementNouveauServiceCree.js';
import { ErreurDonneeManquante } from '../../../src/modeles/journalMSS/erreurs.js';

describe('Un événement de nouveau service créé', () => {
  const hacheEnMajuscules = { hacheSha256: (valeur) => valeur?.toUpperCase() };

  it("chiffre l'identifiant du service qui lui est donné", () => {
    const evenement = new EvenementNouveauServiceCree(
      { idService: 'abc', idUtilisateur: 'def', versionService: 'v1' },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON().donnees.idService).to.be('ABC');
  });

  it("chiffre l'identifiant utilisateur qui lui est donné", () => {
    const evenement = new EvenementNouveauServiceCree(
      { idService: 'abc', idUtilisateur: 'def', versionService: 'v1' },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON().donnees.idUtilisateur).to.be('DEF');
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementNouveauServiceCree(
      { idService: 'abc', idUtilisateur: 'def', versionService: 'v1' },
      { date: '17/11/2022', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).to.eql({
      type: 'NOUVEAU_SERVICE_CREE',
      donnees: { idService: 'ABC', idUtilisateur: 'DEF', versionService: 'v1' },
      date: '17/11/2022',
    });
  });

  it.each(['idUtilisateur', 'idService', 'versionService'])(
    'exige que %s soit renseigné',
    (proprieteRequise) => {
      const donneesTest = {
        idService: 'S1',
        idUtilisateur: 'U1',
        versionService: 'v1',
      };
      delete donneesTest[proprieteRequise];
      try {
        new EvenementNouveauServiceCree(donneesTest, {
          adaptateurChiffrement: hacheEnMajuscules,
        });

        expect().fail(
          Error("L'instanciation de l'événement aurait dû lever une exception")
        );
      } catch (e) {
        expect(e).to.be.an(ErreurDonneeManquante);
      }
    }
  );
});
