import { z } from 'zod';

const chainePouvantEtreVide = z.string().max(200).optional();

const acteurHomologation = z.strictObject({
  nom: chainePouvantEtreVide,
  fonction: chainePouvantEtreVide,
});

const partiePrenanteOptionnelle = z
  .strictObject({
    nom: chainePouvantEtreVide,
    natureAcces: chainePouvantEtreVide,
    pointContact: chainePouvantEtreVide,
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
        role: chainePouvantEtreVide,
        nom: chainePouvantEtreVide,
        fonction: chainePouvantEtreVide,
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
