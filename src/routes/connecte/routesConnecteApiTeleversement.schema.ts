import { z } from 'zod';
import { chaineDateFrEnChaineDateISO } from '../../utilitaires/date.js';
import { Referentiel } from '../../referentiel.interface.js';

const NOMBRE_MAXIMUM_DE_SERVICES = 250;
const NOMBRE_MAXIMUM_DE_TYPES_PAR_SERVICE = 5;

const celluleTexte = () => z.string().max(1000);

const celluleDateFr = () =>
  celluleTexte().transform((dateFr) =>
    dateFr ? new Date(chaineDateFrEnChaineDateISO(dateFr)) : undefined
  );

export const schemaPostTeleversementServices = () => ({
  services: z
    .array(
      z.strictObject({
        nom: celluleTexte(),
        siret: celluleTexte(),
        statutDeploiement: celluleTexte(),
        typeService: z
          .array(celluleTexte())
          .max(NOMBRE_MAXIMUM_DE_TYPES_PAR_SERVICE),
        typeHebergement: celluleTexte(),
        ouvertureSysteme: celluleTexte(),
        audienceCible: celluleTexte(),
        dureeDysfonctionnementAcceptable: celluleTexte(),
        volumetrieDonneesTraitees: celluleTexte(),
        localisationDonneesTraitees: celluleTexte(),
        dateHomologation: celluleDateFr(),
        dureeHomologation: celluleTexte(),
        nomAutoriteHomologation: celluleTexte(),
        fonctionAutoriteHomologation: celluleTexte(),
      })
    )
    .max(NOMBRE_MAXIMUM_DE_SERVICES),
});

export const schemaPostTeleversementModelesMesureSpecifique = (
  referentiel: Referentiel
) => ({
  modelesMesureSpecifique: z
    .array(
      z.strictObject({
        description: z.string().max(1000),
        descriptionLongue: z.string().max(2000),
        categorie: celluleTexte(),
      })
    )
    .max(referentiel.nombreMaximumDeModelesMesureSpecifiqueParUtilisateur()),
});
