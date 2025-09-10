import {
  BrouillonService,
  ProprietesBrouillonService,
} from '../../src/modeles/brouillonService.js';
import { unUUID } from '../constructeurs/UUID.js';
import { VersionService } from '../../src/modeles/versionService.js';
import Service from '../../src/modeles/service.js';

describe('Un brouillon de Service v2', () => {
  describe('quand il se transforme en données de DescriptionServiceV2', () => {
    it('fournit des données que le Service accepte', () => {
      const b = new BrouillonService(unUUID('b'), {
        nomService: 'Mairie A',
        siret: 'un siret',
      });

      const pourCreationService = b.enDonneesCreationServiceV2();

      expect(() =>
        Service.valideDonneesCreation(
          pourCreationService.descriptionService,
          VersionService.v2
        )
      ).not.toThrowError();
    });
  });

  describe('sur demande de mise à jour de propriété', () => {
    it.each(['siret'])('mets à jour la propriété %s', (nomPropriete) => {
      const b = new BrouillonService(unUUID('b'), {
        nomService: 'Mairie A',
      });

      b.metsAJourPropriete(
        nomPropriete as ProprietesBrouillonService,
        'une valeur'
      );

      expect(
        b.donneesAPersister()[nomPropriete as ProprietesBrouillonService]
      ).toBe('une valeur');
    });
  });

  describe('sur demande des données à persister', () => {
    it('retourne le nom du service', () => {
      const b = new BrouillonService(unUUID('b'), {
        nomService: 'Mairie A',
      });

      expect(b.donneesAPersister()).toEqual({ nomService: 'Mairie A' });
    });

    it("retourne le siret s'il est présent", () => {
      const b = new BrouillonService(unUUID('b'), {
        nomService: 'Mairie A',
        siret: 'un siret',
      });

      expect(b.donneesAPersister()).toEqual({
        nomService: 'Mairie A',
        siret: 'un siret',
      });
    });
  });
});
