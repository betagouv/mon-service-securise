import { unServiceV2 } from '../../constructeurs/constructeurService.js';
import { ObjetGetServiceComplet } from '../../../src/modeles/objetsApi/objetGetServiceComplet.ts';
import { uneAutorisation } from '../../constructeurs/constructeurAutorisation.js';
import {
  Permissions,
  Rubriques,
} from '../../../src/modeles/autorisations/gestionDroits.ts';

describe("Sur demande de la représentation API complète d'un service", () => {
  const autorisationProprietaire = uneAutorisation()
    .deProprietaire('U1', 'S1')
    .construis();

  describe('concernant la description du service', () => {
    it('retourne la représentation JSON de la description', () => {
      const serviceV2 = unServiceV2().avecNomService('Mon service').construis();

      const donnees = new ObjetGetServiceComplet(
        serviceV2,
        autorisationProprietaire
      ).donnees();

      expect(donnees.descriptionService!.nomService).toBe('Mon service');
    });

    it('ne retourne pas la représentation de la description si les droits sont insuffisants', () => {
      const serviceV2 = unServiceV2().avecNomService('Mon service').construis();
      const autorisation = uneAutorisation()
        .avecDroits({ [Rubriques.DECRIRE]: Permissions.INVISIBLE })
        .construis();

      const donnees = new ObjetGetServiceComplet(
        serviceV2,
        autorisation
      ).donnees();

      expect(donnees.descriptionService).toBeUndefined();
    });
  });

  describe('concernant la liste des mesures du service', () => {
    it('retourne la représentation JSON des mesures', () => {
      const serviceV2 = unServiceV2().construis();

      const donnees = new ObjetGetServiceComplet(
        serviceV2,
        autorisationProprietaire
      ).donnees();

      expect(donnees.mesures!.mesuresGenerales).toBeDefined();
      expect(donnees.mesures!.mesuresSpecifiques).toBeDefined();
    });

    it('ne retourne pas la représentation des mesures si les droits sont insuffisants', () => {
      const serviceV2 = unServiceV2().avecNomService('Mon service').construis();
      const autorisation = uneAutorisation()
        .avecDroits({ [Rubriques.SECURISER]: Permissions.INVISIBLE })
        .construis();

      const donnees = new ObjetGetServiceComplet(
        serviceV2,
        autorisation
      ).donnees();

      expect(donnees.mesures).toBeUndefined();
    });
  });
});
