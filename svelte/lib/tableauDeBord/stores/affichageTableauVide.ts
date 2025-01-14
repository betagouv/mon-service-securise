import { derived } from 'svelte/store';
import { services } from './services.store';
import { resultatsDeRecherche } from './resultatDeRecherche.store';
import { affichageParStatutHomologationSelectionne } from './affichageParStatutHomologation';

type Etat =
  | 'aucunService'
  | 'aucunResultatDeRecherche'
  | 'aucunDossierHomologationEnCours'
  | null;
type EtatAffichage = {
  doitAfficher: boolean;
  etat: Etat;
};

export const affichageTableauVide = derived<
  [
    typeof services,
    typeof resultatsDeRecherche,
    typeof affichageParStatutHomologationSelectionne,
  ],
  EtatAffichage
>(
  [services, resultatsDeRecherche, affichageParStatutHomologationSelectionne],
  ([
    $services,
    $resultatsDeRecherche,
    $affichageParStatutHomologationSelectionne,
  ]) => {
    let doitAfficher = true;
    let etat = null;

    if ($services.length === 0) {
      etat = 'aucunService' as Etat;
    } else if ($resultatsDeRecherche.length === 0) {
      etat = 'aucunResultatDeRecherche' as Etat;
    } else if (
      $affichageParStatutHomologationSelectionne === 'enCoursEdition' &&
      $resultatsDeRecherche.filter((s) => s.statutHomologation.enCoursEdition)
        .length === 0
    ) {
      etat = 'aucunDossierHomologationEnCours' as Etat;
    } else {
      doitAfficher = false;
    }

    return { doitAfficher, etat };
  }
);
