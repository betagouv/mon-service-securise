import { derived } from 'svelte/store';
import { rechercheParReferentiel } from './rechercheParReferentiel.store';
import { rechercheParCategorie } from './rechercheParCategorie.store';
import { resultatsDeRecherche } from './resultatsDeRecherche.store';
import { mesures } from './mesures.store';
import type { Avancement } from './rechercheParAvancement.store';

type NombreResultats = {
  filtrees: number;
  aucunResultat: boolean;
  aDesFiltresAppliques: boolean;
  nombreParAvancement: Record<Avancement, number>;
};
export const nombreResultats = derived<
  [
    typeof resultatsDeRecherche,
    typeof rechercheParReferentiel,
    typeof rechercheParCategorie,
  ],
  NombreResultats
>(
  [resultatsDeRecherche, rechercheParReferentiel, rechercheParCategorie],
  ([
    $resultatsDeRecherche,
    $rechercheParReferentiel,
    $rechercheParCategorie,
  ]) => {
    const nbMesuresGeneralesFiltrees = Object.keys(
      $resultatsDeRecherche.mesuresGenerales
    ).length;
    const nbMesuresSpecifiquesFiltrees =
      $resultatsDeRecherche.mesuresSpecifiques.length;
    const nbMesuresFiltreesTotal =
      nbMesuresGeneralesFiltrees + nbMesuresSpecifiquesFiltrees;

    return {
      filtrees: nbMesuresFiltreesTotal,
      aucunResultat: nbMesuresFiltreesTotal === 0,
      aDesFiltresAppliques:
        $rechercheParReferentiel.length > 0 ||
        $rechercheParCategorie.length > 0,
      nombreParAvancement: {
        statutADefinir:
          $resultatsDeRecherche.parAvancement.statutADefinir.length,
        enAction: $resultatsDeRecherche.parAvancement.enAction.length,
        toutes: $resultatsDeRecherche.parAvancement.toutes.length,
        traite: $resultatsDeRecherche.parAvancement.traite.length,
      },
    };
  }
);
