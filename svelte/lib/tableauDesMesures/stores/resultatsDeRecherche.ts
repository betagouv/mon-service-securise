import { derived } from 'svelte/store';
import type {
  MesureGenerale,
  Mesures,
  MesureSpecifique,
} from '../tableauDesMesures.d';
import {
  appliqueFiltreTextuel,
  rechercheTextuelle,
} from './rechercheTextuelle.store';
import {
  appliqueFiltreParCategorie,
  rechercheParCategorie,
} from './rechercheParCategorie.store';
import {
  appliqueRechercheParReferentiel,
  rechercheParReferentiel,
} from './rechercheParReferentiel.store';
import { mesures } from './mesures.store';

enum IdFiltre {
  rechercheTextuelle,
  rechercheParCategorie,
  rechercheParReferentiel,
}

type Filtre = (mesure: MesureSpecifique | MesureGenerale) => boolean;
type FiltresPredicats = Record<IdFiltre, Filtre>;
type Predicats = { actifs: IdFiltre[]; filtres: FiltresPredicats };

const predicats = derived<
  [
    typeof rechercheTextuelle,
    typeof rechercheParCategorie,
    typeof rechercheParReferentiel,
  ],
  Predicats
>(
  [rechercheTextuelle, rechercheParCategorie, rechercheParReferentiel],
  ([$rechercheTextuelle, $rechercheParCategorie, $rechercheParReferentiel]) => {
    const filtresActifs = [];

    if ($rechercheTextuelle) filtresActifs.push(IdFiltre.rechercheTextuelle);
    if ($rechercheParCategorie.length > 0)
      filtresActifs.push(IdFiltre.rechercheParCategorie);
    if ($rechercheParReferentiel.length > 0)
      filtresActifs.push(IdFiltre.rechercheParReferentiel);

    return {
      actifs: filtresActifs,
      filtres: {
        [IdFiltre.rechercheTextuelle]: (
          mesure: MesureSpecifique | MesureGenerale
        ) => appliqueFiltreTextuel(mesure, $rechercheTextuelle),

        [IdFiltre.rechercheParCategorie]: (
          mesure: MesureSpecifique | MesureGenerale
        ) => appliqueFiltreParCategorie(mesure, $rechercheParCategorie),

        [IdFiltre.rechercheParReferentiel]: (
          mesure: MesureSpecifique | MesureGenerale
        ) => appliqueRechercheParReferentiel(mesure, $rechercheParReferentiel),
      },
    };
  }
);

export const resultatsDeRecherche = derived<
  [typeof mesures, typeof predicats],
  Mesures
>([mesures, predicats], ([$mesures, $predicats]) => ({
  mesuresGenerales: Object.entries($mesures.mesuresGenerales)
    .filter(([_, mesure]) =>
      $predicats.actifs
        .map((idPredicat: IdFiltre) => $predicats.filtres[idPredicat])
        .every((predicat: Filtre) => predicat(mesure))
    )
    .reduce(
      (record, [idMesure, mesure]) => ({ ...record, [idMesure]: mesure }),
      {}
    ),

  mesuresSpecifiques: $mesures.mesuresSpecifiques.filter((mesure) =>
    $predicats.actifs
      .map((idPredicat: IdFiltre) => $predicats.filtres[idPredicat])
      .every((predicat: Filtre) => predicat(mesure))
  ),
}));
