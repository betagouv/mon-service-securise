import { BrouillonService } from '../../src/modeles/brouillonService.js';
import { unUUID } from '../constructeurs/UUID.js';
import { VersionService } from '../../src/modeles/versionService.js';
import Service from '../../src/modeles/service.js';

describe('Un brouillon de Service v2', () => {
  describe('quand il se transforme en données de DescriptionServiceV2', () => {
    it('fournit des données que le Service accepte', () => {
      const b = new BrouillonService(unUUID('b'), { nomService: 'Mairie A' });

      const pourCreationService = b.enDonneesCreationServiceV2();

      Service.valideDonneesCreation(
        pourCreationService.descriptionService,
        VersionService.v2
      );
    });
  });
});
