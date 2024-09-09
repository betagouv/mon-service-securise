const expect = require('expect.js');
const {
  unAdaptateurTracking,
} = require('../../constructeurs/constructeurAdaptateurTracking');
const {
  unUtilisateur,
} = require('../../constructeurs/constructeurUtilisateur');
const {
  unDepotDeDonneesServices,
} = require('../../constructeurs/constructeurDepotDonneesServices');
const {
  envoieTrackingDeConnexionUtilisateur,
} = require('../../../src/bus/abonnements/envoieTrackingDeConnexionUtilisateur');

describe("L'abonnement qui envoie au tracking la connexion de l'utilisateur", () => {
  let adaptateurTracking;
  let depotDonnees;

  beforeEach(() => {
    adaptateurTracking = unAdaptateurTracking().construis();
    depotDonnees = unDepotDeDonneesServices().construis();
  });

  it("lève une exception s'il ne reçoit pas d'id utilisateur", async () => {
    try {
      await envoieTrackingDeConnexionUtilisateur({
        adaptateurTracking,
        depotDonnees,
      })({
        idUtilisateur: null,
      });
      expect().fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect(e.message).to.be(
        "Impossible d'envoyer le nombre de services d'un utilisateur à Brevo sans avoir l'identifiant utilisateur en paramètre."
      );
    }
  });

  it("envoie le nombre de services de l'utilisateur au tracking", async () => {
    let donneesPassees = {};
    adaptateurTracking.envoieTrackingConnexion = async (
      destinataire,
      donneesEvenement
    ) => {
      donneesPassees = { destinataire, donneesEvenement };
      return Promise.resolve();
    };
    depotDonnees.services = async () => [{ id: '123' }];
    depotDonnees.utilisateur = async () =>
      unUtilisateur()
        .avecId('456')
        .avecEmail('jean.dupont@mail.fr')
        .construis();

    await envoieTrackingDeConnexionUtilisateur({
      adaptateurTracking,
      depotDonnees,
    })({
      idUtilisateur: '456',
    });

    expect(donneesPassees).to.eql({
      destinataire: 'jean.dupont@mail.fr',
      donneesEvenement: {
        nombreServices: 1,
      },
    });
  });
});
