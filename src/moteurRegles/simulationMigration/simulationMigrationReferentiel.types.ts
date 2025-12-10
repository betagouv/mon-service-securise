export type DetailMesure = {
  ancienneDescription?: string;
  nouvelleDescription?: string;
  statut: 'inchangee' | 'modifiee' | 'supprimee' | 'ajoutee';
  detailStatut:
    | 'conforme'
    | 'modificationMineure'
    | 'modificationMajeure'
    | 'split'
    | 'conformeSplit'
    | 'absente'
    | 'reunification'
    | 'introduite';
};
