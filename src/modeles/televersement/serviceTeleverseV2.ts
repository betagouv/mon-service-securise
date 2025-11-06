import * as z from 'zod';
import { ReferentielV2 } from '../../referentiel.interface.js';
import {
  AudienceCible,
  DureeDysfonctionnementAcceptable,
  LocalisationDonneesTraitees,
  OuvertureSysteme,
  questionsV2,
  StatutDeploiement,
  TypeDeService,
  TypeHebergement,
  VolumetrieDonneesTraitees,
} from '../../../donneesReferentielMesuresV2.js';
import {
  DescriptionServiceV2,
  DonneesDescriptionServiceV2,
} from '../descriptionServiceV2.js';
import donneesReferentiel from '../../../donneesReferentiel.js';

type DescriptionStatutDeploiement =
  (typeof questionsV2.statutDeploiement)[StatutDeploiement]['description'];
type NomTypeDeService =
  (typeof questionsV2.typeDeService)[TypeDeService]['nom'];
type NomTypeHebergement =
  (typeof questionsV2.typeHebergement)[TypeHebergement]['nom'];
type NomOuvertureSysteme =
  (typeof questionsV2.ouvertureSysteme)[OuvertureSysteme]['nom'];
type NomAudienceCible =
  (typeof questionsV2.audienceCible)[AudienceCible]['nom'];
type NomDureeDysfonctionnementAcceptable =
  (typeof questionsV2.dureeDysfonctionnementAcceptable)[DureeDysfonctionnementAcceptable]['nom'];
type NomVolumetrieDonneesTraitees =
  (typeof questionsV2.volumetrieDonneesTraitees)[VolumetrieDonneesTraitees]['nom'];
type NomLocalisationDonneesTraitees =
  (typeof questionsV2.localisationDonneesTraitees)[LocalisationDonneesTraitees]['nom'];

enum ERREURS_VALIDATION {
  NOM_INVALIDE = 'NOM_INVALIDE',
  NOM_EXISTANT = 'NOM_EXISTANT',
  SIRET_INVALIDE = 'SIRET_INVALIDE',
  STATUT_DEPLOIEMENT_INVALIDE = 'STATUT_DEPLOIEMENT_INVALIDE',
  TYPE_INVALIDE = 'TYPE_INVALIDE',
  TYPE_HEBERGEMENT_INVALIDE = 'TYPE_HEBERGEMENT_INVALIDE',
  OUVERTURE_SYSTEME_INVALIDE = 'OUVERTURE_SYSTEME_INVALIDE',
  AUDIENCE_CIBLE_INVALIDE = 'AUDIENCE_CIBLE_INVALIDE',
  VOLUMETRIE_DONNEES_TRAITEES_INVALIDE = 'VOLUMETRIE_DONNEES_TRAITEES_INVALIDE',
  LOCALISATION_INVALIDE = 'LOCALISATION_INVALIDE',
  DELAI_AVANT_IMPACT_CRITIQUE_INVALIDE = 'DELAI_AVANT_IMPACT_CRITIQUE_INVALIDE',
  DOSSIER_HOMOLOGATION_INCOMPLET = 'DOSSIER_HOMOLOGATION_INCOMPLET',
  DATE_HOMOLOGATION_INVALIDE = 'DATE_HOMOLOGATION_INVALIDE',
  DUREE_HOMOLOGATION_INVALIDE = 'DUREE_HOMOLOGATION_INVALIDE',
}

export type DonneesServiceTeleverseV2 = {
  nom: string;
  siret: string;
  statutDeploiement: DescriptionStatutDeploiement;
  typeService: NomTypeDeService[];
  typeHebergement: NomTypeHebergement;
  ouvertureSysteme: NomOuvertureSysteme;
  audienceCible: NomAudienceCible;
  dureeDysfonctionnementAcceptable: NomDureeDysfonctionnementAcceptable;
  volumetrieDonneesTraitees: NomVolumetrieDonneesTraitees;
  localisationDonneesTraitees: NomLocalisationDonneesTraitees;
  dateHomologation?: Date;
  dureeHomologation?: string;
  nomAutoriteHomologation?: string;
  fonctionAutoriteHomologation?: string;
};

type DonneesMinimalesRequisesDescriptionServiceV2 = Omit<
  DonneesDescriptionServiceV2,
  | 'pointsAcces'
  | 'specificitesProjet'
  | 'activitesExternalisees'
  | 'categoriesDonneesTraitees'
  | 'categoriesDonneesTraiteesSupplementaires'
>;

