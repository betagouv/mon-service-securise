import { derived, writable } from 'svelte/store';
import type {
  MesureGenerale,
  Mesures,
  MesureSpecifique,
} from './tableauDesMesures.d';
import {
  appliqueRechercheParReferentiel,
  rechercheParReferentiel,
} from './storesDeRecherche/rechercheParReferentiel.store';
import {
  appliqueFiltreTextuel,
  rechercheTextuelle,
} from './storesDeRecherche/rechercheTextuelle.store';
import {
  appliqueFiltreParCategorie,
  rechercheParCategorie,
} from './storesDeRecherche/rechercheParCategorie.store';

const mesuresParDefaut = (): Mesures => ({
  mesuresGenerales: {},
  mesuresSpecifiques: [],
});

const { subscribe, set, update } = writable<Mesures>(mesuresParDefaut());

export const mesures = {
  set,
  subscribe,
  reinitialise: (mesures?: Mesures) => set(mesures ?? mesuresParDefaut()),
  metAJourStatutMesureGenerale: (idMesure: string, statut: string) =>
    update((valeur) => {
      valeur.mesuresGenerales[idMesure].statut = statut;
      return valeur;
    }),
  metAJourStatutMesureSpecifique: (idMesure: number, statut: string) =>
    update((valeur) => {
      valeur.mesuresSpecifiques[idMesure].statut = statut;
      return valeur;
    }),
};

enum IdFiltre {
  rechercheTextuelle,
  rechercheParCategorie,
  rechercheParReferentiel,
}
type Filtre = (mesure: MesureSpecifique | MesureGenerale) => boolean;
type FiltresPredicats = Record<IdFiltre, Filtre>;

type Predicats = { actifs: IdFiltre[]; filtres: FiltresPredicats };
export const predicats = derived<
  [
    typeof rechercheTextuelle,
    typeof rechercheParCategorie,
    typeof rechercheParReferentiel,
  ],
  Predicats
>(
  [rechercheTextuelle, rechercheParCategorie, rechercheParReferentiel],
  ([$rechercheTextuelle, $rechercheParCategorie, $rechercheParReferentiel]) => {
    const actifs = [];

    if ($rechercheTextuelle) actifs.push(IdFiltre.rechercheTextuelle);
    if ($rechercheParCategorie.length > 0)
      actifs.push(IdFiltre.rechercheParCategorie);
    if ($rechercheParReferentiel.length > 0)
      actifs.push(IdFiltre.rechercheParReferentiel);

    return {
      actifs,
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

export const mesuresFiltrees = derived<
  [typeof mesures, typeof predicats],
  Mesures
>([mesures, predicats], ([$mesures, $predicats]) => ({
  mesuresGenerales: Object.entries($mesures.mesuresGenerales)
    .filter(([_, m]) =>
      $predicats.actifs
        .map((idPredicat: IdFiltre) => $predicats.filtres[idPredicat])
        .every((p: Filtre) => p(m))
    )
    .reduce((record, [cle, valeur]) => ({ ...record, [cle]: valeur }), {}),
  mesuresSpecifiques: $mesures.mesuresSpecifiques.filter((m) =>
    $predicats.actifs
      .map((idPredicat: IdFiltre) => $predicats.filtres[idPredicat])
      .every((p: Filtre) => p(m))
  ),
}));

type NombreResultats = {
  total: number;
  filtrees: number;
  aucunResultat: boolean;
  aDesFiltresAppliques: boolean;
};
export const nombreResultats = derived<
  [
    typeof mesures,
    typeof mesuresFiltrees,
    typeof rechercheParReferentiel,
    typeof rechercheParCategorie,
  ],
  NombreResultats
>(
  [mesures, mesuresFiltrees, rechercheParReferentiel, rechercheParCategorie],
  ([
    $mesures,
    $mesuresFiltrees,
    $rechercheReferentiel,
    $rechercheCategorie,
  ]) => {
    const nbMesuresGenerales = Object.keys($mesures.mesuresGenerales).length;
    const nbMesuresSpecifiques = $mesures.mesuresSpecifiques.length;
    const nbMesuresTotal = nbMesuresGenerales + nbMesuresSpecifiques;
    const nbMesuresGeneralesFiltrees = Object.keys(
      $mesuresFiltrees.mesuresGenerales
    ).length;
    const nbMesuresSpecifiquesFiltrees =
      $mesuresFiltrees.mesuresSpecifiques.length;
    const nbMesuresFiltreesTotal =
      nbMesuresGeneralesFiltrees + nbMesuresSpecifiquesFiltrees;
    return {
      total: nbMesuresTotal,
      filtrees: nbMesuresFiltreesTotal,
      aucunResultat: nbMesuresFiltreesTotal === 0,
      aDesFiltresAppliques:
        $rechercheReferentiel.length > 0 || $rechercheCategorie.length > 0,
    };
  }
);
