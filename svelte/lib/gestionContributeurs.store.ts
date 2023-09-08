import { writable } from 'svelte/store';
import type { Utilisateur } from './gestionContributeurs.d';

type Etape = 'ListeContributeurs' | 'SuppressionContributeur';

type EtatGestionContributeursStore = {
  idMenuOuvert: string;
  etapeCourante: Etape;
  utilisateurEnCoursDeSuppression: Utilisateur;
};

const valeurParDefaut: EtatGestionContributeursStore = {
  idMenuOuvert: null,
  etapeCourante: 'ListeContributeurs',
  utilisateurEnCoursDeSuppression: null,
};

const { subscribe, update, set } =
  writable<EtatGestionContributeursStore>(valeurParDefaut);

export const gestionContributeursStore = {
  subscribe,
  afficheEtapeSuppression: (utilisateur: Utilisateur) => {
    update((valeurActuelle) => ({
      ...valeurActuelle,
      etapeCourante: 'SuppressionContributeur',
      utilisateurEnCoursDeSuppression: utilisateur,
      idMenuOuvert: null,
    }));
  },
  afficheEtapeListe: () => {
    update((valeurActuelle) => ({
      ...valeurActuelle,
      etapeCourante: 'ListeContributeurs',
      utilisateurEnCoursDeSuppression: null,
    }));
  },
  ouvrirMenuPour: (idUtilisateur: string) => {
    update((valeurActuelle) => ({
      ...valeurActuelle,
      idMenuOuvert: idUtilisateur,
    }));
  },
  reinitialise: () => set(valeurParDefaut),
};
