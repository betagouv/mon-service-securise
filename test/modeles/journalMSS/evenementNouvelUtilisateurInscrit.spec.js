const expect = require('expect.js');
const EvenementNouvelUtilisateurInscrit = require('../../../src/modeles/journalMSS/evenementNouvelUtilisateurInscrit');
const { ErreurIdentifiantUtilisateurManquant } = require('../../../src/modeles/journalMSS/erreurs');

describe('Un événement de nouvel utilisateur inscrit', () => {
  const hacheEnMajuscules = { hacheSha256: (valeur) => valeur?.toUpperCase() };

  it("chiffre l'identifiant de l'utilisateur qui lui est donné", () => {
    const evenement = new EvenementNouvelUtilisateurInscrit(
      { idUtilisateur: 'abc' },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON().donnees.idUtilisateur).to.be('ABC');
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementNouvelUtilisateurInscrit(
      { idUtilisateur: 'abc' },
      { date: '17/11/2022', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).to.eql({
      type: 'NOUVEL_UTILISATEUR_INSCRIT',
      donnees: { idUtilisateur: 'ABC' },
      date: '17/11/2022',
    });
  });

  it("exige que l'identifiant utilisateur soit renseigné", (done) => {
    try {
      new EvenementNouvelUtilisateurInscrit(
        { },
        { adaptateurChiffrement: hacheEnMajuscules }
      );

      done(Error("L'instanciation de l'événement aurait dû lever une exception"));
    } catch (e) {
      expect(e).to.be.an(ErreurIdentifiantUtilisateurManquant);
      done();
    }
  });
});
