import * as z from 'zod';
import { questionsV2 } from '../../../donneesReferentielMesuresV2.js';

const reglesValidationsCommunesABrouillonEtDescription = {
  nomService: z.string().trim().nonempty().max(200),
  statutDeploiement: z.enum(Object.keys(questionsV2.statutDeploiement)),
  presentation: z.string().trim().optional(),
  typeService: z
    .array(z.enum(Object.keys(questionsV2.typeDeService)))
    .nonempty(),
  specificitesProjet: z.array(
    z.enum(Object.keys(questionsV2.specificiteProjet))
  ),
  typeHebergement: z.enum(Object.keys(questionsV2.typeHebergement)),
  activitesExternalisees: z.array(
    z.enum(Object.keys(questionsV2.activiteExternalisee))
  ),
  ouvertureSysteme: z.enum(Object.keys(questionsV2.ouvertureSysteme)),
  audienceCible: z.enum(Object.keys(questionsV2.audienceCible)),
  dureeDysfonctionnementAcceptable: z.enum(
    Object.keys(questionsV2.dureeDysfonctionnementAcceptable)
  ),
  categoriesDonneesTraitees: z.array(
    z.enum(Object.keys(questionsV2.categorieDonneesTraitees))
  ),
  categoriesDonneesTraiteesSupplementaires: z.array(
    z.string().trim().nonempty()
  ),
  volumetrieDonneesTraitees: z.enum(
    Object.keys(questionsV2.volumetrieDonneesTraitees)
  ),
  localisationDonneesTraitees: z.enum(
    Object.keys(questionsV2.localisationDonneesTraitees)
  ),
  niveauSecurite: z.enum(Object.keys(questionsV2.niveauSecurite)),
};

export const reglesValidationBrouillonServiceV2 = {
  ...reglesValidationsCommunesABrouillonEtDescription,
  siret: z.string().regex(/^\d{14}$/),
  pointsAcces: z.array(z.string().trim().nonempty()),
};

export const reglesValidationDescriptionServiceV2 = {
  ...reglesValidationsCommunesABrouillonEtDescription,
  organisationResponsable: z.object({
    siret: z.string().regex(/^\d{14}$/),
  }),
  pointsAcces: z.array(z.object({ description: z.string().trim().nonempty() })),
};
