import { writable } from 'svelte/store';
import type { Utilisateur } from './gestionContributeurs.d';

type Etape =
  | 'ListeContributeurs'
  | 'SuppressionContributeur'
  | 'InvitationContributeurs';

type EtatGestionContributeursStore = {
  etapeCourante: Etape;
  utilisateurEnCoursDeSuppression: Utilisateur | null;
};

const valeurParDefaut: EtatGestionContributeursStore = {
  etapeCourante: 'ListeContributeurs',
  utilisateurEnCoursDeSuppression: null,
};

const { subscribe, update, set } =
  writable<EtatGestionContributeursStore>(valeurParDefaut);

export const gestionContributeursStore = {
  subscribe,
  afficheEtapeSuppression: (utilisateur: Utilisateur) => {
    update((etat) => ({
      ...etat,
      etapeCourante: 'SuppressionContributeur',
      utilisateurEnCoursDeSuppression: utilisateur,
    }));
  },
  afficheEtapeListe: () => {
    update((etat) => ({
      ...etat,
      etapeCourante: 'ListeContributeurs',
      utilisateurEnCoursDeSuppression: null,
    }));
  },
  afficheEtapeInvitation: () => {
    update((valeurActuelle) => ({
      ...valeurActuelle,
      etapeCourante: 'InvitationContributeurs',
    }));
  },
  reinitialise: () => set(valeurParDefaut),
};
