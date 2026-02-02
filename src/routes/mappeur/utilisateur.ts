import * as z from 'zod';
import { schemaPutUtilisateur } from '../connecte/routesConnecteApi.schema.js';
import { ServiceCgu } from '../../serviceCgu.interface.js';
import { PartieModifiableProfilUtilisateur } from '../../modeles/utilisateur.types.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const corpsRequete = z.object(schemaPutUtilisateur);
export type CorpsRequetePutOuPostUtilisateur = z.infer<typeof corpsRequete>;

const obtentionDonneesDeBaseUtilisateur = (
  corps: CorpsRequetePutOuPostUtilisateur,
  serviceCGU: ServiceCgu
): PartieModifiableProfilUtilisateur => {
  const donnees: PartieModifiableProfilUtilisateur = {
    telephone: corps.telephone,
    entite: { siret: corps.siretEntite },
    estimationNombreServices: corps.estimationNombreServices,
    infolettreAcceptee: corps.infolettreAcceptee,
    transactionnelAccepte: corps.transactionnelAccepte,
    postes: corps.postes,
  };
  if (corps.cguAcceptees) {
    donnees.cguAcceptees = serviceCGU.versionActuelle();
  }
  return donnees;
};

export { obtentionDonneesDeBaseUtilisateur };
