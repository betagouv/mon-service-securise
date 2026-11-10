import Dossier from '../dossier.js';

const listeEnFrancais = new Intl.ListFormat('fr', {
  style: 'long',
  type: 'conjunction',
});

const avisEcrits = (dossier: Dossier) => {
  const collaborateurs = dossier.avis.nomsDesCollaborateurs();
  return collaborateurs.length > 0
    ? [`Avis écrits de ${listeEnFrancais.format(collaborateurs)}`]
    : [];
};

export const piecesDuDossier = (dossier: Dossier): string[] => [
  'Présent support de commission',
  'Décision d’homologation à signer',
  ...avisEcrits(dossier),
  'Synthèse de la sécurité du service (MonServiceSécurisé)',
  'Rapport d’audit, si réalisé',
  'Analyse de risque, si réalisée',
  ...dossier.documents.documents,
];
