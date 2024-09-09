const expect = require('expect.js');
const EvenementNouvelleConnexionUtilisateur = require('../../src/bus/evenementNouvelleConnexionUtilisateur');

describe("L'événement `EvenementNouvelleConnexionUtilisateur", () => {
  it("lève une exception s'il est instancié sans id utilisateur", () => {
    expect(
      () =>
        new EvenementNouvelleConnexionUtilisateur({
          idUtilisateur: null,
          dateDerniereConnexion: '2024-03-25',
        })
    ).to.throwError();
  });

  it("lève une exception s'il est instancié sans date de dernière connexion", () => {
    expect(
      () =>
        new EvenementNouvelleConnexionUtilisateur({
          idUtilisateur: '123',
          dateDerniereConnexion: null,
        })
    ).to.throwError();
  });

  it("lève une exception s'il est instancié avec une date de dernière connexion qui n'est pas une date", () => {
    expect(
      () =>
        new EvenementNouvelleConnexionUtilisateur({
          idUtilisateur: '123',
          dateDerniereConnexion: 'pasUneDate',
        })
    ).to.throwError();
  });
});
