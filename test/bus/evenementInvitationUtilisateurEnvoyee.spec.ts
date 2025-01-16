const expect = require('expect.js');
const EvenementNouvelleConnexionUtilisateur = require('../../src/bus/evenementNouvelleConnexionUtilisateur');

describe("L'événement `EvenementInvitationUtilisateurEnvoyee", () => {
  it("lève une exception s'il est instancié sans id utilisateur destinataire", () => {
    expect(
      () =>
        new EvenementNouvelleConnexionUtilisateur({
          idUtilisateurDestinataire: null,
          idUtilisateurEmetteur: 'E1',
        })
    ).to.throwError();
  });

  it("lève une exception s'il est instancié sans id utilisateur emetteur", () => {
    expect(
      () =>
        new EvenementNouvelleConnexionUtilisateur({
          idUtilisateurDestinataire: 'D1',
          idUtilisateurEmetteur: null,
        })
    ).to.throwError();
  });
});
