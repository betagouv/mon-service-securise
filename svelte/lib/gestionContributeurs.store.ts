import { writable } from 'svelte/store';
import type { Utilisateur } from './gestionContributeurs.d';

type Etape = 'ListeContributeurs' | 'SuppressionContributeur';

type EtatGestionContributeursStore = {
  idMenuOuvert: string;
  etapeCourante: Etape;
  utilisateurEnCoursDeSuppression: Utilisateur;
};

let { subscribe, update } = writable<EtatGestionContributeursStore>({
  idMenuOuvert: null,
  etapeCourante: 'ListeContributeurs',
  utilisateurEnCoursDeSuppression: null,
});

export const gestionContributeursStore = {
  subscribe,
  ouvrirMenuPour: (idUtilisateur: string) => {
    update((valeurActuelle) => ({
      ...valeurActuelle,
      idMenuOuvert: idUtilisateur,
    }));
  },
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
};
