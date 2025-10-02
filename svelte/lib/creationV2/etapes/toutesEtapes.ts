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
import QuestionOuvertureSysteme from './etape3/QuestionOuvertureSysteme.svelte';
import QuestionAudienceCible from './etape3/QuestionAudienceCible.svelte';
import QuestionDureeDysfonctionnement from './etape3/QuestionDureeDysfonctionnement.svelte';
import QuestionCategoriesDonneesTraitees from './etape3/QuestionCategoriesDonneesTraitees.svelte';
import QuestionVolumetrieDonneesTraitees from './etape3/QuestionVolumetrieDonneesTraitees.svelte';
import QuestionLocalisationsDonneesTraitees from './etape3/QuestionLocalisationsDonneesTraitees.svelte';
import EtapeResumeDuService from './resume/EtapeResumeDuService.svelte';
import EtapeCreationEnModeRapide from './modeRapide/EtapeCreationEnModeRapide.svelte';
import EtapeNiveauSecurite from './EtapeNiveauSecurite.svelte';

type ComposantQuestion = typeof SvelteComponent<{ estComplete: boolean }>;

export type QuestionBindeeSurBrouillon = {
  clesPropriete: Array<keyof BrouillonSvelte>;
  composant: ComposantQuestion;
  explications: string[];
  avecAvanceRapide?: boolean;
};

export type EtapeGlobale = {
  composant: typeof SvelteComponent<{}>;
  clesPropriete: [];
  explications: [];
  avecAvanceRapide: false;
};

export type EtapeDuWizard = {
  numero: number;
  titre: string;
  questions: Array<QuestionBindeeSurBrouillon | EtapeGlobale>;
  illustration?: string;
};

export const toutesEtapesModeRapide: Array<EtapeDuWizard> = [
  {
    numero: 1,
    titre: 'Informations sur le projet',
    illustration: '/statique/assets/images/illustration_accueil_connexion.svg',
    questions: [
      {
        composant: EtapeCreationEnModeRapide,
        explications: [],
        avecAvanceRapide: false,
        clesPropriete: [],
      },
    ],
  },
  {
    numero: 2,
    titre: 'Besoins de sécurité',
    questions: [
      {
        composant: EtapeNiveauSecurite,
        explications: [],
        avecAvanceRapide: false,
        clesPropriete: [],
      },
    ],
  },
];

export const toutesEtapes: Array<EtapeDuWizard> = [
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
        avecAvanceRapide: true,
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
  {
    numero: 3,
    titre: "Évaluation de la criticité et de l'exposition du service",
    illustration: '/statique/assets/images/illustration_acces_securise.svg',
    questions: [
      {
        clesPropriete: ['ouvertureSysteme'],
        composant: QuestionOuvertureSysteme,
        explications: [
          'Ces informations permettent d’évaluer l’exposition du système d’information aux sources de risque.',
          "En effet, en fonction de l'ouverture du système et de l'état de la menace, il est possible d’évaluer l'exposition et de la coupler avec la criticité pour évaluer le besoin de sécurité.",
        ],
        avecAvanceRapide: true,
      },
      {
        clesPropriete: ['audienceCible'],
        composant: QuestionAudienceCible,
        explications: [
          "Ces informations permettent de comprendre les impacts sur l'image que peut avoir un incident de sécurité, notamment en proportionnalisant ces impacts par rapport à l'audience du système d'information de l'entité.",
          "En effet, en fonction de la quantité de personnes impactées, l'impact réputationnel peut être plus ou moins important. C'est par exemple le cas lors des attaques aboutissant à un défacement.",
        ],
        avecAvanceRapide: true,
      },
      {
        clesPropriete: ['dureeDysfonctionnementAcceptable'],
        composant: QuestionDureeDysfonctionnement,
        explications: [
          "Ces informations permettent d'évaluer la durée maximale tolérable d'indisponibilité du système d'information pour identifier le besoin de disponibilité afin d'en déduire des mesures de sécurité proportionnelles.",
          'Par exemple, l’utilisation d’un dispositif anti-DDOS est moins indispensable en cas de durée maximale de dysfonctionnement tolérable de plus de 24h.',
          "Lors de la sélection de ces informations, il est important d'identifier le besoin, et non pas ce qui est actuellement réalisable.",
        ],
        avecAvanceRapide: true,
      },
      {
        clesPropriete: [
          'categoriesDonneesTraitees',
          'categoriesDonneesTraiteesSupplementaires',
        ],
        composant: QuestionCategoriesDonneesTraitees,
        explications: [
          "Ces informations permettent d'identifier la sensibilité des données traitées au sein du système d'information et ainsi de sélectionner des mesures de sécurité proportionnelles à cette sensibilité tout en évaluant la criticité du périmètre d'homologation.",
          "En effet, la criticité couplée avec l'exposition du périmètre permet d'en identifier son besoin de sécurité.",
        ],
      },
      {
        clesPropriete: ['volumetrieDonneesTraitees'],
        composant: QuestionVolumetrieDonneesTraitees,
        explications: [
          "Ces informations permettent d'identifier la volumétrie des données stockées dans le système d’information, afin notamment d'évaluer la gravité d'une fuite des informations.",
          "Par exemple, il est moins grave de subir une fuite d'information sur un système d'information contenant une faible quantité de données à caractère personnel que sur un système contenant un grand volume de ces données.",
        ],
        avecAvanceRapide: true,
      },
      {
        clesPropriete: ['localisationsDonneesTraitees'],
        composant: QuestionLocalisationsDonneesTraitees,
        explications: [
          "Cette information permet de savoir si des mesures liées à la localisation des données sont nécessaires à l'homologation.",
        ],
      },
    ],
  },
  {
    numero: 4,
    titre: 'Résumé du service',
    questions: [
      {
        composant: EtapeResumeDuService,
        explications: [],
        avecAvanceRapide: false,
        clesPropriete: [],
      },
    ],
  },
  {
    numero: 5,
    titre: 'Besoins de sécurité',
    questions: [
      {
        composant: EtapeNiveauSecurite,
        explications: [],
        avecAvanceRapide: false,
        clesPropriete: [],
      },
    ],
  },
];