type DonneesMinimalesRequisesDossierHomologation = {
  decision: { dateHomologation: string; dureeValidite: string };
  autorite: { nom: string; fonction: string };
};

export class ServiceTeleverseV2 {
  readonly donnees: Omit<
    DonneesServiceTeleverseV2,
    | 'dateHomologation'
    | 'dureeHomologation'
    | 'nomAutoriteHomologation'
    | 'fonctionAutoriteHomologation'
  > & {
    dossierHomologation?: {
      dateHomologation: Date;
      dureeHomologation: string;
      nomAutoriteHomologation: string;
      fonctionAutoriteHomologation: string;
    };
  };
  readonly referentiel: ReferentielV2;

  constructor(donnees: DonneesServiceTeleverseV2, referentiel: ReferentielV2) {
    const aAuMoinsUneInfoDuDossier = () =>
      [
        donnees.dateHomologation,
        donnees.dureeHomologation,
        donnees.nomAutoriteHomologation,
        donnees.fonctionAutoriteHomologation,
      ].some((p) => p !== '' && p !== undefined);

    this.donnees = {
      ...donnees,
      siret: donnees.siret.replace(/[^0-9]/g, ''),
      ...(aAuMoinsUneInfoDuDossier() && {
        dossierHomologation: {
          dateHomologation: donnees.dateHomologation!,
          dureeHomologation: donnees.dureeHomologation!,
          nomAutoriteHomologation: donnees.nomAutoriteHomologation!,
          fonctionAutoriteHomologation: donnees.fonctionAutoriteHomologation!,
        },
      }),
    };
    this.referentiel = referentiel;
  }

  valide(nomServicesExistants: string[] = []) {
    const validation = z.object({
      nom: z
        .string(ERREURS_VALIDATION.NOM_INVALIDE)
        .trim()
        .nonempty(ERREURS_VALIDATION.NOM_INVALIDE)
        .max(200, ERREURS_VALIDATION.NOM_INVALIDE)
        .refine(
          (n) => !nomServicesExistants.includes(n),
          ERREURS_VALIDATION.NOM_EXISTANT
        ),
      siret: z
        .string(ERREURS_VALIDATION.SIRET_INVALIDE)
        .regex(/^\d{14}$/, ERREURS_VALIDATION.SIRET_INVALIDE),
      statutDeploiement: z.enum(
        Object.values(questionsV2.statutDeploiement).map((s) => s.description),
        ERREURS_VALIDATION.STATUT_DEPLOIEMENT_INVALIDE
      ),
      typeService: z
        .array(
          z.enum(
            Object.values(questionsV2.typeDeService).map((t) => t.nom),
            ERREURS_VALIDATION.TYPE_INVALIDE
          ),
          ERREURS_VALIDATION.TYPE_INVALIDE
        )
        .nonempty(ERREURS_VALIDATION.TYPE_INVALIDE),
      typeHebergement: z.enum(
        Object.values(questionsV2.typeHebergement).map((t) => t.nom),
        ERREURS_VALIDATION.TYPE_HEBERGEMENT_INVALIDE
      ),
      ouvertureSysteme: z.enum(
        Object.values(questionsV2.ouvertureSysteme).map((o) => o.nom),
        ERREURS_VALIDATION.OUVERTURE_SYSTEME_INVALIDE
      ),
      audienceCible: z.enum(
        Object.values(questionsV2.audienceCible).map((a) => a.nom),
        ERREURS_VALIDATION.AUDIENCE_CIBLE_INVALIDE
      ),
      dureeDysfonctionnementAcceptable: z.enum(
        Object.values(questionsV2.dureeDysfonctionnementAcceptable).map(
          (d) => d.nom
        ),
        ERREURS_VALIDATION.DELAI_AVANT_IMPACT_CRITIQUE_INVALIDE
      ),
      volumetrieDonneesTraitees: z.enum(
        Object.values(questionsV2.volumetrieDonneesTraitees).map((v) => v.nom),
        ERREURS_VALIDATION.VOLUMETRIE_DONNEES_TRAITEES_INVALIDE
      ),
      localisationDonneesTraitees: z.enum(
        Object.values(questionsV2.localisationDonneesTraitees).map(
          (l) => l.nom
        ),
        ERREURS_VALIDATION.LOCALISATION_INVALIDE
      ),
      dossierHomologation: z
        .strictObject({
          dateHomologation: z.date(
            ERREURS_VALIDATION.DATE_HOMOLOGATION_INVALIDE
          ),
          dureeHomologation: z.enum(
            Object.values(donneesReferentiel.echeancesRenouvellement).map(
              (l) => l.description
            ),
            ERREURS_VALIDATION.DUREE_HOMOLOGATION_INVALIDE
          ),
          nomAutoriteHomologation: z
            .string(ERREURS_VALIDATION.DOSSIER_HOMOLOGATION_INCOMPLET)
            .trim()
            .nonempty(ERREURS_VALIDATION.DOSSIER_HOMOLOGATION_INCOMPLET),
          fonctionAutoriteHomologation: z
            .string(ERREURS_VALIDATION.DOSSIER_HOMOLOGATION_INCOMPLET)
            .trim()
            .nonempty(ERREURS_VALIDATION.DOSSIER_HOMOLOGATION_INCOMPLET),
        })
        .optional(),
    });
    const resultat = validation.safeParse(this.donnees);
    if (resultat.success) return [];

    return [
      ...new Set(
        resultat.error.issues.map((i) => i.message as ERREURS_VALIDATION)
      ),
    ];
  }

