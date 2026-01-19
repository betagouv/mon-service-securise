import * as z from 'zod';
import { questionsV2 } from '../../../donneesReferentielMesuresV2.js';
import donneesReferentiel from '../../../donneesReferentiel.js';
import { DonneesServiceTeleverseV2 } from './serviceTeleverseV2.js';
import { schemaSiret } from '../../http/schemas/siret.schema.js';

enum ERREURS {
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

export class ValidationServiceTeleverseV2 {
  // eslint-disable-next-line no-empty-function
  constructor(private readonly nomServicesExistants: string[]) {}

  private schemaZod() {
    const e = ERREURS;

    return z.object({
      nom: z
        .string(e.NOM_INVALIDE)
        .trim()
        .nonempty(e.NOM_INVALIDE)
        .max(200, e.NOM_INVALIDE)
        .refine((n) => !this.nomServicesExistants.includes(n), e.NOM_EXISTANT),
      siret: z
        .string(e.SIRET_INVALIDE)
        .regex(schemaSiret.regexSiret(), e.SIRET_INVALIDE),
      statutDeploiement: z.enum(
        Object.values(questionsV2.statutDeploiement).map((s) => s.description),
        e.STATUT_DEPLOIEMENT_INVALIDE
      ),
      typeService: z
        .array(
          z.enum(
            Object.values(questionsV2.typeDeService).map((t) => t.nom),
            e.TYPE_INVALIDE
          ),
          e.TYPE_INVALIDE
        )
        .nonempty(e.TYPE_INVALIDE),
      typeHebergement: z.enum(
        Object.values(questionsV2.typeHebergement).map((t) => t.nom),
        e.TYPE_HEBERGEMENT_INVALIDE
      ),
      ouvertureSysteme: z.enum(
        Object.values(questionsV2.ouvertureSysteme).map((o) => o.nom),
        e.OUVERTURE_SYSTEME_INVALIDE
      ),
      audienceCible: z.enum(
        Object.values(questionsV2.audienceCible).map((a) => a.nom),
        e.AUDIENCE_CIBLE_INVALIDE
      ),
      dureeDysfonctionnementAcceptable: z.enum(
        Object.values(questionsV2.dureeDysfonctionnementAcceptable).map(
          (d) => d.nom
        ),
        e.DELAI_AVANT_IMPACT_CRITIQUE_INVALIDE
      ),
      volumetrieDonneesTraitees: z.enum(
        Object.values(questionsV2.volumetrieDonneesTraitees).map((v) => v.nom),
        e.VOLUMETRIE_DONNEES_TRAITEES_INVALIDE
      ),
      localisationDonneesTraitees: z.enum(
        Object.values(questionsV2.localisationDonneesTraitees).map(
          (l) => l.nom
        ),
        e.LOCALISATION_INVALIDE
      ),
      dossierHomologation: z
        .strictObject({
          dateHomologation: z.date(e.DATE_HOMOLOGATION_INVALIDE),
          dureeHomologation: z.enum(
            Object.values(donneesReferentiel.echeancesRenouvellement).map(
              (l) => l.description
            ),
            e.DUREE_HOMOLOGATION_INVALIDE
          ),
          nomAutoriteHomologation: z
            .string(e.DOSSIER_HOMOLOGATION_INCOMPLET)
            .trim()
            .nonempty(e.DOSSIER_HOMOLOGATION_INCOMPLET),
          fonctionAutoriteHomologation: z
            .string(e.DOSSIER_HOMOLOGATION_INCOMPLET)
            .trim()
            .nonempty(e.DOSSIER_HOMOLOGATION_INCOMPLET),
        })
        .optional(),
    });
  }

  valide(donnees: DonneesServiceTeleverseV2) {
    const resultat = this.schemaZod().safeParse(donnees);

    if (resultat.success) return [];

    return [...new Set(resultat.error.issues.map((i) => i.message as ERREURS))];
  }
}
