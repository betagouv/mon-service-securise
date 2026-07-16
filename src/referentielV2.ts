import { creeReferentiel } from './referentiel.js';
import { Referentiel } from './referentiel.interface.js';
import {
  AudienceCible,
  CategorieDonneesTraitees,
  DetailReferentielMesureV2,
  DureeDysfonctionnementAcceptable,
  IdMesureV2,
  LocalisationDonneesTraitees,
  mesuresV2,
  OuvertureSysteme,
  questionsV2,
  SpecificiteProjet,
  StatutDeploiement,
  TypeDeService,
  TypeHebergement,
} from '../donneesReferentielMesuresV2.js';
import { ReglesDuReferentielMesuresV2 } from './moteurRegles/v2/moteurReglesV2.js';
import {
  DonneesComplementairesMesuresV2,
  donneesComplementairesMesureV2,
} from '../donneesComplementairesReferentielMesuresV2.js';
import { TypeService } from '../svelte/lib/creationV2/creationV2.types.js';
import { IdRisqueV2 } from './moteurRisques/v2/risquesV2.types.js';
import { donneesReferentielRisquesV2 } from '../donneesReferentielRisquesV2.js';
import {
  type IdMesureReCyf,
  mesuresReCyf,
} from './mesures/referentielsExternes/donneesReferentielMesuresReCyf.js';
import { correspondanceMesuresV2VersReCyf } from './mesures/referentielsExternes/correspondanceMesuresV2VersReCyf.js';
import {
  IdMesureISO2700X,
  mesuresISO2700X,
} from './mesures/referentielsExternes/donneesReferentielMesuresISO2700X.js';
import { correspondanceMesuresReCyfVersISO2700X } from './mesures/referentielsExternes/correspondanceMesuresReCyfVersISO2700X.js';
import {
  IdMesureAE2690,
  mesuresAE2690,
} from './mesures/referentielsExternes/donneesReferentielMesuresAE2690.js';
import { correspondanceMesuresReCyfVersAE2690 } from './mesures/referentielsExternes/correspondanceMesuresReCyfVersAE2690.js';

export type EntiteConcernee = 'EI' | 'EE';

export type DonneesReferentielsMesuresReCyf = {
  objectif: string;
  thematique: string;
  description: string;
  entitesConcernees: readonly EntiteConcernee[];
};

export type DonneesReferentielsMesuresISO2700X = {
  description: string;
};

export type DonneesReferentielsMesuresAE2690 = {
  description: string;
};

export type DonneesReferentielV2 = typeof questionsV2 & {
  mesures: typeof mesuresV2;
  donneesComplementairesMesures: DonneesComplementairesMesuresV2;
  risquesV2: typeof donneesReferentielRisquesV2;
  donneesReferentielsExternesMesures: {
    AE2690: {
      mesures: Record<string, DonneesReferentielsMesuresAE2690>;
      liens: Partial<Record<IdMesureReCyf, IdMesureAE2690[]>>;
    };
    ISO2700X: {
      mesures: Record<string, DonneesReferentielsMesuresISO2700X>;
      liens: Partial<Record<IdMesureReCyf, IdMesureISO2700X[]>>;
    };
    ReCyf: {
      mesures: Record<string, DonneesReferentielsMesuresReCyf>;
      liens: Partial<Record<IdMesureV2, IdMesureReCyf[]>>;
    };
  };
};

