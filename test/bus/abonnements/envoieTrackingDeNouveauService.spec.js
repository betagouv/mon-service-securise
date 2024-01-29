const expect = require('expect.js');
const { unService } = require('../../constructeurs/constructeurService');
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
    depotDonnees.homologations = async () => [
      unService().construis(),
      unService().construis(),
      unService().construis(),
    ];

    await envoieTrackingDeNouveauService({ adaptateurTracking, depotDonnees })({
      utilisateur: unUtilisateur().avecEmail('jean.dupont@mail.fr').construis(),
    });

    expect(donneesDeTracking).to.eql({
      destinataire: 'jean.dupont@mail.fr',
      donneesEvenement: { nombreServices: 3 },
    });
  });
});
