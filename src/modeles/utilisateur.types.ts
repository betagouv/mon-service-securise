export type PartieModifiableProfilUtilisateur = {
  telephone?: string;
  entite: { siret: string };
  estimationNombreServices: {
    borneBasse: string;
    borneHaute: string;
  };
  infolettreAcceptee: boolean;
  transactionnelAccepte: boolean;
  pixelDeSuiviAccepte: boolean;
  postes: string[];
  cguAcceptees?: string;
};

export type IdentiteFournieParProConnect = {
  nom: string;
  prenom: string;
  email: string;
};
