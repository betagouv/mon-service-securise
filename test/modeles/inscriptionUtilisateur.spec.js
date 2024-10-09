const expect = require('expect.js');
const {
  fabriqueInscriptionUtilisateur,
} = require('../../src/modeles/inscriptionUtilisateur');
const SourceAuthentification = require('../../src/modeles/sourceAuthentification');
const { ErreurUtilisateurExistant } = require('../../src/erreurs');
const { unUtilisateur } = require('../constructeurs/constructeurUtilisateur');

describe("Le service d'inscription d'utilisateur", () => {
  let depotDonnees;
  let adaptateurMail;
  let adaptateurTracking;

  beforeEach(() => {
    adaptateurMail = { creeContact: async () => {} };
    adaptateurTracking = {
      envoieTrackingInscription: async () => {},
    };
    depotDonnees = {
      metsAJourUtilisateur: async () => {},
      nouvelUtilisateur: async () => {
        throw new ErreurUtilisateurExistant();
      },
      utilisateurAvecEmail: async (email) =>
        email === 'jean.dujardin@beta.gouv.fr'
          ? unUtilisateur()
              .avecId('123')
              .avecEmail(email)
              .quiAEteInvite()
              .construis()
          : undefined,
    };
  });

  it("met à jour les données de l'utilisateur s'il est invité", async () => {
    let donneesRecues;

    depotDonnees.metsAJourUtilisateur = async (id, donnees) => {
      donneesRecues = { id, donnees };
    };
    const serviceInscription = fabriqueInscriptionUtilisateur({
      adaptateurMail,
      adaptateurTracking,
      depotDonnees,
    });

    await serviceInscription.inscrisUtilisateur(
      { email: 'jean.dujardin@beta.gouv.fr' },
      SourceAuthentification.AGENT_CONNECT
    );

    expect(donneesRecues).to.eql({
      id: '123',
      donnees: { email: 'jean.dujardin@beta.gouv.fr' },
    });
  });

  it("envoie un événement de tracking d'inscription pour un invité", async () => {
    let donneesRecues;

    adaptateurTracking.envoieTrackingInscription = async (email) => {
      donneesRecues = email;
    };
    const serviceInscription = fabriqueInscriptionUtilisateur({
      adaptateurMail,
      adaptateurTracking,
      depotDonnees,
    });

    await serviceInscription.inscrisUtilisateur(
      { email: 'jean.dujardin@beta.gouv.fr' },
      SourceAuthentification.AGENT_CONNECT
    );

    expect(donneesRecues).to.be('jean.dujardin@beta.gouv.fr');
  });
});
