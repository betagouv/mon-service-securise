import Dossier from '../dossier.js';

export type PieceDuDossier = {
  intitule: string;
  intituleAbrege?: string;
  source: 'MonServiceSécurisé' | 'Utilisateur';
  cochee: boolean;
};

const listeEnFrancais = new Intl.ListFormat('fr', {
  style: 'long',
  type: 'conjunction',
});

const pieceMSS = (intitule: string, cochee = false): PieceDuDossier => ({
  intitule,
  source: 'MonServiceSécurisé',
  cochee,
});

const pieceUtilisateur = (intitule: string): PieceDuDossier => ({
  intitule,
  source: 'Utilisateur',
  cochee: false,
});

const avisEcrits = (dossier: Dossier) => {
  const collaborateurs = dossier.avis.nomsDesCollaborateurs();
  return collaborateurs.length > 0
    ? [
        {
          ...pieceUtilisateur(
            `Avis écrits de ${listeEnFrancais.format(collaborateurs)}`
          ),
          intituleAbrege: 'Avis écrits des collaborateurs',
        },
      ]
    : [];
};

export const piecesDuDossier = (dossier: Dossier): PieceDuDossier[] => [
  pieceMSS('Présent support de commission', true),
  pieceMSS('Décision d’homologation à signer', true),
  ...avisEcrits(dossier),
  pieceMSS('Synthèse de la sécurité du service'),
  pieceUtilisateur('Rapport d’audit, si réalisé'),
  pieceUtilisateur('Analyse de risque, si réalisée'),
  ...dossier.documents.documents.map((intitule) => pieceUtilisateur(intitule)),
];
