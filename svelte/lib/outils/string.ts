export const singulierPluriel = (
  chaineSingulier: string,
  chainePluriel: string,
  nombre: number
) => (nombre > 1 ? chainePluriel : chaineSingulier);
