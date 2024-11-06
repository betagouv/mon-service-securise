const expect = require('expect.js');
const { unService } = require('../../constructeurs/constructeurService');
const {
  relieServiceEtSuperviseurs,
} = require('../../../src/bus/abonnements/relieServiceEtSuperviseurs');

describe("L'abonné en charge de relier un nouveau service à ses superviseurs", () => {
  it('délègue la création du lien au service de supervision', async () => {
    let serviceRecu;
    const serviceSupervision = {
      relieServiceEtSuperviseurs: async (service) => {
        serviceRecu = service;
      },
    };

    const service = unService().avecId('S1').construis();

    await relieServiceEtSuperviseurs({ serviceSupervision })({
      service,
    });

    expect(serviceRecu.id).to.eql('S1');
  });
});
