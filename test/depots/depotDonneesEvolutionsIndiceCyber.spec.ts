const expect = require('expect.js');
const {
  creeDepot,
} = require('../../src/depots/depotDonneesEvolutionsIndiceCyber');

describe("Le dépôt de données des évolutions d'indice cyber", () => {
  let depotActivitesIndiceCyber;
  let adaptateurPersistance;

  beforeEach(() => {
    adaptateurPersistance = {
      lisDernierIndiceCyber: async () => {},
      sauvegardeNouvelIndiceCyber: async () => {},
    };
    depotActivitesIndiceCyber = creeDepot({
      adaptateurPersistance,
    });
  });

  it("délègue à l'adaptateur persistance la lecture de la dernière activité d'indice cyber d'un service", async () => {
    let idRecu;
    adaptateurPersistance.lisDernierIndiceCyber = async (idService) => {
      idRecu = idService;
    };

    await depotActivitesIndiceCyber.lisDernierIndiceCyber('S1');

    expect(idRecu).to.be('S1');
  });

  it("délègue à l'adaptateur persistance la sauvegarde d'une activité d'indice cyber d'un service", async () => {
    let donneesRecues;
    adaptateurPersistance.sauvegardeNouvelIndiceCyber = async (
      idService,
      indiceCyber,
      indiceCyberPersonnalise,
      mesuresParStatut
    ) => {
      donneesRecues = {
        idService,
        indiceCyber,
        indiceCyberPersonnalise,
        mesuresParStatut,
      };
    };

    await depotActivitesIndiceCyber.sauvegardeNouvelIndiceCyber({
      idService: '123',
      indiceCyber: { total: 1.0 },
      indiceCyberPersonnalise: { total: 2.0 },
      mesuresParStatut: { fait: 2 },
    });

    expect(donneesRecues.idService).to.be('123');
    expect(donneesRecues.indiceCyber.total).to.be(1.0);
    expect(donneesRecues.indiceCyberPersonnalise.total).to.be(2.0);
    expect(donneesRecues.mesuresParStatut).to.eql({ fait: 2 });
  });
});
