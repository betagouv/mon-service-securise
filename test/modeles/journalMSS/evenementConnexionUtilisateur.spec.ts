const expect = require('expect.js');
const EvenementConnexionUtilisateur = require('../../../src/modeles/journalMSS/evenementConnexionUtilisateur');
const {
  ErreurIdentifiantUtilisateurManquant,
  ErreurDateDerniereConnexionManquante,
  ErreurDateDerniereConnexionInvalide,
} = require('../../../src/modeles/journalMSS/erreurs');

describe('Un événement de connexion utilisateur', () => {
  const hacheEnMajuscules = { hacheSha256: (valeur) => valeur?.toUpperCase() };

  it("hache l'identifiant de l'utilisateur qui lui est donné", () => {
    const evenement = new EvenementConnexionUtilisateur(
      { idUtilisateur: 'abc', dateDerniereConnexion: '2022-07-07' },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON().donnees.idUtilisateur).to.be('ABC');
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementConnexionUtilisateur(
      { idUtilisateur: 'abc', dateDerniereConnexion: '2022-11-17T13:05:02' },
      { date: '17/11/2022', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).to.eql({
      type: 'CONNEXION_UTILISATEUR',
      donnees: {
        idUtilisateur: 'ABC',
        dateDerniereConnexion: '2022-11-17T13:05:02',
      },
      date: '17/11/2022',
    });
  });

  it("exige que l'identifiant utilisateur soit renseigné", (done) => {
    try {
      new EvenementConnexionUtilisateur(
        { idUtilisateur: null, dateDerniereConnexion: '2022-05-06' },
        { adaptateurChiffrement: hacheEnMajuscules }
      );

      done(
        Error("L'instanciation de l'événement aurait dû lever une exception")
      );
    } catch (e) {
      expect(e).to.be.an(ErreurIdentifiantUtilisateurManquant);
      done();
    }
  });

  it('exige que la date de dernière connexion soit renseignée', (done) => {
    try {
      new EvenementConnexionUtilisateur(
        { idUtilisateur: '123', dateDerniereConnexion: null },
        { adaptateurChiffrement: hacheEnMajuscules }
      );

      done(
        Error("L'instanciation de l'événement aurait dû lever une exception")
      );
    } catch (e) {
      expect(e).to.be.an(ErreurDateDerniereConnexionManquante);
      done();
    }
  });

  it('exige que la date de dernière connexion soit valide', (done) => {
    try {
      new EvenementConnexionUtilisateur(
        { idUtilisateur: '123', dateDerniereConnexion: 'pasValide' },
        { adaptateurChiffrement: hacheEnMajuscules }
      );

      done(
        Error("L'instanciation de l'événement aurait dû lever une exception")
      );
    } catch (e) {
      expect(e).to.be.an(ErreurDateDerniereConnexionInvalide);
      done();
    }
  });
});
