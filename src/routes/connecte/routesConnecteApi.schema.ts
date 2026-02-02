import { z } from 'zod';
import { schemaCommunPutPostUtilisateur } from '../nonConnecte/routesNonConnecteApi.schema.js';
import { VersionService } from '../../modeles/versionService.js';
import { Referentiel, ReferentielV2 } from '../../referentiel.interface.js';
import {
  schemaMesureGenerale,
  schemaMesureSpecifique,
} from '../../http/schemas/mesure.schema.js';
import { schemaUtilisateur } from '../../http/schemas/utilisateur.schema.js';
import { schemaSiret } from '../../http/schemas/siret.schema.js';
import { schemaAutorisation } from '../../http/schemas/autorisation.schema.js';

export const schemaPutUtilisateur = {
  ...schemaCommunPutPostUtilisateur,
  nom: z.string().trim().min(1).max(200),
  prenom: z.string().trim().min(1).max(200),
  cguAcceptees: z.literal(true).optional(),
  token: z.string().optional(),
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
  cguAcceptees: schemaUtilisateur.cguAcceptees().optional(),
  infolettreAcceptee: schemaUtilisateur.infolettreAcceptee().optional(),
  motDePasse: schemaUtilisateur.motDePasse(),
});

export const schemaPatchMotDePasse = () => ({
  motDePasse: schemaUtilisateur.motDePasse(),
});

export const schemaDeleteAutorisation = () => ({
  idService: z.uuid(),
  idContributeur: z.uuid(),
});

export const schemaPostAutorisation = () => ({
  idServices: z.array(z.uuid()).min(1),
  emailContributeur: z.email(),
  droits: schemaAutorisation.droits(),
});

export const schemaPutMesuresSpecifiques = (
  referentiel: Referentiel,
  referentielV2: ReferentielV2
) => ({
  idsServices: z.array(z.uuid()).min(1),
  statut: schemaMesureSpecifique
    .statut(referentiel, referentielV2)
    .or(z.literal('')),
  modalites: schemaMesureSpecifique.modalites(),
});

export const schemaPostModelesMesureSpecifique = (
  referentiel: Referentiel,
  referentielV2: ReferentielV2
) => ({
  description: schemaMesureSpecifique.description(),
  descriptionLongue: schemaMesureSpecifique.descriptionLongue(),
  categorie: schemaMesureSpecifique.categorie(referentiel, referentielV2),
});

export const schemaPutModelesMesureSpecifique = (
  referentiel: Referentiel,
  referentielV2: ReferentielV2
) => ({
  description: schemaMesureSpecifique.description(),
  descriptionLongue: schemaMesureSpecifique.descriptionLongue(),
  categorie: schemaMesureSpecifique.categorie(referentiel, referentielV2),
});

export const schemaDeleteModelesMesureSpecifique = () => ({
  detacheMesures: z.stringbool().optional(),
});

export const schemaPutModelesMesureSpecifiqueServices = () => ({
  idsServicesAAssocier: z.array(z.uuid()).min(1),
});

export const schemaDeleteModelesMesureSpecifiqueServices = () => ({
  idsServices: z.array(z.uuid()),
});

export const schemaGetSupervision = (referentielV2: ReferentielV2) => ({
  filtreDate: z
    .enum(Object.keys(referentielV2.optionsFiltrageDate()))
    .optional(),
  filtreBesoinsSecurite: z.enum(referentielV2.niveauxDeSecurite()).optional(),
  filtreEntite: schemaSiret.siret().optional(),
});
