// Axios est importé globalement depuis le pug
// On veut utiliser Axios ici car il est configuré pour utiliser le token CSRF
import type { ResumeNiveauDroit } from '../ui/types';
import type { AxiosStatic } from 'axios';
import type { Contributeur } from './kit/ChampAvecSuggestions.svelte';

declare global {
  const axios: AxiosStatic;
  interface HTMLElementEventMap {
    'svelte-recharge-contributeurs': CustomEvent;
  }
}

export type GestionContributeursProps = {
  services: Service[];
  modeVisiteGuidee: boolean;
};

export type Service = {
  id: string;
  estProprietaire: boolean;
  contributeurs: Utilisateur[];
  permissions: { gestionContributeurs: boolean };
  nomService: string;
};

export type IdUtilisateur = string;

export type Utilisateur = {
  id: IdUtilisateur;
  prenomNom: string;
  initiales: string;
  poste: string;
  email: string;
  estUtilisateurCourant: boolean;
};

type Invisible = 0;
type Lecture = 1;
type Ecriture = 2;
type Permission = Invisible | Lecture | Ecriture;

export type Rubrique =
  | 'DECRIRE'
  | 'SECURISER'
  | 'HOMOLOGUER'
  | 'RISQUES'
  | 'CONTACTS';

export const enDroitsSurRubrique = (
  resume: ResumeNiveauDroit
): Record<Rubrique, Permission> & { estProprietaire: boolean } => {
  const rubriquesAvecPermission = (p: Permission) => ({
    DECRIRE: p,
    SECURISER: p,
    HOMOLOGUER: p,
    RISQUES: p,
    CONTACTS: p,
  });

  switch (resume) {
    case 'LECTURE':
      return rubriquesAvecPermission(1);
    case 'ECRITURE':
      return rubriquesAvecPermission(2);
    case 'PROPRIETAIRE':
      return { ...rubriquesAvecPermission(2), estProprietaire: true };
    case 'PERSONNALISE':
      throw new Error(`${resume} non convertible en permission`);
  }
};

type Droits = Record<Rubrique, Permission> & { estProprietaire?: boolean };

export type Invitation = {
  utilisateur: Contributeur;
  droits: Droits;
};

export type IdAutorisation = string;

export type Autorisation = {
  idAutorisation: IdAutorisation;
  idUtilisateur: IdUtilisateur;
  resumeNiveauDroit: ResumeNiveauDroit;
  droits: Droits;
};
