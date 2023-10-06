// Axios est importé globalement depuis le pug
// On veut utiliser Axios ici car il est configuré pour utiliser le token CSRF
declare global {
  const axios: any;
}

export type GestionContributeursProps = {
  services: Service[];
};

export type Service = {
  id: string;
  createur: Utilisateur;
  estCreateur: boolean;
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
};

export type ResumeNiveauDroit =
  | 'PROPRIETAIRE'
  | 'ECRITURE'
  | 'LECTURE'
  | 'PERSONNALISE';

export type Rubrique =
  | 'DECRIRE'
  | 'SECURISER'
  | 'HOMOLOGUER'
  | 'RISQUES'
  | 'CONTACTS';

export const enDroitsSurRubrique = (
  resume: ResumeNiveauDroit
): Record<Rubrique, number> => {
  const rubriquesAvecDroit = (droit: number) => ({
    DECRIRE: droit,
    SECURISER: droit,
    HOMOLOGUER: droit,
    RISQUES: droit,
    CONTACTS: droit,
  });

  switch (resume) {
    case 'LECTURE':
      return rubriquesAvecDroit(1);
    case 'ECRITURE':
      return rubriquesAvecDroit(2);
    case 'PROPRIETAIRE':
    case 'PERSONNALISE':
      throw new Error(`${resume} non convertible en permission`);
  }
};

export type IdAutorisation = string;

export type Autorisation = {
  idAutorisation: IdAutorisation;
  idUtilisateur: IdUtilisateur;
  resumeNiveauDroit: ResumeNiveauDroit;
};
