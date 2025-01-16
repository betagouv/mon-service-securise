const expect = require('expect.js');
const {
  ErreurIdentifiantServiceManquant,
} = require('../../../src/modeles/journalMSS/erreurs');
const EvenementServiceSupprime = require('../../../src/modeles/journalMSS/evenementServiceSupprime');

describe('Un événement de service supprimé', () => {
  const hacheEnMajuscules = { hacheSha256: (valeur) => valeur?.toUpperCase() };

  it("chiffre l'identifiant du service qui lui est donné", () => {
    const evenement = new EvenementServiceSupprime(
      { idService: 'abc' },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON().donnees.idService).to.be('ABC');
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementServiceSupprime(
      { idService: 'abc' },
      { date: 'Une date', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).to.eql({
      type: 'SERVICE_SUPPRIME',
      donnees: {
        idService: 'ABC',
      },
      date: 'Une date',
    });
  });

  it("exige que l'identifiant du service soit renseigné", (done) => {
    try {
      new EvenementServiceSupprime(
        {},
        { adaptateurChiffrement: hacheEnMajuscules }
      );
      done("L'instanciation de l'événement aurait dû lever une exception");
    } catch (e) {
      expect(e).to.be.an(ErreurIdentifiantServiceManquant);
      done();
    }
  });
});
