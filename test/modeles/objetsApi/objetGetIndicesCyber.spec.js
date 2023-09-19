const expect = require('expect.js');

const Service = require('../../../src/modeles/service');
const objetGetIndicesCyber = require('../../../src/modeles/objetsApi/objetGetIndicesCyber');
const {
  uneAutorisation,
} = require('../../constructeurs/constructeurAutorisation');
const {
  Rubriques,
  Permissions,
} = require('../../../src/modeles/autorisations/gestionDroits');

const { SECURISER } = Rubriques;
const { LECTURE } = Permissions;

describe("L'objet d'API de `GET /services/indices-cyber`", () => {
  let unService;
  let unAutreService;
  const autorisations = [
    uneAutorisation()
      .deCreateurDeService('999', '123')
      .avecDroits({ [SECURISER]: LECTURE })
      .construis(),
    uneAutorisation()
      .deCreateurDeService('999', '456')
      .avecDroits({ [SECURISER]: LECTURE })
      .construis(),
  ];

  beforeEach(() => {
    unService = new Service({ id: '123' });
    unService.indiceCyber = () => ({ total: 3.51 });

    unAutreService = new Service({ id: '456' });
    unAutreService.indiceCyber = () => ({ total: 5 });
  });

  it('fournit les données nécessaires', () => {
    expect(
      objetGetIndicesCyber.donnees([unService], autorisations).services
    ).to.eql([{ id: '123', indiceCyber: 3.5 }]);
  });

  it("ne fournit pas l'indice cyber si les permissions ne sont pas suffisantes", () => {
    const autorisationSansSecuriser = uneAutorisation()
      .deCreateurDeService('999', '123')
      .avecDroits({})
      .construis();

    const { services } = objetGetIndicesCyber.donnees(
      [unService],
      [autorisationSansSecuriser]
    );
    expect(services[0].indiceCyber).to.be(undefined);
  });

  it('fournit les données de résumé des services', () => {
    unService.indiceCyber = () => ({ total: 4 });
    unAutreService.indiceCyber = () => ({ total: 5 });

    const services = [unService, unAutreService];
    expect(objetGetIndicesCyber.donnees(services, autorisations).resume).to.eql(
      {
        indiceCyberMoyen: '4.5',
      }
    );
  });

  it('ne compte pas les indices cyber nuls dans le calcul de la moyenne', () => {
    unService.indiceCyber = () => ({ total: 4 });
    unAutreService.indiceCyber = () => ({ total: 0 });

    const services = [unService, unAutreService];
    expect(
      objetGetIndicesCyber.donnees(services, autorisations).resume
        .indiceCyberMoyen
    ).to.be('4.0');
  });

  it('ne compte pas les indices cyber lorsque la permission est insuffisante', () => {
    unService.indiceCyber = () => ({ total: 4 });
    unAutreService.indiceCyber = () => ({ total: 2 });

    const services = [unService, unAutreService];
    const autorisationsSansPermission = [
      uneAutorisation()
        .deCreateurDeService('999', unService.id)
        .avecDroits({ [SECURISER]: LECTURE })
        .construis(),
      uneAutorisation()
        .deCreateurDeService('999', unAutreService.id)
        .avecDroits({})
        .construis(),
    ];
    expect(
      objetGetIndicesCyber.donnees(services, autorisationsSansPermission).resume
        .indiceCyberMoyen
    ).to.be('4.0');
  });

  it("donne une valeur vide pour l'indice cyber moyen quand la moyenne n'est pas calculable", () => {
    unService.indiceCyber = () => ({ total: 0 });
    unAutreService.indiceCyber = () => ({ total: 0 });

    const services = [unService, unAutreService];
    expect(
      objetGetIndicesCyber.donnees(services, autorisations).resume
        .indiceCyberMoyen
    ).to.be('-');
  });
});
