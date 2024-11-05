const expect = require('expect.js');
const { unService } = require('../../constructeurs/constructeurService');
const {
  relieServiceEtSuperviseurs,
} = require('../../../src/bus/abonnements/relieServiceEtSuperviseurs');

describe("L'abonné en charge de relier un nouveau service à ses superviseurs", () => {
  let adaptateurSupervision;
  let depotDonnees;

  beforeEach(() => {
    adaptateurSupervision = {
      relieSuperviseursAService: async () => {},
    };
    depotDonnees = {
      lisSuperviseurs: async () => {},
    };
  });

  it('délègue au dépôt la lecture des superviseurs concernés', async () => {
    let siretRecu;
    depotDonnees.lisSuperviseurs = async (siret) => {
      siretRecu = siret;
      return [];
    };
    const service = unService()
      .avecOrganisationResponsable({ siret: '12345' })
      .construis();

    await relieServiceEtSuperviseurs({ depotDonnees, adaptateurSupervision })({
      service,
    });

    expect(siretRecu).to.be('12345');
  });

  it('délègue à la supervision la création du lien entre les superviseurs et le service', async () => {
    let idsSuperviseurRecus;
    let idServiceRecu;
    adaptateurSupervision.relieSuperviseursAService = async (
      idService,
      idsSuperviseurs
    ) => {
      idsSuperviseurRecus = idsSuperviseurs;
      idServiceRecu = idService;
    };

    depotDonnees.lisSuperviseurs = async () => ['US1'];

    const service = unService().avecId('S1').construis();

    await relieServiceEtSuperviseurs({ depotDonnees, adaptateurSupervision })({
      service,
    });

    expect(idsSuperviseurRecus).to.eql(['US1']);
    expect(idServiceRecu).to.be('S1');
  });

  it("n'appelle pas la supervision si aucun superviseur n'est concerné par le service", async () => {
    let supervisionAppelee = false;
    adaptateurSupervision.relieSuperviseursAService = async () => {
      supervisionAppelee = true;
    };

    depotDonnees.lisSuperviseurs = async () => [];

    const service = unService().construis();

    await relieServiceEtSuperviseurs({ depotDonnees, adaptateurSupervision })({
      service,
    });

    expect(supervisionAppelee).to.be(false);
  });
});
