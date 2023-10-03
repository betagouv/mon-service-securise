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

export type Utilisateur = {
  id: string;
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

export const enPermission = (resume: ResumeNiveauDroit) => {
  switch (resume) {
    case 'LECTURE':
      return 1;
    case 'ECRITURE':
      return 2;
    case 'PROPRIETAIRE':
    case 'PERSONNALISE':
      throw new Error(`${resume} non convertible en permission`);
  }
};

export type Autorisation = {
  idAutorisation: string;
  idUtilisateur: string;
  resumeNiveauDroit: ResumeNiveauDroit;
};