type MethodesSpecifiquesReferentielV2 = {
  enrichisPourListeCentraliseeDeMesures: (
    mesures: typeof mesuresV2
  ) => typeof mesuresV2;
  descriptionAudienceCible: (audienceCible: AudienceCible) => string;
  descriptionDelaiAvantImpactCritique: (
    dureeDysfonctionnementAcceptable: DureeDysfonctionnementAcceptable
  ) => string;
  descriptionsDonneesCaracterePersonnel: (
    donneesCaracterePersonnel: CategorieDonneesTraitees
  ) => string;
  descriptionSpecificiteProjet: (
    specificiteProjet: SpecificiteProjet
  ) => string;
  descriptionStatutDeploiement: (
    statutDeploiement: StatutDeploiement
  ) => string;
  descriptionTypeHebergement: (typeHebergement: TypeHebergement) => string;
  descriptionTypeService: (typeService: TypeService) => string;
  descriptionOuvertureSysteme: (ouvertureSysteme: OuvertureSysteme) => string;
  enregistreReglesMoteurV2: (regles: ReglesDuReferentielMesuresV2) => void;
  identifiantsRisquesV2: () => IdRisqueV2[];
  localisationDonnees: (localisation: LocalisationDonneesTraitees) => {
    nom: string;
  };
  reglesMoteurV2: () => ReglesDuReferentielMesuresV2;
  mesures: () => typeof mesuresV2;
  mesure: (idMesure: IdMesureV2) => DetailReferentielMesureV2;
  porteursSinguliersDeMesure: (idMesure: IdMesureV2) => string[];
  referentielsExternesDeMesure: (idMesure: IdMesureV2) => {
    ReCyf: Array<
      DonneesReferentielsMesuresReCyf & {
        id: IdMesureReCyf;
      }
    >;
    ISO2700X: Array<
      DonneesReferentielsMesuresISO2700X & {
        id: IdMesureISO2700X;
      }
    >;
    AE2690: Array<
      DonneesReferentielsMesuresAE2690 & {
        id: IdMesureAE2690;
      }
    >;
  };
  thematiqueDeMesure: (idMesure: IdMesureV2) => string;
  typeService: (type: TypeDeService) => { nom: string; exemple: string };
};

type Surcharge<A, B> = Omit<A, keyof B> & B;

