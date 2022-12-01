const expect = require('expect.js');
const { EvenementNouveauServiceCree } = require('../../../src/modeles/journalMSS/evenements');
const { ErreurIdentifiantUtilisateurManquant } = require('../../../src/modeles/journalMSS/erreurs');

describe('Un événement de nouveau service créé', () => {
  const hacheEnMajuscules = { hacheSha256: (valeur) => valeur.toUpperCase() };

  it("chiffre l'identifiant utilisateur qui lui est donné", () => {
    const evenement = new EvenementNouveauServiceCree(
      { idUtilisateur: 'abc' },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON().donnees.idUtilisateur).to.be('ABC');
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementNouveauServiceCree(
      { idUtilisateur: 'abc' },
      { date: '17/11/2022', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).to.eql({
      type: 'NOUVEAU_SERVICE_CREE',
      donnees: { idUtilisateur: 'ABC' },
      date: '17/11/2022',
    });
  });

  it("exige que l'identifiant utilisateur associé au service soit renseigné", (done) => {
    try {
      new EvenementNouveauServiceCree({});
      done(Error("L'instanciation de l'événement aurait dû lever une exception"));
    } catch (e) {
      expect(e).to.be.an(ErreurIdentifiantUtilisateurManquant);
      done();
    }
  });
});
