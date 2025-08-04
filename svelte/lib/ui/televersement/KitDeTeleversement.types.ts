export type EtatTeleversement =
  | 'EnAttente'
  | 'EnCoursEnvoi'
  | 'Invalide'
  | 'Valide';

export enum FormatAccepte {
  Excel = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}
