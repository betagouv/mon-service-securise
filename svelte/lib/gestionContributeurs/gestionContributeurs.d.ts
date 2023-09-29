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
  permissions: { suppressionContributeur: boolean };
  nomService: string;
};

export type Utilisateur = {
  id: string;
  prenomNom: string;
  initiales: string;
  poste: string;
  email: string;
};

export type ResumeNiveauDroit = 'ECRITURE' | 'LECTURE' | 'PERSONNALISE';

export type Autorisation = {
  idUtilisateur: string;
  resumeNiveauDroit: ResumeNiveauDroit;
};
