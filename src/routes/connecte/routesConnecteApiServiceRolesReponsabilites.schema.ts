import { z } from 'zod';

const chainePouvantEtreVide = z.string().max(200);
const chaineOptionelleNonVide = z.string().min(1).max(200).optional();

export const schemaPostRolesResponsabilites = () => ({
  autoriteHomologation: chainePouvantEtreVide,
  fonctionAutoriteHomologation: chainePouvantEtreVide,
  expertCybersecurite: chainePouvantEtreVide,
  fonctionExpertCybersecurite: chainePouvantEtreVide,
  delegueProtectionDonnees: chainePouvantEtreVide,
  fonctionDelegueProtectionDonnees: chainePouvantEtreVide,
  piloteProjet: chainePouvantEtreVide,
  fonctionPiloteProjet: chainePouvantEtreVide,
  acteursHomologation: z
    .array(
      z.strictObject({
        role: chaineOptionelleNonVide,
        nom: chaineOptionelleNonVide,
        fonction: chaineOptionelleNonVide,
      })
    )
    .max(50),
  partiesPrenantes: z
    .array(
      z.strictObject({
        type: z.enum([
          'PartiePrenanteSpecifique',
          'Hebergement',
          'DeveloppementFourniture',
          'MaintenanceService',
          'SecuriteService',
        ]),
        nom: chaineOptionelleNonVide,
        natureAcces: chaineOptionelleNonVide,
        pointContact: chaineOptionelleNonVide,
      })
    )
    .max(50),
});
