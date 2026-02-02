import * as z from 'zod';
import Utilisateur from '../../modeles/utilisateur.js';
import { schemaPutUtilisateur } from '../connecte/routesConnecteApi.schema.js';
import { ServiceCgu } from '../../serviceCgu.interface.js';
import { PartieModifiableProfilUtilisateur } from '../../modeles/utilisateur.types.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const corpsRequete = z.object(schemaPutUtilisateur);
export type CorpsRequeteUtilisateur = z.infer<typeof corpsRequete>;

const obtentionDonneesDeBaseUtilisateur = (
  corps: CorpsRequeteUtilisateur,
  serviceCGU: ServiceCgu
) => {
  const donnees: PartieModifiableProfilUtilisateur = {
    prenom: corps.prenom,
    nom: corps.nom,
    telephone: corps.telephone,
    entite: {
      siret: corps.siretEntite,
    },
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

const messageErreurDonneesUtilisateur = (
  donneesRequete: CorpsRequeteUtilisateur,
  utilisateurExiste: boolean
) => {
  try {
    Utilisateur.valideDonnees(donneesRequete, utilisateurExiste);
    return { donneesInvalides: false };
  } catch (erreur) {
    return { donneesInvalides: true, messageErreur: (erreur as Error).message };
  }
};

export { obtentionDonneesDeBaseUtilisateur, messageErreurDonneesUtilisateur };
