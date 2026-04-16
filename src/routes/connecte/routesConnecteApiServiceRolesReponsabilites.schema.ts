import { z } from 'zod';

const chainePouvantEtreVide = z.string().max(200);
const chaineOptionelleNonVide = z.string().min(1).max(200).optional();

const acteurHomologation = z.strictObject({
  nom: chainePouvantEtreVide,
  fonction: chainePouvantEtreVide,
});

const partiePrenanteOptionnelle = z
  .strictObject({
    nom: chaineOptionelleNonVide,
    natureAcces: chaineOptionelleNonVide,
    pointContact: chaineOptionelleNonVide,
  })
  .optional();

export const schemaPostRolesResponsabilites = () => ({
  autoriteHomologation: acteurHomologation,
  expertCybersecurite: acteurHomologation,
  delegueProtectionDonnees: acteurHomologation,
  piloteProjet: acteurHomologation,
  acteursHomologation: z
    .array(
      z.strictObject({
        role: chaineOptionelleNonVide,
        nom: chaineOptionelleNonVide,
        fonction: chaineOptionelleNonVide,
      })
    )
    .max(50),
  partiesPrenantes: z.strictObject({
    Hebergement: partiePrenanteOptionnelle,
    MaintenanceService: partiePrenanteOptionnelle,
    DeveloppementFourniture: partiePrenanteOptionnelle,
    SecuriteService: partiePrenanteOptionnelle,
  }),
  partiesPrenantesSpecifiques: z.array(partiePrenanteOptionnelle).max(50),
});
