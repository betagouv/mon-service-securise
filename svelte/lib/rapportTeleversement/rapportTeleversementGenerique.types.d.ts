export type ResumeRapportTeleversement = {
  statut: 'VALIDE' | 'INVALIDE';
  erreurGenerale: null | string;
  elementsValide: null | { label: string };
  elementsErreur: null | { label: string };
  labelValiderTeleversement: string;
};
