const expect = require('expect.js');
const {
  fabriqueInscriptionUtilisateur,
} = require('../../src/modeles/inscriptionUtilisateur');
const SourceAuthentification = require('../../src/modeles/sourceAuthentification');

describe("Le service d'inscription d'un utilisateur", () => {
  it("valide l'acceptation des CGU si l'utilisateur les a acceptées", async () => {
    let validationEffectuee = false;
    const adaptateurMail = {
      creeContact: async () => {},
    };
    const adaptateurTracking = {
      envoieTrackingInscription: async () => {},
    };
    const depotDonnees = {
      nouvelUtilisateur: async () => ({
        email: 'jean.dujardin@beta.gouv.fr',
        cguAcceptees: true,
      }),
      valideAcceptationCGUPourUtilisateur: async () => {
        validationEffectuee = true;
      },
    };
    const inscriptionUtilisateur = fabriqueInscriptionUtilisateur({
      adaptateurMail,
      adaptateurTracking,
      depotDonnees,
    });

    await inscriptionUtilisateur.inscrisUtilisateur(
      {},
      SourceAuthentification.AGENT_CONNECT
    );

    expect(validationEffectuee).to.be(true);
  });
});
