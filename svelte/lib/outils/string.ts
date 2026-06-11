export const singulierPluriel = (
  chaineSingulier: string,
  chainePluriel: string,
  nombre: number
) => (nombre > 1 ? chainePluriel : chaineSingulier);

export const chaineNormalisee = (chaine: string) =>
  chaine
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
