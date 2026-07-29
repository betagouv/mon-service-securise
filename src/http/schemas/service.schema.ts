import * as z from 'zod';
import { schemaSiret } from './siret.schema.js';
import { TousReferentiels } from '../../referentiel.interface.js';

const tableauDeDescription = z
  .array(z.strictObject({ description: z.string().min(1).max(200) }))
  .max(50);

const clesDe = (objet: Record<string, unknown>) => z.enum(Object.keys(objet));

export const schemaService = {
  delaiAvantImpactCritique: (referentiel: TousReferentiels) =>
    clesDe(referentiel.delaisAvantImpactCritique()),
  donneesCaracterePersonnel: (referentiel: TousReferentiels) =>
    z.array(clesDe(referentiel.donneesCaracterePersonnel())),
  donneesSensiblesSpecifiques: () => tableauDeDescription,
  fonctionnalites: (referentiel: TousReferentiels) =>
    z.array(clesDe(referentiel.fonctionnalites())),
  fonctionnalitesSpecifiques: () => tableauDeDescription,
  localisationDonnees: (referentiel: TousReferentiels) =>
    clesDe(referentiel.localisationsDonnees()),
  niveauSecurite: (referentiel: TousReferentiels) =>
    z.enum(referentiel.niveauxDeSecurite()),
  nomService: () => z.string().trim().nonempty().max(200),
  nombreOrganisationsUtilisatrices: () =>
    z.union([
      z.object({ borneBasse: z.literal('1'), borneHaute: z.literal('1') }),
      z.object({ borneBasse: z.literal('2'), borneHaute: z.literal('2') }),
      z.object({ borneBasse: z.literal('3'), borneHaute: z.literal('3') }),
      z.object({ borneBasse: z.literal('4'), borneHaute: z.literal('4') }),
      z.object({ borneBasse: z.literal('5'), borneHaute: z.literal('10') }),
      z.object({ borneBasse: z.literal('11'), borneHaute: z.literal('50') }),
      z.object({ borneBasse: z.literal('51'), borneHaute: z.literal('100') }),
      z.object({ borneBasse: z.literal('101'), borneHaute: z.literal('500') }),
      z.object({ borneBasse: z.literal('501'), borneHaute: z.literal('1000') }),
      z.object({
        borneBasse: z.literal('1001'),
        borneHaute: z.literal('5000'),
      }),
      z.object({
        borneBasse: z.literal('5001'),
        borneHaute: z.literal('5001'),
      }),
    ]),
  organisationResponsable: () =>
    z.strictObject({
      siret: schemaSiret.siret(),
    }),
  pointsAcces: () => tableauDeDescription,
  presentation: () => z.string().max(2000),
  provenanceService: (referentiel: TousReferentiels) =>
    clesDe(referentiel.provenancesService()),
  statutDeploiement: (referentiel: TousReferentiels) =>
    clesDe(referentiel.statutsDeploiement()),
  typeService: (referentiel: TousReferentiels) =>
    z.array(clesDe(referentiel.typesService())).min(1),
};
