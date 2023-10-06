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

type Invisible = 0;
type Lecture = 1;
type Ecriture = 2;
type Permission = Invisible | Lecture | Ecriture;

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
): Record<Rubrique, Permission> => {
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
    case 'PERSONNALISE':
      throw new Error(`${resume} non convertible en permission`);
  }
};

export type IdAutorisation = string;

export type Autorisation = {
  idAutorisation: IdAutorisation;
  idUtilisateur: IdUtilisateur;
  resumeNiveauDroit: ResumeNiveauDroit;
  droits: Record<Rubrique, Permission>;
};
