export type PartieModifiableProfilUtilisateur = {
  prenom: string;
  nom: string;
  telephone?: string;
  entite: { siret: string };
  estimationNombreServices: {
    borneBasse: string;
    borneHaute: string;
  };
  infolettreAcceptee: boolean;
  transactionnelAccepte: boolean;
  postes: string[];
  cguAcceptees?: string;
};
