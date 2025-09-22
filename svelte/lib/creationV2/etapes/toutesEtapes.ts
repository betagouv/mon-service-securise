import QuestionNomService from './etape1/QuestionNomService.svelte';
import QuestionSiret from './etape1/QuestionSiret.svelte';
import QuestionStatutDeploiement from './etape1/QuestionStatutDeploiement.svelte';
import QuestionPresentation from './etape1/QuestionPresentation.svelte';
import QuestionPointsAcces from './etape1/QuestionPointsAcces.svelte';
import QuestionTypesService from './etape2/QuestionTypeService.svelte';
import QuestionSpecificitesProjet from './etape2/QuestionSpecificitesProjet.svelte';
import QuestionTypeHebergement from './etape2/QuestionTypeHebergement.svelte';
import type { SvelteComponent } from 'svelte';
import type { BrouillonSvelte } from '../creationV2.types';

type ComposantQuestion = typeof SvelteComponent<{ estComplete: boolean }>;

export type QuestionBindeeSurBrouillon = {
  clesPropriete: Array<keyof BrouillonSvelte>;
  composant: ComposantQuestion;
  explications: string[];
};

type EtapeDuWizard = {
  numero: number;
  titre: string;
  questions: QuestionBindeeSurBrouillon[];
  illustration: string;
};
export const toutesEtapes: EtapeDuWizard[] = [
  {
    numero: 1,
    titre: 'Informations génériques sur le projet',
    illustration: '/statique/assets/images/illustration_accueil_connexion.svg',
    questions: [
      {
        clesPropriete: ['nomService'],
        composant: QuestionNomService,
        explications: [
          'Dans tout projet d’homologation, il est primordial d’identifier le périmètre sur lequel les travaux vont être menés.',
          'Le choix du périmètre dépend de la nature des données traitées et de sa complexité.',
          'Le périmètre du système d’information à homologuer est l’ensemble des composants du système d’information dans lequel l’information est traitée et pour lequel une autorité a été identifiée',
        ],
      },
      {
        clesPropriete: ['siret'],
        composant: QuestionSiret,
        explications: [
          "Ces informations permettent de donner de la visibilité sur l'homologation au top-management de votre entité.",
        ],
      },
      {
        clesPropriete: ['statutDeploiement'],
        composant: QuestionStatutDeploiement,
        explications: [
          'Cette information est importante afin de permettre à l’autorité d’homologation d’identifier à quel moment est initié le projet d’homologation.',
          'Il est recommandé d’amorcer l’homologation dès la conception du service afin d’éviter de s’exposer à des coûts importants de renforcement de la sécurité une fois un service déjà en production, moindres lorsque la sécurité est intégrée dès le départ.',
        ],
      },
      {
        clesPropriete: ['presentation'],
        composant: QuestionPresentation,
        explications: [
          "Cette présentation permettra à l'autorité d'homologation de comprendre le périmètre d'homologation et le système d'information.",
          "Ainsi, il est recommandé d'utiliser des termes non-techniques afin de présenter votre service.",
        ],
      },
      {
        clesPropriete: ['pointsAcces'],
        composant: QuestionPointsAcces,
        explications: [
          "Cette information permet à l'autorité d'homologation d'accéder au système d'information pour mieux le comprendre.",
        ],
      },
    ],
  },
  {
    numero: 2,
    titre: 'Caractéristiques du service',
    illustration: '/statique/assets/images/home/illustration_etape_2.svg',
    questions: [
      {
        clesPropriete: ['typeService'],
        composant: QuestionTypesService,
        explications: [
          "Cette information permet d'évaluer le type de système d'information et ainsi de commencer à sélectionner les exigences nécessaires pour son homologation.",
          'Par exemple, si "Une application mobile" n\'est pas sélectionnée, il ne serait pas intéressant de recommander d\'utiliser des magasins officiels d’applications mobiles pour leur téléchargement.',
        ],
      },
      {
        clesPropriete: ['specificitesProjet'],
        composant: QuestionSpecificitesProjet,
        explications: [
          "Ces informations vont permettre de sélectionner les mesures de sécurité nécessaires à l'homologation du périmètre identifié.",
          "Par exemple, si votre projet doit aussi couvrir la sécurité physique de votre système d'information, sélectionner \"L'accès physique des locaux et salles techniques\" va permettre d'ajouter des mesures liées à la sécurité physique.",
        ],
      },
      {
        clesPropriete: ['typeHebergement', 'activitesExternalisees'],
        composant: QuestionTypeHebergement,
        explications: [
          "Ces informations permettent d'identifier ce qui est directement sous votre contrôle ou au contraire sous le contrôle d'un prestataire (et donc devant être cadré via les clauses contractuelles).",
        ],
      },
    ],
  },
];
