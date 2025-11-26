export type DetailMesure = {
  ancienneDescription?: string;
  nouvelleDescription?: string;
  statut: 'inchangee' | 'modifiee' | 'supprimee' | 'ajoutee';
};
