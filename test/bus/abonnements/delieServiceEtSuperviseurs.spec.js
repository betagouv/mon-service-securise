const expect = require('expect.js');
const {
  delieServiceEtSuperviseurs,
} = require('../../../src/bus/abonnements/delieServiceEtSuperviseurs');

describe("L'abonné en charge de délier un service supprimé à ses superviseurs", () => {
  it('délègue la suppression du lien au service de supervision', async () => {
    let idServiceRecu;
    const serviceSupervision = {
      delieServiceEtSuperviseurs: async (idService) => {
        idServiceRecu = idService;
      },
    };

    await delieServiceEtSuperviseurs({ serviceSupervision })({
      idService: 'S1',
    });

    expect(idServiceRecu).to.be('S1');
  });
});
