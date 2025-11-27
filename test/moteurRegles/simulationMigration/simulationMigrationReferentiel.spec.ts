import { SimulationMigrationReferentiel } from '../../../src/moteurRegles/simulationMigration/simulationMigrationReferentiel.js';
import { unService } from '../../constructeurs/constructeurService.js';
import { uneDescriptionV2Valide } from '../../constructeurs/constructeurDescriptionServiceV2.ts';
import uneDescriptionValide from '../../constructeurs/constructeurDescriptionService.js';
import {
  Referentiel,
  ReferentielV2,
} from '../../../src/referentiel.interface.js';
import { DescriptionServiceV2 } from '../../../src/modeles/descriptionServiceV2.js';
import Service from '../../../src/modeles/service.js';
import { fabriqueReferentiel } from '../../../src/fabriqueReferentiel.js';
import { EquivalencesMesuresV1V2 } from '../../../donneesConversionReferentielMesures.ts';
import { toutesEquivalencesAvecStatut } from './equivalencesMesuresV1V2.aide.ts';
import MesureGenerale from '../../../src/modeles/mesureGenerale.js';

describe('La simulation de migration du référentiel V1 vers V2', () => {
  let referentielV1: Referentiel;
  let referentielV2: ReferentielV2;
  let descriptionServiceV2: DescriptionServiceV2;
  let serviceV1: Service;

  beforeEach(() => {
    referentielV1 = fabriqueReferentiel().v1();
    referentielV2 = fabriqueReferentiel().v2();
    descriptionServiceV2 = uneDescriptionV2Valide()
      .avecDureeDysfonctionnementAcceptable('plusDe24h')
      .avecCategoriesDonneesTraitees([])
      .avecNiveauSecurite('niveau1')
      .construis();
    serviceV1 = unService(referentielV1)
      .avecDescription(
        uneDescriptionValide(referentielV1, false).avecTypes([
          'applicationMobile',
        ]).donnees
      )
      .construis();
  });

  const uneSimulation = (equivalences?: EquivalencesMesuresV1V2) =>
    new SimulationMigrationReferentiel(
      {
        serviceV1,
        descriptionServiceV2,
        referentielV1,
        referentielV2,
      },
      equivalences
    );

  describe("sur demande de l'évolution des mesures", () => {
    it('sait dire combien de mesures sont modifiées', () => {
      const deuxModifiees: EquivalencesMesuresV1V2 = {
        ...toutesEquivalencesAvecStatut('inchangee'),
        exigencesSecurite: {
          statut: 'modifiee',
          idsMesureV2: ['ADMIN.2'],
          conservationDonnees: true,
        },
        identificationDonneesSensibles: {
          statut: 'modifiee',
          idsMesureV2: ['ADMIN.1'],
          conservationDonnees: true,
        },
      };
      const simulation = uneSimulation(deuxModifiees);

      const evolution = simulation.evolutionMesures();

      expect(evolution.nbMesuresModifiees).toBe(2);
    });

    it('sait dire combien de mesures restent inchangées', () => {
      const deuxInchangees: EquivalencesMesuresV1V2 = {
        ...toutesEquivalencesAvecStatut('modifiee'),
        exigencesSecurite: {
          statut: 'inchangee',
          idsMesureV2: ['ADMIN.2'],
          conservationDonnees: true,
        },
        identificationDonneesSensibles: {
          statut: 'inchangee',
          idsMesureV2: ['ADMIN.1'],
          conservationDonnees: true,
        },
      };
      const simulation = uneSimulation(deuxInchangees);

      const evolution = simulation.evolutionMesures();

      expect(evolution.nbMesuresInchangees).toBe(2);
    });

    it('sait dire combien de mesures sont supprimées', () => {
      const deuxSupprimees: EquivalencesMesuresV1V2 = {
        ...toutesEquivalencesAvecStatut('inchangee'),
        exigencesSecurite: {
          statut: 'supprimee',
          idsMesureV2: [],
          conservationDonnees: false,
        },
        identificationDonneesSensibles: {
          statut: 'supprimee',
          idsMesureV2: [],
          conservationDonnees: false,
        },
      };
      const simulation = uneSimulation(deuxSupprimees);

      const evolution = simulation.evolutionMesures();

      expect(evolution.nbMesuresSupprimees).toBe(2);
    });

    it('sait dire combien de mesures sont présentes au total dans le service v2', () => {
      const simulation = uneSimulation();

      const evolution = simulation.evolutionMesures();

      expect(evolution.nbMesures).toBe(45);
    });

    it('sait dire combien de mesures sont ajoutées en V2', () => {
      const simulation = new SimulationMigrationReferentiel({
        serviceV1,
        descriptionServiceV2,
        referentielV1,
        referentielV2,
      });

      const evolution = simulation.evolutionMesures();

      expect(evolution.nbMesuresAjoutees).toBe(19);
    });

    it('sait donner le details de toutes les mesures', () => {
      const simulation = uneSimulation();

      const { detailsMesures } = simulation.evolutionMesures();

      const premiereMesureAjoutee = detailsMesures.find(
        (m) => m.statut === 'ajoutee'
      );
      expect(premiereMesureAjoutee).toEqual({
        nouvelleDescription:
          'Minimiser les données stockées aux seules données nécessaires aux traitements',
        statut: 'ajoutee',
      });

      const premiereMesureInchangee = detailsMesures.find(
        (m) => m.statut === 'inchangee'
      );
      expect(premiereMesureInchangee).toEqual({
        ancienneDescription:
          'Fixer et/ou identifier les exigences de sécurité incombant aux prestataires',
        nouvelleDescription:
          'Identifier ou fixer les engagements des prestataires en matière de sécurité',
        statut: 'inchangee',
      });

      const premiereMesureModifiee = detailsMesures.find(
        (m) => m.statut === 'modifiee'
      );
      expect(premiereMesureModifiee).toEqual({
        ancienneDescription:
          'Procéder à des vérifications techniques automatiques de la sécurité du service',
        nouvelleDescription:
          'Procéder a minima annuellement à une revue de configuration des équipements et applicatifs',
        statut: 'modifiee',
      });

      const premiereMesureSupprimee = detailsMesures.find(
        (m) => m.statut === 'supprimee'
      );
      expect(premiereMesureSupprimee).toEqual({
        ancienneDescription:
          "Limiter et connaître les interconnexions entre le service numérique et d'autres systèmes d'information",
        statut: 'supprimee',
      });

      expect(detailsMesures.length).toBe(71);
    });
  });

  describe('sur demande des données de mesures générales v2', () => {
    const equivalences: EquivalencesMesuresV1V2 = {
      ...toutesEquivalencesAvecStatut('supprimee'),
      exigencesSecurite: {
        statut: 'inchangee',
        // On prend une mesure v2 qui sera présente sur notre service de test
        idsMesureV2: ['RECENSEMENT.2'],
        conservationDonnees: true,
      },
      identificationDonneesSensibles: {
        statut: 'inchangee',
        // On prend une mesure v2 qui sera présente sur notre service de test
        idsMesureV2: ['DEV.1'],
        conservationDonnees: true,
      },
    };

    it('conserve le statut des équivalences « inchangées » : donc les mesures faites en v1 sont faites en v2', () => {
      serviceV1.mesures.mesuresGenerales.metsAJourMesure(
        new MesureGenerale(
          { id: 'exigencesSecurite', statut: 'fait' },
          referentielV1
        )
      );
      serviceV1.mesures.mesuresGenerales.metsAJourMesure(
        new MesureGenerale(
          { id: 'identificationDonneesSensibles', statut: 'fait' },
          referentielV1
        )
      );

      const mesuresV2 = uneSimulation(equivalences).donneesMesuresGeneralesV2();

      // Les *générales* sont celles où l'utilisateur a saisi des données
      // Ce ne sont PAS toutes les mesures retournées par le moteur v2, qui sont
      // les *mesures personnalisées*.
      expect(mesuresV2).toHaveLength(2);
      const [a, b] = mesuresV2;
      expect(a.id).toBe('RECENSEMENT.2');
      expect(a.statut).toBe('fait');
      expect(b.id).toBe('DEV.1');
      expect(b.statut).toBe('fait');
    });

    it('conserve toutes les métadonnées des mesures générales', () => {
      serviceV1.mesures.mesuresGenerales.metsAJourMesure(
        new MesureGenerale(
          {
            id: 'exigencesSecurite',
            statut: 'fait',
            modalites: 'une modalite',
            priorite: 'p1',
            echeance: '01/01/2025',
            responsables: ['Jean Dupond'],
          },
          referentielV1
        )
      );

      const mesuresV2 = uneSimulation(equivalences).donneesMesuresGeneralesV2();

      expect(mesuresV2).toHaveLength(1);
      const [a] = mesuresV2;
      expect(a.id).toBe('RECENSEMENT.2');
      expect(a.statut).toBe('fait');
      expect(a.modalites).toBe('une modalite');
      expect(a.priorite).toBe('p1');
      expect(a.responsables).toEqual(['Jean Dupond']);
    });

    it('peut instancier plusieurs mesures v2 pour une seule mesure v1', () => {
      const equivalencesAvecDeuxMesuresV2PourUneV1: EquivalencesMesuresV1V2 = {
        ...toutesEquivalencesAvecStatut('supprimee'),
        exigencesSecurite: {
          statut: 'inchangee',
          idsMesureV2: ['RECENSEMENT.2', 'DEV.1'],
          conservationDonnees: true,
        },
      };
      serviceV1.mesures.mesuresGenerales.metsAJourMesure(
        new MesureGenerale(
          {
            id: 'exigencesSecurite',
            statut: 'fait',
            modalites: 'une modalite',
            priorite: 'p1',
            echeance: '01/01/2025',
            responsables: ['Jean Dupond'],
          },
          referentielV1
        )
      );

      const mesuresV2 = uneSimulation(
        equivalencesAvecDeuxMesuresV2PourUneV1
      ).donneesMesuresGeneralesV2();

      expect(mesuresV2).toHaveLength(2);
      const [a, b] = mesuresV2;
      expect(a.id).toBe('RECENSEMENT.2');
      expect(b.id).toBe('DEV.1');
    });
  });

  describe("sur demande de l'évolution de l'indice cyber", () => {
    it('retourne les indices cyber v1 et v2 ainsi que leur maximum', () => {
      serviceV1.mesures.mesuresGenerales.metsAJourMesure(
        new MesureGenerale(
          { id: 'exigencesSecurite', statut: 'fait' },
          referentielV1
        )
      );
      serviceV1.mesures.mesuresGenerales.metsAJourMesure(
        new MesureGenerale(
          { id: 'identificationDonneesSensibles', statut: 'fait' },
          referentielV1
        )
      );

      const { v1, v2, max } = uneSimulation().evolutionIndiceCyber();

      expect(v1).toBeGreaterThan(0);
      expect(v1).toBeLessThan(5);
      expect(v2).toBeGreaterThan(0);
      expect(v2).toBeLessThan(5);
      expect(max).toBe(5);
    });
  });
});
