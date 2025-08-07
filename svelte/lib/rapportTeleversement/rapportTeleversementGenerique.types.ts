export type ResumeRapportTeleversement = {
  statut: 'VALIDE' | 'INVALIDE';
  elementsValide: { label: string };
  elementsErreur: null | { label: string };
  labelValiderTeleversement: string;
};
