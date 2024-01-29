const expect = require('expect.js');
const BusEvenements = require('../../../src/bus/busEvenements');
const EvenementMesuresServiceModifiees = require('../../../src/bus/evenementMesuresServiceModifiees');
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
const { bouchonneMesures } = require('../../constructeurs/constructeurMesures');
const {
  envoieTrackingCompletude,
} = require('../../../src/bus/abonnements/envoieTrackingDeCompletude');

describe("L'abonnement qui envoie au tracking les informations de complétude", () => {
  let bus;
  let adaptateurTracking;
  let depotDonnees;

  beforeEach(() => {
    adaptateurTracking = unAdaptateurTracking().construis();
    depotDonnees = unDepotDeDonneesServices().construis();
    bus = new BusEvenements({
      adaptateurGestionErreur: {
        logueErreur: (e) => {
          throw e;
        },
      },
    });
  });

  it('envoie les données de complétude au tracking', async () => {
    let donneesDeTracking;
    adaptateurTracking.envoieTrackingCompletudeService = async (
      destinataire,
      donneesEvenement
    ) => {
      donneesDeTracking = { destinataire, donneesEvenement };
    };
    depotDonnees.homologations = async () => [
      unService()
        .avecNContributeurs(3)
        .avecMesures(bouchonneMesures().avecUneCompletude(100, 18).construis())
        .construis(),
    ];

    bus.abonne(
      EvenementMesuresServiceModifiees,
      envoieTrackingCompletude({ adaptateurTracking, depotDonnees })
    );

    await bus.publie(
      new EvenementMesuresServiceModifiees({
        utilisateur: unUtilisateur()
          .avecEmail('jean.dupont@mail.fr')
          .construis(),
        service: unService().construis(),
      })
    );

    expect(donneesDeTracking).to.eql({
      destinataire: 'jean.dupont@mail.fr',
      donneesEvenement: {
        nombreServices: 1,
        nombreMoyenContributeurs: 3,
        tauxCompletudeMoyenTousServices: 18,
      },
    });
  });
});
