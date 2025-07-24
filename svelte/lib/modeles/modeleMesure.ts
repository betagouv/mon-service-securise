export const planDActionDisponible = (statut: StatutMesure | undefined) =>
  statut === 'aLancer' || statut === 'enCours';

export type StatutMesure = 'aLancer' | 'enCours' | 'fait' | 'nonFait';
