import type {
  Autorisation,
  Service,
  Utilisateur,
} from '../gestionContributeurs.d';

const contributeurs: Utilisateur[] = [
  {
    id: 'ID-UTILISATEUR-VISITE-GUIDEE-1',
    prenomNom: 'Émilie Leroy',
    initiales: 'EL',
    poste: 'RSSI',
    email: 'emilie.leroy@beta.gouv.fr',
    estUtilisateurCourant: false,
  },
  {
    id: 'ID-UTILISATEUR-VISITE-GUIDEE-2',
    prenomNom: 'Dominique Beauvais',
    initiales: 'DB',
    poste: 'DPO',
    email: 'dominique.beauvais@beta.gouv.fr',
    estUtilisateurCourant: false,
  },
  {
    id: 'ID-UTILISATEUR-VISITE-GUIDEE-3',
    prenomNom: 'Claude Lefevre',
    initiales: 'CL',
    poste: 'Webmaster',
    email: 'claude.lefevre@beta.gouv.fr',
    estUtilisateurCourant: false,
  },
];

export const contributeursRechercheVisiteGuidee: Utilisateur[] = [
  {
    id: 'ID-UTILISATEUR-VISITE-GUIDEE-4',
    prenomNom: 'Frédérique Morin',
    initiales: 'FM',
    poste: 'RSSI',
    email: 'frederique.morin@beta.gouv.fr',
    estUtilisateurCourant: false,
  },
  {
    id: 'ID-UTILISATEUR-VISITE-GUIDEE-5',
    prenomNom: 'Frédérique Dupont',
    initiales: 'FD',
    poste: 'RSSI',
    email: 'frederique.dupont@beta.gouv.fr',
    estUtilisateurCourant: false,
  },
];

export const autorisationsVisiteGuidee: Autorisation[] = [
  {
    idUtilisateur: 'ID-UTILISATEUR-VISITE-GUIDEE-1',
    idAutorisation: 'ID-AUTORISATION-VISITE-GUIDEE-1',
    resumeNiveauDroit: 'PROPRIETAIRE',
    droits: {
      DECRIRE: 2,
      SECURISER: 2,
      HOMOLOGUER: 2,
      RISQUES: 2,
      CONTACTS: 2,
    },
  },
  {
    idUtilisateur: 'ID-UTILISATEUR-VISITE-GUIDEE-2',
    idAutorisation: 'ID-AUTORISATION-VISITE-GUIDEE-2',
    resumeNiveauDroit: 'ECRITURE',
    droits: {
      DECRIRE: 2,
      SECURISER: 2,
      HOMOLOGUER: 2,
      RISQUES: 2,
      CONTACTS: 2,
    },
  },
  {
    idUtilisateur: 'ID-UTILISATEUR-VISITE-GUIDEE-3',
    idAutorisation: 'ID-AUTORISATION-VISITE-GUIDEE-3',
    resumeNiveauDroit: 'LECTURE',
    droits: {
      DECRIRE: 1,
      SECURISER: 1,
      HOMOLOGUER: 1,
      RISQUES: 1,
      CONTACTS: 1,
    },
  },
];

export const donneesServiceVisiteGuidee: Service = {
  id: 'ID-SERVICE-VISITE-GUIDEE',
  estProprietaire: true,
  contributeurs: contributeurs,
  permissions: { gestionContributeurs: false },
  nomService: 'Nom de mon service',
};
