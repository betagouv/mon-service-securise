const expect = require('expect.js');

const Service = require('../../../src/modeles/service');
const objetGetIndicesCyber = require('../../../src/modeles/objetsApi/objetGetIndicesCyber');

describe("L'objet d'API de `GET /services/indices-cyber`", () => {
  let unService;
  let unAutreService;

  beforeEach(() => {
    unService = new Service({ id: '123' });
    unService.indiceCyber = () => ({ total: 3.51 });

    unAutreService = new Service({ id: '456' });
    unAutreService.indiceCyber = () => ({ total: 5 });
  });

  it('fournit les données nécessaires', () => {
    expect(objetGetIndicesCyber.donnees([unService]).services).to.eql([
      { id: '123', indiceCyber: 3.5 },
    ]);
  });

  it('fournit les données de résumé des services', () => {
    unService.indiceCyber = () => ({ total: 4 });
    unAutreService.indiceCyber = () => ({ total: 5 });

    const services = [unService, unAutreService];
    expect(objetGetIndicesCyber.donnees(services).resume).to.eql({
      indiceCyberMoyen: '4.5',
    });
  });

  it('ne compte pas les indices cyber nuls dans le calcul de la moyenne', () => {
    unService.indiceCyber = () => ({ total: 4 });
    unAutreService.indiceCyber = () => ({ total: 0 });

    const services = [unService, unAutreService];
    expect(
      objetGetIndicesCyber.donnees(services).resume.indiceCyberMoyen
    ).to.be('4.0');
  });

  it("donne une valeur vide pour l'indice cyber moyen quand la moyenne n'est pas calculable", () => {
    unService.indiceCyber = () => ({ total: 0 });
    unAutreService.indiceCyber = () => ({ total: 0 });

    const services = [unService, unAutreService];
    expect(
      objetGetIndicesCyber.donnees(services).resume.indiceCyberMoyen
    ).to.be('-');
  });
});
