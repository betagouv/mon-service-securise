import { writable } from 'svelte/store';
import type {
  Autorisation,
  Service,
  Utilisateur,
} from './gestionContributeurs.d';

type Etape =
  | 'ListeContributeurs'
  | 'SuppressionContributeur'
  | 'InvitationContributeurs';

type EtatGestionContributeursStore = {
  etapeCourante: Etape;
  utilisateurEnCoursDeSuppression: Utilisateur | null;
  services: Service[];
  autorisations: Record<string, Autorisation>;
};

const valeurParDefaut: EtatGestionContributeursStore = {
  etapeCourante: 'ListeContributeurs',
  utilisateurEnCoursDeSuppression: null,
  services: [],
  autorisations: {},
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
  chargeAutorisations: (autorisations: Autorisation[]) => {
    const parIdUtilisateur = autorisations.reduce(
      (acc: Record<string, Autorisation>, a: Autorisation) => ({
        ...acc,
        [a.idUtilisateur]: a,
      }),
      {}
    );
    update((etat) => ({ ...etat, autorisations: parIdUtilisateur }));
  },
  remplaceAutorisation: (remplacante: Autorisation) => {
    update((etat) => ({
      ...etat,
      autorisations: {
        ...etat.autorisations,
        [remplacante.idUtilisateur]: remplacante,
      },
    }));
  },
};
