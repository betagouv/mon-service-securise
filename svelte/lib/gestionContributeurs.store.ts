import { writable } from 'svelte/store';
import type { Service, Utilisateur } from './gestionContributeurs.d';

type Etape =
  | 'ListeContributeurs'
  | 'SuppressionContributeur'
  | 'InvitationContributeurs';

type EtatGestionContributeursStore = {
  etapeCourante: Etape;
  utilisateurEnCoursDeSuppression: Utilisateur | null;
  services: Service[];
};

const valeurParDefaut: EtatGestionContributeursStore = {
  etapeCourante: 'ListeContributeurs',
  utilisateurEnCoursDeSuppression: null,
  services: [],
};

const { subscribe, update, set } =
  writable<EtatGestionContributeursStore>(valeurParDefaut);

export const store = {
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
    update((etat) => ({ ...etat, etapeCourante: 'InvitationContributeurs' }));
  },
  supprimeContributeur: (contributeur: Utilisateur) => {
    update((etat) => {
      const [serviceUnique] = etat.services;
      serviceUnique.contributeurs = serviceUnique.contributeurs.filter(
        (c) => c.id != contributeur.id
      );
      return { ...etat, services: [serviceUnique] };
    });
  },
  reinitialise: (services: Service[]) => set({ ...valeurParDefaut, services }),
};
