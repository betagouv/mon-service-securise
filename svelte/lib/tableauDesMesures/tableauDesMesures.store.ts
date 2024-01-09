import { writable, derived } from 'svelte/store';
import type {
  MesureGenerale,
  Mesures,
  MesureSpecifique,
} from './tableauDesMesures.d';

const mesuresParDefaut = (): Mesures => ({
  mesuresGenerales: {},
  mesuresSpecifiques: [],
});

const { subscribe, set } = writable<Mesures>(mesuresParDefaut());

export const mesures = {
  set,
  subscribe,
  reinitialise: (mesures?: Mesures) => set(mesures ?? mesuresParDefaut()),
};

export const rechercheTextuelle = writable<string>('');

const contientEnMinuscule = (champ: string | undefined, recherche: string) =>
  champ ? champ.toLowerCase().includes(recherche.toLowerCase()) : false;

enum IdFiltre {
  rechercheTextuelle,
}
type Filtre = (mesure: MesureSpecifique | MesureGenerale) => boolean;
type FiltresPredicats = Record<IdFiltre, Filtre>;

type Predicats = { actifs: IdFiltre[]; filtres: FiltresPredicats };
export const predicats = derived<[typeof rechercheTextuelle], Predicats>(
  [rechercheTextuelle],
  ([$rechercheTextuelle]) => {
    const actifs = [];
    if ($rechercheTextuelle) actifs.push(IdFiltre.rechercheTextuelle);

    return {
      actifs,
      filtres: {
        [IdFiltre.rechercheTextuelle]: (
          mesure: MesureSpecifique | MesureGenerale
        ) => contientEnMinuscule(mesure.description, $rechercheTextuelle),
      },
    };
  }
);

export const mesuresFiltrees = derived<
  [typeof mesures, typeof predicats],
  Mesures
>([mesures, predicats], ([$mesures, $predicats]) => ({
  mesuresGenerales: Object.entries($mesures.mesuresGenerales)
    .filter(([cle, m]) =>
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
};
export const nombreResultats = derived<
  [typeof mesures, typeof mesuresFiltrees],
  NombreResultats
>([mesures, mesuresFiltrees], ([$mesures, $mesuresFiltrees]) => ({
  total:
    Object.keys($mesures.mesuresGenerales).length +
    $mesures.mesuresSpecifiques.length,
  filtrees:
    Object.keys($mesuresFiltrees.mesuresGenerales).length +
    $mesuresFiltrees.mesuresSpecifiques.length,
  aucunResultat:
    Object.keys($mesuresFiltrees.mesuresGenerales).length +
      $mesuresFiltrees.mesuresSpecifiques.length ===
    0,
}));
