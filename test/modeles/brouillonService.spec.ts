import {
  BrouillonService,
  ProprietesBrouillonService,
} from '../../src/modeles/brouillonService.js';
import { unUUID } from '../constructeurs/UUID.js';

describe('Un brouillon de Service v2', () => {
  describe('quand il se transforme en données de DescriptionServiceV2', () => {
    it('fournit des données complètes', () => {
      const b = new BrouillonService(unUUID('b'), {
        nomService: 'Mairie A',
        siret: 'un siret',
        presentation: 'Mon service qui…',
        statutDeploiement: 'enCours',
        pointsAcces: ['a.fr', 'b.fr'],
        activitesExternalisees: ['administrationTechnique'],
        specificitesProjet: [],
        typeService: ['api'],
        typeHebergement: 'cloud',
        ouvertureSysteme: 'accessibleSurInternet',
        audienceCible: 'large',
        categoriesDonneesTraitees: ['secretsDEntreprise'],
        categoriesDonneesTraiteesSupplementaires: ['une catégorie'],
        volumetrieDonneesTraitees: 'eleve',
        localisationsDonneesTraitees: ['UE'],
        niveauSecurite: 'niveau1',
      });

      const pourCreationService = b.enDonneesCreationServiceV2();

      expect(pourCreationService).toEqual({
        versionService: 'v2',
        descriptionService: {
          nomService: 'Mairie A',
          organisationResponsable: { siret: 'un siret' },
          presentation: 'Mon service qui…',
          statutDeploiement: 'enCours',
          pointsAcces: [{ description: 'a.fr' }, { description: 'b.fr' }],
          niveauDeSecurite: 'niveau1',
          activitesExternalisees: ['administrationTechnique'],
          specificitesProjet: [],
          typeService: ['api'],
          typeHebergement: 'cloud',
          ouvertureSysteme: 'accessibleSurInternet',
          audienceCible: 'large',
          categoriesDonneesTraitees: ['secretsDEntreprise'],
          categoriesDonneesTraiteesSupplementaires: ['une catégorie'],
          volumetrieDonneesTraitees: 'eleve',
          localisationsDonneesTraitees: ['UE'],
        },
      });
    });
  });

  describe('sur demande de mise à jour de propriété', () => {
    it.each(['siret', 'nomService', 'statutDeploiement'])(
      'mets à jour la propriété %s',
      (nomPropriete) => {
        const b = new BrouillonService(unUUID('b'), { nomService: 'Mairie A' });

        b.metsAJourPropriete(
          nomPropriete as ProprietesBrouillonService,
          'une valeur'
        );

        expect(
          b.donneesAPersister()[nomPropriete as ProprietesBrouillonService]
        ).toBe('une valeur');
      }
    );
  });

  describe('sur demande des données à persister', () => {
    it('retourne le nom du service', () => {
      const b = new BrouillonService(unUUID('b'), { nomService: 'Mairie A' });

      expect(b.donneesAPersister()).toEqual({ nomService: 'Mairie A' });
    });

    it('retourne toutes les données si elles sont présentes', () => {
      const b = new BrouillonService(unUUID('b'), {
        nomService: 'Mairie A',
        siret: 'un siret',
        statutDeploiement: 'enProjet',
      });

      expect(b.donneesAPersister()).toEqual({
        nomService: 'Mairie A',
        siret: 'un siret',
        statutDeploiement: 'enProjet',
      });
    });
  });
});
