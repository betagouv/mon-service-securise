const expect = require('expect.js');
const { unService } = require('../constructeurs/constructeurService');
const { bouchonneMesures } = require('../constructeurs/constructeurMesures');
const Referentiel = require('../../src/referentiel');
const {
  fabriqueServiceTracking,
} = require('../../src/tracking/serviceTracking');

describe('Le service de tracking des services', () => {
  describe('sur une demande de complétude', () => {
    let referentiel;
    beforeEach(() => {
      referentiel = Referentiel.creeReferentielVide();
    });

    it("retourne la complétude des services de l'utilisateur", async () => {
      const premierService = unService(referentiel)
        .avecMesures(bouchonneMesures().avecUneCompletude(20, 18).construis())
        .avecNContributeurs(2)
        .construis();
      const secondService = unService(referentiel)
        .avecMesures(bouchonneMesures().avecUneCompletude(100, 18).construis())
        .avecNContributeurs(2)
        .construis();
      const depotHomologations = {
        homologations: async () => [premierService, secondService],
      };
      const serviceTracking = fabriqueServiceTracking();

      const completude =
        await serviceTracking.completudeDesServicesPourUtilisateur(
          depotHomologations,
          '111'
        );

      expect(completude).to.eql({
        nombreServices: 2,
        nombreMoyenContributeurs: 2,
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
      const serviceTracking = fabriqueServiceTracking();

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

  describe('sur une demande de nombre moyen de contributeurs', () => {
    let referentiel;
    beforeEach(() => {
      referentiel = Referentiel.creeReferentielVide();
    });

    it("peut retourner le nombre moyen de contributeurs pour les services d'un utilisateur donné", async () => {
      let idUtilisateurRecu;

      const serviceAvec3Contributeurs = unService(referentiel)
        .avecNContributeurs(3)
        .construis();
      const serviceSansContributeur = unService(referentiel).construis();

      const depotHomologations = {
        homologations: async (idUtilisateur) => {
          idUtilisateurRecu = idUtilisateur;
          return [serviceAvec3Contributeurs, serviceSansContributeur];
        },
      };
      const serviceTracking = fabriqueServiceTracking();

      const nbMoyenContributeurs =
        await serviceTracking.nombreMoyenContributeursPourUtilisateur(
          depotHomologations,
          'ABC'
        );

      expect(idUtilisateurRecu).to.be('ABC');
      expect(nbMoyenContributeurs).to.be(1);
    });

    it("reste robuste si il n'y a pas de service", async () => {
      const depotSansHomologations = { homologations: async () => [] };
      const serviceTracking = fabriqueServiceTracking();

      const nbMoyenContributeurs =
        await serviceTracking.nombreMoyenContributeursPourUtilisateur(
          depotSansHomologations,
          'ABC'
        );

      expect(nbMoyenContributeurs).to.be(0);
    });
  });
});