  enDonneesService(): {
    descriptionService: DonneesMinimalesRequisesDescriptionServiceV2;
    dossier?: DonneesMinimalesRequisesDossierHomologation;
  } {
    const trouveIdentifiantDonneePourDescription = <
      T extends Record<string, { description: string }>,
    >(
      d: T,
      description: string
    ): keyof T =>
      Object.entries(d).find(
        ([, valeur]) => valeur.description === description
      )?.[0] as keyof T;

    const trouveIdentifiantDonneePourNom = <
      T extends Record<string, { nom: string }>,
    >(
      d: T,
      nom: string
    ): keyof T =>
      Object.entries(d).find(
        ([, valeur]) => valeur.nom === nom
      )?.[0] as keyof T;

    const donneesDescriptionService: Omit<
      DonneesMinimalesRequisesDescriptionServiceV2,
      'niveauSecurite'
    > = {
      nomService: this.donnees.nom,
      organisationResponsable: {
        siret: this.donnees.siret,
      },
      statutDeploiement: trouveIdentifiantDonneePourDescription(
        questionsV2.statutDeploiement,
        this.donnees.statutDeploiement
      ),
      typeService: this.donnees.typeService.map((type) =>
        trouveIdentifiantDonneePourNom(questionsV2.typeDeService, type)
      ),
      typeHebergement: trouveIdentifiantDonneePourNom(
        questionsV2.typeHebergement,
        this.donnees.typeHebergement
      ),
      ouvertureSysteme: trouveIdentifiantDonneePourNom(
        questionsV2.ouvertureSysteme,
        this.donnees.ouvertureSysteme
      ),
      audienceCible: trouveIdentifiantDonneePourNom(
        questionsV2.audienceCible,
        this.donnees.audienceCible
      ),
      dureeDysfonctionnementAcceptable: trouveIdentifiantDonneePourNom(
        questionsV2.dureeDysfonctionnementAcceptable,
        this.donnees.dureeDysfonctionnementAcceptable
      ),
      volumetrieDonneesTraitees: trouveIdentifiantDonneePourNom(
        questionsV2.volumetrieDonneesTraitees,
        this.donnees.volumetrieDonneesTraitees
      ),
      localisationDonneesTraitees: trouveIdentifiantDonneePourNom(
        questionsV2.localisationDonneesTraitees,
        this.donnees.localisationDonneesTraitees
      ),
    };

    const niveauSecurite = DescriptionServiceV2.niveauSecuriteMinimalRequis({
      volumetrie: donneesDescriptionService.volumetrieDonneesTraitees,
      categories: [],
      autresDonneesTraitees: [],
      disponibilite: donneesDescriptionService.dureeDysfonctionnementAcceptable,
      audienceCible: donneesDescriptionService.audienceCible,
      ouvertureSysteme: donneesDescriptionService.ouvertureSysteme,
    });

    return {
      descriptionService: { ...donneesDescriptionService, niveauSecurite },
      ...(this.donnees.dossierHomologation && {
        dossier: {
          decision: {
            dateHomologation:
              this.donnees.dossierHomologation.dateHomologation.toLocaleDateString(
                'fr-FR'
              ),
            dureeValidite:
              this.referentiel.echeanceRenouvellementParDescription(
                this.donnees.dossierHomologation.dureeHomologation
              ),
          },
          autorite: {
            nom: this.donnees.dossierHomologation.nomAutoriteHomologation,
            fonction:
              this.donnees.dossierHomologation.fonctionAutoriteHomologation,
          },
        },
      }),
    };
  }
}
