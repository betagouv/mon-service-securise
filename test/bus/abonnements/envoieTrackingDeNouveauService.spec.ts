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
  envoieTrackingDeNouveauService,
} = require('../../../src/bus/abonnements/envoieTrackingDeNouveauService');

describe("L'abonnement qui envoie au tracking les informations d'un nouveau service", () => {
  let adaptateurTracking;
  let depotDonnees;

  beforeEach(() => {
    adaptateurTracking = unAdaptateurTracking().construis();
    depotDonnees = unDepotDeDonneesServices().construis();
  });

  it('envoie les données de tracking liée au service', async () => {
    let donneesDeTracking;
    adaptateurTracking.envoieTrackingNouveauServiceCree = async (
      destinataire,
      donneesEvenement
    ) => {
      donneesDeTracking = { destinataire, donneesEvenement };
    };
    depotDonnees.nombreServices = async () => 3;

    await envoieTrackingDeNouveauService({ adaptateurTracking, depotDonnees })({
      utilisateur: unUtilisateur().avecEmail('jean.dupont@mail.fr').construis(),
    });

    expect(donneesDeTracking).to.eql({
      destinataire: 'jean.dupont@mail.fr',
      donneesEvenement: { nombreServices: 3 },
    });
  });

  it("lève une exception s'il ne reçoit pas d'utilisateur", async () => {
    try {
      await envoieTrackingDeNouveauService({
        adaptateurTracking,
        depotDonnees,
      })({
        utilisateur: null,
      });
      expect().fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect(e.message).to.be(
        "Impossible d'envoyer le nombre de services d'un utilisateur à Brevo sans avoir l'utilisateur en paramètre."
      );
    }
  });
});
