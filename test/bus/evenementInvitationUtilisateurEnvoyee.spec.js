import expect from 'expect.js';
import EvenementNouvelleConnexionUtilisateur from '../../src/bus/evenementNouvelleConnexionUtilisateur.js';

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
