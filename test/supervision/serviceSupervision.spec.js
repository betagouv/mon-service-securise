const expect = require('expect.js');
const ServiceSupervision = require('../../src/supervision/serviceSupervision');
const { unService } = require('../constructeurs/constructeurService');

describe('Le service de supervision', () => {
  let adaptateurSupervision;
  let depotDonnees;
  let serviceSupervision;

  beforeEach(() => {
    adaptateurSupervision = {
      relieSuperviseursAService: async () => {},
      delieServiceDesSuperviseurs: async () => {},
    };
    depotDonnees = {
      lisSuperviseurs: async () => {},
    };
    serviceSupervision = new ServiceSupervision({
      depotDonnees,
      adaptateurSupervision,
    });
  });

  it("jette une erreur s'il n'est pas instancié avec les bons adaptateurs", () => {
    expect(() => new ServiceSupervision({})).to.throwError((e) => {
      expect(e.message).to.be(
        "Impossible d'instancier le service de supervision sans ses dépendances"
      );
    });
  });

  describe('sur demande de liaison entre un service et des superviseurs', () => {
    it('délègue au dépôt la lecture des superviseurs concernés', async () => {
      let siretRecu;
      depotDonnees.lisSuperviseurs = async (siret) => {
        siretRecu = siret;
        return [];
      };
      const service = unService()
        .avecOrganisationResponsable({ siret: '12345' })
        .construis();

      await serviceSupervision.relieServiceEtSuperviseurs(service);

      expect(siretRecu).to.be('12345');
    });

    it("délègue à l'adaptateur la création du lien", async () => {
      let idsSuperviseurRecus;
      let serviceRecu;
      adaptateurSupervision.relieSuperviseursAService = async (
        service,
        idsSuperviseurs
      ) => {
        idsSuperviseurRecus = idsSuperviseurs;
        serviceRecu = service;
      };

      depotDonnees.lisSuperviseurs = async () => ['US1'];

      const service = unService()
        .avecOrganisationResponsable({ siret: '12345' })
        .avecId('S1')
        .construis();

      await serviceSupervision.relieServiceEtSuperviseurs(service);

      expect(idsSuperviseurRecus).to.eql(['US1']);
      expect(serviceRecu).to.be(service);
    });

    it("n'appelle pas l'adaptateur si aucun superviseur n'est concerné par le service", async () => {
      let supervisionAppelee = false;
      adaptateurSupervision.relieSuperviseursAService = async () => {
        supervisionAppelee = true;
      };

      depotDonnees.lisSuperviseurs = async () => [];

      const service = unService().construis();

      await serviceSupervision.relieServiceEtSuperviseurs(service);

      expect(supervisionAppelee).to.be(false);
    });
  });

  describe('sur demande de suppression du lien entre un service et des superviseurs', () => {
    it("délègue à l'adaptateur la suppression du lien", async () => {
      let idServiceRecu;
      adaptateurSupervision.delieServiceDesSuperviseurs = async (idService) => {
        idServiceRecu = idService;
      };

      await serviceSupervision.delieServiceEtSuperviseurs('S1');

      expect(idServiceRecu).to.be('S1');
    });
  });

  describe('sur demande de modification du lien entre un service et des superviseurs', () => {
    it("appele successivement les méthodes de suppression et d'ajout de lien", async () => {
      let idServiceRecuParSuppression;
      let serviceRecuParAjout;
      serviceSupervision.delieServiceEtSuperviseurs = async (idService) => {
        idServiceRecuParSuppression = idService;
      };
      serviceSupervision.relieServiceEtSuperviseurs = async (service) => {
        serviceRecuParAjout = service;
      };

      const service = unService().avecId('S1').construis();

      await serviceSupervision.modifieLienServiceEtSuperviseurs(service);

      expect(idServiceRecuParSuppression).to.be('S1');
      expect(serviceRecuParAjout.id).to.be('S1');
    });
  });

  describe("sur demande de génération de l'URL de supervision", () => {
    it("délègue la génération à l'adaptateur de supervision", () => {
      let idRecu;
      adaptateurSupervision.genereURLSupervision = (idSuperviseur) => {
        idRecu = idSuperviseur;
        return 'URL1';
      };

      const url = serviceSupervision.genereURLSupervision('S1');

      expect(idRecu).to.be('S1');
      expect(url).to.be('URL1');
    });
  });
});
