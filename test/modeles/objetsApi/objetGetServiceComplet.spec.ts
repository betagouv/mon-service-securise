import { unServiceV2 } from '../../constructeurs/constructeurService.js';
import { ObjetGetServiceComplet } from '../../../src/modeles/objetsApi/objetGetServiceComplet.ts';
import { uneAutorisation } from '../../constructeurs/constructeurAutorisation.js';
import {
  Permissions,
  Rubriques,
} from '../../../src/modeles/autorisations/gestionDroits.ts';

describe("Sur demande de la représentation API complète d'un service", () => {
  describe('concernant la description du service', () => {
    it('retourne la représentation JSON de la description', () => {
      const serviceV2 = unServiceV2().avecNomService('Mon service').construis();

      const donnees = new ObjetGetServiceComplet(
        serviceV2,
        uneAutorisation().deProprietaire('U1', 'S1').construis()
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
});
