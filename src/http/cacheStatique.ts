const UN_AN_EN_SECONDES = 31536000;

export const enTeteCachePourFichierStatique = (
  chemin: string,
  politiqueParDefaut: string
) => {
  const estBundleSvelte = chemin.includes('composants-svelte');
  return estBundleSvelte
    ? `public, max-age=${UN_AN_EN_SECONDES}, immutable`
    : politiqueParDefaut;
};
