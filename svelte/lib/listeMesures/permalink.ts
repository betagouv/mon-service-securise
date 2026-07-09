import type { ModeleDeMesure } from './listeMesures.d';

export const mesureViaPermalink = (toutesLesMesures: ModeleDeMesure[]) => {
  const recherche = new URLSearchParams(window.location.search);
  const idPermalink = recherche.get('idMesureGenerale');

  if (!idPermalink) return null;

  return toutesLesMesures.find((m) => m.identifiantNumerique === idPermalink);
};
