const expect = require('expect.js');
const objetGetMesures = require('../../../src/modeles/objetsApi/objetGetMesures');
const { unService } = require('../../constructeurs/constructeurService');

describe("L'objet d'API de `GET /mesures`", () => {
  it('fait passe-plat avec les mesures enrichies du service', async () => {
    let passePlatEffectue = false;

    const service = unService().construis();
    service.mesures.enrichiesAvecDonneesPersonnalisees = () => {
      passePlatEffectue = true;
    };

    objetGetMesures.donnees(service);

    expect(passePlatEffectue).to.be(true);
  });
});
