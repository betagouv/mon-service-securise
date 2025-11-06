import {
  BrouillonService,
  ProprietesBrouillonService,
} from '../../src/modeles/brouillonService.js';
import { unUUID } from '../constructeurs/UUID.js';

describe('Un brouillon de Service v2', () => {
  const deuxFois = <T>(chaine: T) => [chaine, chaine];

  const unBrouillonAvecDoublons = () =>
    new BrouillonService(unUUID('b'), {
      nomService: 'Mairie A',
      siret: 'un siret',
      presentation: 'Mon service qui…',
      statutDeploiement: 'enCours',
      pointsAcces: [...deuxFois('a.fr'), 'b.fr'],
      activitesExternalisees: deuxFois('administrationTechnique'),
      specificitesProjet: deuxFois('annuaire'),
      typeService: deuxFois('api'),
      typeHebergement: 'cloud',
      ouvertureSysteme: 'accessibleSurInternet',
      audienceCible: 'large',
      categoriesDonneesTraitees: deuxFois('secretsDEntreprise'),
      categoriesDonneesTraiteesSupplementaires: deuxFois('une catégorie'),
      volumetrieDonneesTraitees: 'eleve',
      localisationDonneesTraitees: 'UE',
      niveauSecurite: 'niveau1',
    });

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
        localisationDonneesTraitees: 'UE',
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
          niveauSecurite: 'niveau1',
          activitesExternalisees: ['administrationTechnique'],
          specificitesProjet: [],
          typeService: ['api'],
          typeHebergement: 'cloud',
          ouvertureSysteme: 'accessibleSurInternet',
          audienceCible: 'large',
          categoriesDonneesTraitees: ['secretsDEntreprise'],
          categoriesDonneesTraiteesSupplementaires: ['une catégorie'],
          volumetrieDonneesTraitees: 'eleve',
          localisationDonneesTraitees: 'UE',
        },
      });
    });

    it('dédoublonne toutes les propriétés "Tableau"', () => {
      const b = unBrouillonAvecDoublons();

      const sansDoublons = b.enDonneesCreationServiceV2();

      const { descriptionService: d } = sansDoublons;
      expect(d.activitesExternalisees).toEqual(['administrationTechnique']);
      expect(d.specificitesProjet).toEqual(['annuaire']);
      expect(d.categoriesDonneesTraitees).toEqual(['secretsDEntreprise']);
      expect(d.categoriesDonneesTraiteesSupplementaires).toEqual([
        'une catégorie',
      ]);
      expect(d.typeService).toEqual(['api']);
      expect(d.pointsAcces).toEqual([
        { description: 'a.fr' },
        { description: 'b.fr' },
      ]);
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

    it('dédoublonne toutes les propriétés "Tableau"', () => {
      const b = unBrouillonAvecDoublons();

      const sansDoublons = b.donneesAPersister();

      expect(sansDoublons.activitesExternalisees).toEqual([
        'administrationTechnique',
      ]);
      expect(sansDoublons.specificitesProjet).toEqual(['annuaire']);
      expect(sansDoublons.categoriesDonneesTraitees).toEqual([
        'secretsDEntreprise',
      ]);
      expect(sansDoublons.categoriesDonneesTraiteesSupplementaires).toEqual([
        'une catégorie',
      ]);
      expect(sansDoublons.typeService).toEqual(['api']);
      expect(sansDoublons.pointsAcces).toEqual(['a.fr', 'b.fr']);
    });
  });
});
