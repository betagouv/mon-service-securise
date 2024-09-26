declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-profil': CustomEvent;
  }
}

export type Departement = {
  nom: string;
  code: string;
};

export type Utilisateur = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  postes: string[];
  infolettreAcceptee: boolean;
  transactionnelAccepte: boolean;
  estimationNombreServices: {
    borneBasse: string;
    borneHaute: string;
  };
};

export type ProfilProps = {
  departements: Departement[];
  utilisateur: Utilisateur;
};
