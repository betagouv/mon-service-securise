const expect = require('expect.js');
const {
  ErreurDonneeManquante,
} = require('../../../src/modeles/journalMSS/erreurs');
const EvenementServiceRattacheAPrestataire = require('../../../src/modeles/journalMSS/evenementServiceRattacheAPrestataire');

describe('Un événement de service rattaché à un prestataire', () => {
  const hacheEnMajuscules = { hacheSha256: (valeur) => valeur?.toUpperCase() };

  it("chiffre l'identifiant du service qui lui est donné", () => {
    const evenement = new EvenementServiceRattacheAPrestataire(
      { idService: 'abc', codePrestataire: 'PRESTA-1' },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON().donnees.idService).to.be('ABC');
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementServiceRattacheAPrestataire(
      { idService: 'abc', codePrestataire: 'PRESTA-1' },
      { date: 'Une date', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).to.eql({
      type: 'SERVICE_RATTACHE_A_PRESTATAIRE',
      donnees: { idService: 'ABC', codePrestataire: 'PRESTA-1' },
      date: 'Une date',
    });
  });

  it("exige que l'identifiant du service soit renseigné", () => {
    try {
      new EvenementServiceRattacheAPrestataire(
        { codePrestataire: 'PRESTA-1' },
        { adaptateurChiffrement: hacheEnMajuscules }
      );
      expect().fail(
        "L'instanciation de l'événement aurait dû lever une exception"
      );
    } catch (e) {
      expect(e).to.be.an(ErreurDonneeManquante);
    }
  });

  it('exige que le code prestataire soit renseigné', () => {
    try {
      new EvenementServiceRattacheAPrestataire(
        { idService: 'abc' },
        { adaptateurChiffrement: hacheEnMajuscules }
      );
      expect().fail(
        "L'instanciation de l'événement aurait dû lever une exception"
      );
    } catch (e) {
      expect(e).to.be.an(ErreurDonneeManquante);
    }
  });
});
