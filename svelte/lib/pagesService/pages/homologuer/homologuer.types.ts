export type AutoriteHomologation = { nom: string; fonction: string };

export type AvisHomologation = {
  statut: string;
  dureeValidite: string;
  commentaires: string;
  collaborateurs: Array<string>;
};

export type DecisionHomologation = {
  dateHomologation: string;
  dureeValidite?: string;
  refusee?: boolean;
};

export type Dossier = {
  id: string;
  finalise: boolean;
  archive: boolean;
  importe?: boolean;
  statut: string;
  descriptionProchaineDateHomologation: string;
  indiceCyber?: number;
  indiceCyberPersonnalise?: number;
  decision: DecisionHomologation;
  autorite: AutoriteHomologation;
  dateTelechargement: { date: string };
  avecAvis: boolean;
  avis: Array<AvisHomologation>;
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
