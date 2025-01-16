const expect = require('expect.js');
const { unService } = require('../../constructeurs/constructeurService');
const {
  modifieLienServiceEtSuperviseurs,
} = require('../../../src/bus/abonnements/modifieLienServiceEtSuperviseurs');
const uneDescriptionValide = require('../../constructeurs/constructeurDescriptionService');

describe("L'abonné en charge de modifier le lien entre un service modifié et ses superviseurs", () => {
  let serviceSupervision;

  beforeEach(() => {
    serviceSupervision = {
      modifieLienServiceEtSuperviseurs: async () => {},
    };
  });

  it("ne fait rien si le SIRET n'a pas changé", async () => {
    let serviceAppele = false;

    serviceSupervision.modifieLienServiceEtSuperviseurs = async () => {
      serviceAppele = true;
    };

    const service = unService()
      .avecOrganisationResponsable({
        siret: 'unSIRET',
      })
      .construis();
    const ancienneDescription = uneDescriptionValide()
      .deLOrganisation({ siret: 'unSIRET' })
      .construis();

    await modifieLienServiceEtSuperviseurs({
      serviceSupervision,
    })({
      service,
      ancienneDescription,
    });

    expect(serviceAppele).to.be(false);
  });

  it('délègue au service de supervision la modification du lien si le SIRET a changé', async () => {
    let serviceRecu;

    serviceSupervision.modifieLienServiceEtSuperviseurs = async (service) => {
      serviceRecu = service;
    };

    const service = unService()
      .avecId('S1')
      .avecOrganisationResponsable({
        siret: 'unSIRET',
      })
      .construis();
    const ancienneDescription = uneDescriptionValide()
      .deLOrganisation({ siret: 'unAutreSIRET' })
      .construis();

    await modifieLienServiceEtSuperviseurs({
      serviceSupervision,
    })({
      service,
      ancienneDescription,
    });

    expect(serviceRecu.id).to.be('S1');
  });
});
