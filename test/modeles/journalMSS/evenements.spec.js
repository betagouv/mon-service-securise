const expect = require('expect.js');
const { EvenementNouveauServiceCree, EvenementCompletudeServiceModifiee } = require('../../../src/modeles/journalMSS/evenements');
const {
  ErreurIdentifiantServiceManquant,
  ErreurIdentifiantUtilisateurManquant,
  ErreurNombreTotalMesuresManquant,
  ErreurNombreMesuresCompletesManquant,
} = require('../../../src/modeles/journalMSS/erreurs');

const hacheEnMajuscules = { hacheSha256: (valeur) => valeur?.toUpperCase() };

describe('Un événement de nouveau service créé', () => {
  it("chiffre l'identifiant du service qui lui est donné", () => {
    const evenement = new EvenementNouveauServiceCree(
      { idService: 'abc', idUtilisateur: 'def' },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON().donnees.idService).to.be('ABC');
  });

  it("chiffre l'identifiant utilisateur qui lui est donné", () => {
    const evenement = new EvenementNouveauServiceCree(
      { idService: 'abc', idUtilisateur: 'def' },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON().donnees.idUtilisateur).to.be('DEF');
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementNouveauServiceCree(
      { idService: 'abc', idUtilisateur: 'def' },
      { date: '17/11/2022', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).to.eql({
      type: 'NOUVEAU_SERVICE_CREE',
      donnees: { idService: 'ABC', idUtilisateur: 'DEF' },
      date: '17/11/2022',
    });
  });

  it("exige que l'identifiant utilisateur associé au service soit renseigné", (done) => {
    try {
      new EvenementNouveauServiceCree(
        { idService: 'ABC' },
        { adaptateurChiffrement: hacheEnMajuscules }
      );

      done(Error("L'instanciation de l'événement aurait dû lever une exception"));
    } catch (e) {
      expect(e).to.be.an(ErreurIdentifiantUtilisateurManquant);
      done();
    }
  });

  it("exige que l'identifiant du service créé soit renseigné", (done) => {
    try {
      new EvenementNouveauServiceCree(
        { idUtilisateur: 'DEF' },
        { adaptateurChiffrement: hacheEnMajuscules }
      );
      done(Error("L'instanciation de l'événement aurait dû lever une exception"));
    } catch (e) {
      expect(e).to.be.an(ErreurIdentifiantServiceManquant);
      done();
    }
  });
});

describe('Un événement de complétude modifiée', () => {
  it("chiffre l'identifiant du service qui lui est donné", () => {
    const evenement = new EvenementCompletudeServiceModifiee(
      { idService: 'abc', nombreTotalMesures: 54, nombreMesuresCompletes: 38 },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON().donnees.idService).to.be('ABC');
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementCompletudeServiceModifiee(
      { idService: 'abc', nombreTotalMesures: 54, nombreMesuresCompletes: 38 },
      { date: '17/11/2022', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).to.eql({
      type: 'COMPLETUDE_SERVICE_MODIFIEE',
      donnees: {
        idService: 'ABC',
        nombreTotalMesures: 54,
        nombreMesuresCompletes: 38,
      },
      date: '17/11/2022',
    });
  });

  it("exige que l'identifiant du service soit renseigné", (done) => {
    try {
      new EvenementCompletudeServiceModifiee(
        { nombreTotalMesures: 54, nombreMesuresCompletes: 38 },
        { adaptateurChiffrement: hacheEnMajuscules }
      );

      done(Error("L'instanciation de l'événement aurait dû lever une exception"));
    } catch (e) {
      expect(e).to.be.an(ErreurIdentifiantServiceManquant);
      done();
    }
  });

  it('exige que le nombre total de mesures soit renseigné', (done) => {
    try {
      new EvenementCompletudeServiceModifiee(
        { idService: 'abc', nombreMesuresCompletes: 38 },
        { adaptateurChiffrement: hacheEnMajuscules }
      );

      done(Error("L'instanciation de l'événement aurait dû lever une exception"));
    } catch (e) {
      expect(e).to.be.an(ErreurNombreTotalMesuresManquant);
      done();
    }
  });

  it('exige que le nombre de mesures complètes soit renseigné', (done) => {
    try {
      new EvenementCompletudeServiceModifiee(
        { idService: 'abc', nombreTotalMesures: 54 },
        { adaptateurChiffrement: hacheEnMajuscules }
      );

      done(Error("L'instanciation de l'événement aurait dû lever une exception"));
    } catch (e) {
      expect(e).to.be.an(ErreurNombreMesuresCompletesManquant);
      done();
    }
  });
});
