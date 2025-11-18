export type UUID = `${string}-${string}-${string}-${string}-${string}`;
export type DonneesChiffrees = {
  iv: string;
  aad: string;
  donnees: string;
  tag: string;
};
