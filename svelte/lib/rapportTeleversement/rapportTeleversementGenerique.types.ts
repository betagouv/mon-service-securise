export type ResumeRapportTeleversement = {
  statut: 'VALIDE' | 'INVALIDE';
  elementsValide: null | { label: string };
  elementsErreur: null | { label: string };
  labelValiderTeleversement: string;
};
