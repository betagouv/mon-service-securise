const expect = require('expect.js');
const {
  ErreurDonneeManquante,
} = require('../../../src/modeles/journalMSS/erreurs');
const EvenementCguAcceptees = require('../../../src/modeles/journalMSS/evenementCguAcceptees');

describe('Un événement de CGU acceptées', () => {
  const hacheEnMajuscules = { hacheSha256: (valeur) => valeur?.toUpperCase() };

  it("hache l'identifiant de l'utilisateur qui lui est donné", () => {
    const evenement = new EvenementCguAcceptees(
      { idUtilisateur: 'abc', cguAcceptees: '1.0' },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON().donnees.idUtilisateur).to.be('ABC');
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementCguAcceptees(
      { idUtilisateur: 'abc', cguAcceptees: '1.0' },
      {
        date: new Date('2025-08-05 15:01:08.975 +0200'),
        adaptateurChiffrement: hacheEnMajuscules,
      }
    );

    expect(evenement.toJSON()).to.eql({
      type: 'CGU_ACCEPTEES',
      donnees: { idUtilisateur: 'ABC', cguAcceptees: '1.0' },
      date: new Date('2025-08-05 15:01:08.975 +0200'),
    });
  });

  it("exige que l'identifiant utilisateur soit renseigné", (done) => {
    try {
      new EvenementCguAcceptees(
        { cguAcceptees: '1.0' },
        { adaptateurChiffrement: hacheEnMajuscules }
      );

      done(
        Error("L'instanciation de l'événement aurait dû lever une exception")
      );
    } catch (e) {
      expect(e).to.be.an(ErreurDonneeManquante);
      done();
    }
  });

  it('exige que la version des CGU acceptées soit renseignée', (done) => {
    try {
      new EvenementCguAcceptees(
        { idUtilisateur: 'U1' },
        { adaptateurChiffrement: hacheEnMajuscules }
      );

      done(
        Error("L'instanciation de l'événement aurait dû lever une exception")
      );
    } catch (e) {
      expect(e).to.be.an(ErreurDonneeManquante);
      done();
    }
  });
});
