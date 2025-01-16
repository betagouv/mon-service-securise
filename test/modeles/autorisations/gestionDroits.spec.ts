const expect = require('expect.js');
const {
  premiereRouteDisponible,
  Rubriques,
  Permissions,
} = require('../../../src/modeles/autorisations/gestionDroits');
const {
  uneAutorisation,
} = require('../../constructeurs/constructeurAutorisation');

describe('Les fonctions de gestion des droits', () => {
  describe('concernant la première route disponible pour une autorisation', () => {
    it("considère les routes par défaut de MSS en cas d'absence de routes personnalisées", () => {
      const lectureSurRisques = uneAutorisation()
        .avecDroits({ [Rubriques.RISQUES]: Permissions.LECTURE })
        .construis();

      const aucuneRouteEnPlus = [];

      const route = premiereRouteDisponible(
        lectureSurRisques,
        aucuneRouteEnPlus
      );

      expect(route).to.be('/risques');
    });

    it('considère en priorité les routes personnalisées', () => {
      const routePersonnalisee = [
        {
          rubrique: Rubriques.SECURISER,
          niveau: Permissions.ECRITURE,
          route: '/route-en-parametre',
        },
      ];

      const ecritureSurSecuriser = uneAutorisation()
        .avecDroits({ [Rubriques.SECURISER]: Permissions.ECRITURE })
        .construis();

      const route = premiereRouteDisponible(
        ecritureSurSecuriser,
        routePersonnalisee
      );

      expect(route).to.be('/route-en-parametre');
    });
  });
});
