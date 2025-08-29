import expect from 'expect.js';
import * as objetGetMesures from '../../../src/modeles/objetsApi/objetGetMesures.js';
import { unService } from '../../constructeurs/constructeurService.js';

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
