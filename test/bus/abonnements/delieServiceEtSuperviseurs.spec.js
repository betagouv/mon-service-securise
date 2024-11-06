const expect = require('expect.js');
const {
  delieServiceEtSuperviseurs,
} = require('../../../src/bus/abonnements/delieServiceEtSuperviseurs');

describe("L'abonné en charge de délier un service supprimé à ses superviseurs", () => {
  it('délègue à la supervision la suppression du lien entre les superviseurs et le service', async () => {
    let idServiceRecu;
    const adaptateurSupervision = {
      delieServiceDesSuperviseurs: async (idService) => {
        idServiceRecu = idService;
      },
    };

    await delieServiceEtSuperviseurs({ adaptateurSupervision })({
      idService: 'S1',
    });

    expect(idServiceRecu).to.be('S1');
  });
});
