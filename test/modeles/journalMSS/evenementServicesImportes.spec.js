const expect = require('expect.js');
const EvenementServicesImportes = require('../../../src/modeles/journalMSS/evenementServicesImportes');
const {
  ErreurIdentifiantUtilisateurManquant,
  ErreurNombreServicesImportes,
} = require('../../../src/modeles/journalMSS/erreurs');

describe('Un événement de services importés', () => {
  const hacheEnMajuscules = { hacheSha256: (valeur) => valeur?.toUpperCase() };

  it("chiffre l'identifiant de l'utilisateur qui lui est donné", () => {
    const evenement = new EvenementServicesImportes(
      {
        idUtilisateur: 'abc',
        nbServicesImportes: 42,
      },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.donnees.idUtilisateur).to.be('ABC');
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementServicesImportes(
      {
        idUtilisateur: 'abc',
        nbServicesImportes: 42,
      },
      { date: '27/03/2023', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).to.eql({
      type: 'SERVICES_IMPORTES',
      donnees: {
        idUtilisateur: 'ABC',
        nbServicesImportes: 42,
      },
      date: '27/03/2023',
    });
  });

  it("exige que l'identifiant du service soit renseigné", () => {
    expect(() => new EvenementServicesImportes({})).to.throwError((e) => {
      expect(e).to.be.an(ErreurIdentifiantUtilisateurManquant);
    });
  });

  it('exige que le nombre de services importés soit renseignée', () => {
    expect(
      () => new EvenementServicesImportes({ idUtilisateur: 'abc' })
    ).to.throwError((e) => {
      expect(e).to.be.an(ErreurNombreServicesImportes);
    });
  });
});
