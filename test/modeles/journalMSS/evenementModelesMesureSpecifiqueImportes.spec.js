const expect = require('expect.js');
const {
  ErreurDonneeManquante,
} = require('../../../src/modeles/journalMSS/erreurs');
const EvenementModelesMesureSpecifiqueImportes = require('../../../src/modeles/journalMSS/evenementModelesMesureSpecifiqueImportes');

describe('Un événement de modèles de mesure spécifique importés', () => {
  const hacheEnMajuscules = { hacheSha256: (valeur) => valeur?.toUpperCase() };

  it("chiffre l'identifiant de l'utilisateur qui lui est donné", () => {
    const evenement = new EvenementModelesMesureSpecifiqueImportes(
      {
        idUtilisateur: 'abc',
        nbModelesMesureSpecifiqueImportes: 42,
      },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.donnees.idUtilisateur).to.be('ABC');
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementModelesMesureSpecifiqueImportes(
      {
        idUtilisateur: 'abc',
        nbModelesMesureSpecifiqueImportes: 42,
      },
      { date: '19/08/2025', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).to.eql({
      type: 'MODELES_MESURE_SPECIFIQUE_IMPORTES',
      donnees: {
        idUtilisateur: 'ABC',
        nbModelesMesureSpecifiqueImportes: 42,
      },
      date: '19/08/2025',
    });
  });

  it("exige que l'identifiant de l'utilisateur soit renseigné", () => {
    expect(
      () =>
        new EvenementModelesMesureSpecifiqueImportes({
          nbModelesMesureSpecifiqueImportes: 42,
        })
    ).to.throwError((e) => {
      expect(e).to.be.an(ErreurDonneeManquante);
    });
  });

  it('exige que le nombre de modèles de mesure spécifique importés soit renseignée', () => {
    expect(
      () =>
        new EvenementModelesMesureSpecifiqueImportes({ idUtilisateur: 'abc' })
    ).to.throwError((e) => {
      expect(e).to.be.an(ErreurDonneeManquante);
    });
  });
});
