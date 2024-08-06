export const planDActionDisponible = (statut: StatutMesure) =>
  statut === 'aLancer' || statut === 'enCours';

export type StatutMesure = string;
