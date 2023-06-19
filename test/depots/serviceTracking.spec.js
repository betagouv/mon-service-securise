const expect = require('expect.js');
const ServiceTracking = require('../../src/depots/serviceTracking');
const { unService } = require('../constructeurs/constructeurService');
const { bouchonneMesures } = require('../constructeurs/constructeurMesures');
const Referentiel = require('../../src/referentiel');

describe('Le service de tracking des services', () => {
  describe('sur une demande de complétude', () => {
    let referentiel;
    beforeEach(() => {
      referentiel = Referentiel.creeReferentielVide();
    });

    it("retourne la complétude des services de l'utilisateur", async () => {
      const premierService = unService(referentiel)
        .avecMesures(bouchonneMesures().avecUneCompletude(20, 18).construis())
        .construis();
      const secondService = unService(referentiel)
        .avecMesures(bouchonneMesures().avecUneCompletude(100, 18).construis())
        .construis();
      const depotHomologations = {
        homologations: async () => [premierService, secondService],
        nombreMoyenContributeursPourUtilisateur: async () => 2,
      };
      const serviceTracking = ServiceTracking.creeService();

      const completude =
        await serviceTracking.completudeDesServicesPourUtilisateur(
          depotHomologations,
          '111'
        );

      expect(completude).to.eql({
        nbServices: 2,
        nbMoyenContributeurs: 2,
        tauxCompletudeMoyenTousServices: ((18 / 20 + 18 / 100) * 100) / 2,
      });
    });

    it("arrondi le taux à l'entier inférieur", async () => {
      const premierService = unService(referentiel)
        .avecMesures(bouchonneMesures().avecUneCompletude(33, 7).construis())
        .construis();
      const secondService = unService(referentiel)
        .avecMesures(bouchonneMesures().avecUneCompletude(100, 27).construis())
        .construis();
      const depotHomologations = {
        homologations: async () => [premierService, secondService],
        nombreMoyenContributeursPourUtilisateur: async () => 3,
      };
      const serviceTracking = ServiceTracking.creeService();

      const completude =
        await serviceTracking.completudeDesServicesPourUtilisateur(
          depotHomologations,
          'AAA'
        );

      expect(completude.tauxCompletudeMoyenTousServices).to.be(
        Math.floor(((7 / 33 + 27 / 100) * 100) / 2)
      );
    });
  });
});
