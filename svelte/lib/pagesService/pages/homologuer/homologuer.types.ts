export type Dossier = {
  id: string;
  finalise: boolean;
  archive: boolean;
  importe?: boolean;
  statut: string;
  descriptionProchaineDateHomologation: string;
  indiceCyber?: number;
  indiceCyberPersonnalise?: number;
  decision: {
    dateHomologation: string;
    dureeValidite: string;
  };
  autorite: {
    nom: string;
    fonction: string;
  };
  dateTelechargement: {
    date: string;
  };
  avecAvis: boolean;
  avis: Array<{
    statut: string;
    dureeValidite: string;
    commentaires: string;
    collaborateurs: Array<string>;
  }>;
  avecDocuments: boolean;
  documents: string[];
  etapeCourante: {
    nomEtape: string;
    numeroEtape: number;
    numeroDerniereEtape: number;
  };
};

export type DossiersHomologation = {
  dossierCourant?: Dossier;
  dossierActif?: Dossier;
  dossiersPasses: Array<Dossier>;
  dossiersRefuses: Array<Dossier>;
  aucunDossier: boolean;
};
