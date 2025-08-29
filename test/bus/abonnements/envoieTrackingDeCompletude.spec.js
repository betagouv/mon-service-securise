import expect from 'expect.js';
import { unService } from '../../constructeurs/constructeurService.js';
import { unAdaptateurTracking } from '../../constructeurs/constructeurAdaptateurTracking.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { unDepotDeDonneesServices } from '../../constructeurs/constructeurDepotDonneesServices.js';
import { bouchonneMesures } from '../../constructeurs/constructeurMesures.js';
import { envoieTrackingCompletude } from '../../../src/bus/abonnements/envoieTrackingDeCompletude.js';

describe("L'abonnement qui envoie au tracking les informations de complétude", () => {
  let adaptateurTracking;
  let depotDonnees;

  beforeEach(() => {
    adaptateurTracking = unAdaptateurTracking().construis();
    depotDonnees = unDepotDeDonneesServices().construis();
  });

  it('envoie les données de complétude au tracking', async () => {
    let donneesDeTracking;
    adaptateurTracking.envoieTrackingCompletudeService = async (
      destinataire,
      donneesEvenement
    ) => {
      donneesDeTracking = { destinataire, donneesEvenement };
    };
    depotDonnees.services = async () => [
      unService()
        .avecNContributeurs(3)
        .avecMesures(bouchonneMesures().avecUneCompletude(100, 18).construis())
        .construis(),
    ];

    const utilisateur = unUtilisateur()
      .avecEmail('jean.dupont@mail.fr')
      .construis();

    await envoieTrackingCompletude({ adaptateurTracking, depotDonnees })({
      utilisateur,
    });

    expect(donneesDeTracking).to.eql({
      destinataire: 'jean.dupont@mail.fr',
      donneesEvenement: {
        nombreServices: 1,
        nombreMoyenContributeurs: 3,
        tauxCompletudeMoyenTousServices: 18,
      },
    });
  });

  it("lève une exception s'il ne reçoit pas d'utilisateur", async () => {
    try {
      await envoieTrackingCompletude({ adaptateurTracking, depotDonnees })({
        utilisateur: null,
      });
      expect().fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect(e.message).to.be(
        "Impossible d'envoyer les données de complétude à Brevo sans avoir l'utilisateur en paramètre."
      );
    }
  });
});