export const creeReferentielV2 = (
  donnees: DonneesReferentielV2 = {
    ...questionsV2,
    mesures: mesuresV2,
    donneesComplementairesMesures: donneesComplementairesMesureV2,
    risquesV2: donneesReferentielRisquesV2,
    donneesReferentielsExternesMesures: {
      AE2690: {
        mesures: mesuresAE2690,
        liens: correspondanceMesuresReCyfVersAE2690,
      },
      ReCyf: { mesures: mesuresReCyf, liens: correspondanceMesuresV2VersReCyf },
      ISO2700X: {
        mesures: mesuresISO2700X,
        liens: correspondanceMesuresReCyfVersISO2700X,
      },
    },
  }
): Surcharge<Referentiel, MethodesSpecifiquesReferentielV2> => {
  let reglesMoteurV2Enregistrees: ReglesDuReferentielMesuresV2 = [];
  const identifiantsMesure = new Set<string>(Object.keys(donnees.mesures));

  const descriptionDelaiAvantImpactCritique = (
    dureeDysfonctionnementAcceptable: DureeDysfonctionnementAcceptable
  ) =>
    donnees.dureeDysfonctionnementAcceptable[dureeDysfonctionnementAcceptable]
      .nom;

  const descriptionsDonneesCaracterePersonnel = (
    donneesCaracterePersonnel: CategorieDonneesTraitees
  ) => donnees.categorieDonneesTraitees[donneesCaracterePersonnel].nom;

  const descriptionAudienceCible = (audienceCible: AudienceCible) =>
    `${donnees.audienceCible[audienceCible].nom} : ${donnees.audienceCible[audienceCible].description}`;

  const descriptionSpecificiteProjet = (specificiteProjet: SpecificiteProjet) =>
    donnees.specificiteProjet[specificiteProjet].nom;

  const descriptionStatutDeploiement = (statutDeploiement: StatutDeploiement) =>
    donnees.statutDeploiement[statutDeploiement].description;

  const descriptionTypeHebergement = (typeHebergement: TypeHebergement) =>
    donnees.typeHebergement[typeHebergement].nom;

  const descriptionTypeService = (typeService: TypeDeService) =>
    donnees.typeDeService[typeService].nom;

  const descriptionOuvertureSysteme = (ouvertureSysteme: OuvertureSysteme) =>
    donnees.ouvertureSysteme[ouvertureSysteme].nom;

  const enregistreReglesMoteurV2 = (regles: ReglesDuReferentielMesuresV2) => {
    reglesMoteurV2Enregistrees = regles;
  };

  const estIdentifiantMesureConnu = (id: IdMesureV2) =>
    identifiantsMesure.has(id);

  const localisationDonnees = (localisation: LocalisationDonneesTraitees) =>
    donnees.localisationDonneesTraitees[localisation];

  const mesure = (idMesure: IdMesureV2) => donnees.mesures[idMesure];

  const mesures = () => structuredClone(donnees.mesures);

  const typeService = (type: TypeDeService) => donnees.typeDeService[type];

  const reglesMoteurV2 = () => reglesMoteurV2Enregistrees;

  const porteursSinguliersDeMesure = (idMesure: IdMesureV2) =>
    donnees.donneesComplementairesMesures[idMesure].porteursSinguliers;

  const thematiqueDeMesure = (idMesure: IdMesureV2) =>
    donnees.donneesComplementairesMesures[idMesure].thematique;

  const referentielsExternesDeMesure = (idMesure: IdMesureV2) => {
    const idsMesuresRecyf: Array<IdMesureReCyf> =
      donnees.donneesReferentielsExternesMesures.ReCyf.liens[idMesure] || [];
    const idsMesuresISO: Array<IdMesureISO2700X> = [
      ...new Set(
        idsMesuresRecyf.flatMap(
          (idMesureRecyf) =>
            donnees.donneesReferentielsExternesMesures.ISO2700X.liens[
              idMesureRecyf
            ] || []
        )
      ),
    ];
    const idsMesuresAE: Array<IdMesureAE2690> = [
      ...new Set(
        idsMesuresRecyf.flatMap(
          (idMesureRecyf) =>
            donnees.donneesReferentielsExternesMesures.AE2690.liens[
              idMesureRecyf
            ] || []
        )
      ),
    ];
    return {
      ReCyf: idsMesuresRecyf.map((idMesureReCyf: IdMesureReCyf) => ({
        id: idMesureReCyf,
        ...donnees.donneesReferentielsExternesMesures.ReCyf.mesures[
          idMesureReCyf
        ],
      })),
      ISO2700X: idsMesuresISO.map((idMesureISO: IdMesureISO2700X) => ({
        id: idMesureISO,
        ...donnees.donneesReferentielsExternesMesures.ISO2700X.mesures[
          idMesureISO
        ],
      })),
      AE2690: idsMesuresAE.map((idMesureAE: IdMesureAE2690) => ({
        id: idMesureAE,
        ...donnees.donneesReferentielsExternesMesures.AE2690.mesures[
          idMesureAE
        ],
      })),
    };
  };

  const enrichisPourListeCentraliseeDeMesures = (
    desMesures: typeof mesuresV2
  ) =>
    Object.fromEntries(
      Object.entries(desMesures).map(([id, m]) => {
        const thematique = thematiqueDeMesure(id);
        const porteursSinguliers = porteursSinguliersDeMesure(id);
        const referentielsExternes = referentielsExternesDeMesure(id);
        return [
          id,
          { ...m, thematique, porteursSinguliers, referentielsExternes },
        ];
      })
    );

  const identifiantsRisquesV2 = () => [
    ...donneesReferentielRisquesV2.idsRisquesV2,
  ];

  return {
    ...creeReferentiel(),
    enrichisPourListeCentraliseeDeMesures,
    descriptionAudienceCible,
    descriptionDelaiAvantImpactCritique,
    descriptionsDonneesCaracterePersonnel,
    descriptionSpecificiteProjet,
    descriptionStatutDeploiement,
    descriptionTypeHebergement,
    descriptionTypeService,
    descriptionOuvertureSysteme,
    enregistreReglesMoteurV2,
    estIdentifiantMesureConnu,
    identifiantsRisquesV2,
    localisationDonnees,
    mesure,
    mesures,
    porteursSinguliersDeMesure,
    referentielsExternesDeMesure,
    typeService,
    reglesMoteurV2,
    thematiqueDeMesure,
    version: () => 'v2',
  };
};
