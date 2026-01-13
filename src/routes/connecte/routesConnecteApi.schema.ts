import { z } from 'zod';
import { schemaCommunPutPostUtilisateur } from '../nonConnecte/routesNonConnecteApi.schema.js';
import { VersionService } from '../../modeles/versionService.js';
import { Referentiel, ReferentielV2 } from '../../referentiel.interface.js';
import { schemaMesureGenerale } from '../../http/schemas/mesureGenerale.schema.js';
import { schemaUtilisateur } from '../../http/schemas/utilisateur.schema.js';

export const schemaPutUtilisateur = {
  ...schemaCommunPutPostUtilisateur,
  nom: z.string().trim().min(1).max(200),
  prenom: z.string().trim().min(1).max(200),
  cguAcceptees: z.literal(true).optional(),
};

export const schemaPutMesureGenerale = (
  referentiel: Referentiel,
  referentielV2: ReferentielV2
) => ({
  idsServices: z.array(z.uuid()).min(1),
  version: z.enum(VersionService),
  statut: schemaMesureGenerale
    .statut(referentiel, referentielV2)
    .or(z.literal('')),
  modalites: schemaMesureGenerale.modalites(),
});

export const schemaPutMotDePasse = () => ({
  cguAcceptees: schemaUtilisateur.cguAcceptees(),
  infolettreAcceptee: schemaUtilisateur.infolettreAcceptee().optional(),
  motDePasse: schemaUtilisateur.motDePasse(),
});
