import {
  premiereRouteDisponible,
  Rubriques,
  Permissions,
} from '../../../src/modeles/autorisations/gestionDroits.js';
import { uneAutorisation } from '../../constructeurs/constructeurAutorisation.js';
import { unService } from '../../constructeurs/constructeurService.js';
import uneDescriptionValide from '../../constructeurs/constructeurDescriptionService.js';

describe('Les fonctions de gestion des droits', () => {
  describe('concernant la première route disponible pour une autorisation', () => {
    const unServiceAvecDescriptionComplete = unService()
      .avecDescription(uneDescriptionValide().donnees)
      .construis();

    it("considère les routes par défaut de MSS en cas d'absence de routes personnalisées", () => {
      const lectureSurRisques = uneAutorisation()
        .avecDroits({ [Rubriques.RISQUES]: Permissions.LECTURE })
        .construis();

      const aucuneRouteEnPlus = undefined;

      const route = premiereRouteDisponible(
        lectureSurRisques,
        unServiceAvecDescriptionComplete,
        aucuneRouteEnPlus
      );

      expect(route).toBe('/risques');
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
        unServiceAvecDescriptionComplete,
        routePersonnalisee
      );

      expect(route).toBe('/route-en-parametre');
    });

    describe('concernant la première route recommandée', () => {
      it('ne recommande pas la page DÉCRIRE si la description de service est complète', () => {
        const tousLesDroits = uneAutorisation()
          .avecTousDroitsEcriture()
          .construis();

        const aucuneRouteEnPlus = undefined;

        const route = premiereRouteDisponible(
          tousLesDroits,
          unServiceAvecDescriptionComplete,
          aucuneRouteEnPlus
        );

        expect(route).toBe('/mesures');
      });

      it('recommande la page DÉCRIRE si la description de service est incomplète', () => {
        const tousLesDroits = uneAutorisation()
          .avecTousDroitsEcriture()
          .construis();

        const aucuneRouteEnPlus = undefined;

        const unServiceAvecDescriptionIncomplete = unService()
          .avecDescription(uneDescriptionValide().deLOrganisation({}).donnees)
          .construis();

        const route = premiereRouteDisponible(
          tousLesDroits,
          unServiceAvecDescriptionIncomplete,
          aucuneRouteEnPlus
        );

        expect(route).toBe('/descriptionService');
      });
    });
  });
});
