import { derived } from 'svelte/store';
import { services } from './services.store';
import { resultatsDeRecherche } from './resultatDeRecherche.store';

type Etat = 'aucunService' | 'aucunResultatDeRecherche' | null;
type EtatAffichage = {
  doitAfficher: boolean;
  etat: Etat;
};

export const affichageTableauVide = derived<
  [typeof services, typeof resultatsDeRecherche],
  EtatAffichage
>([services, resultatsDeRecherche], ([$services, $resultatsDeRecherche]) => {
  let doitAfficher = true;
  let etat = null;

  if ($services.length === 0) {
    etat = 'aucunService' as Etat;
  } else if ($resultatsDeRecherche.length === 0) {
    etat = 'aucunResultatDeRecherche' as Etat;
  } else {
    doitAfficher = false;
  }

  return { doitAfficher, etat };
});
