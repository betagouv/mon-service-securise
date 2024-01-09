import { writable, derived } from 'svelte/store';
import type {
  IdCategorie,
  IdStatut,
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
export const rechercheCategorie = writable<IdCategorie[]>([]);
export const rechercheStatut = writable<IdStatut[]>([]);

const contientEnMinuscule = (champ: string | undefined, recherche: string) =>
  champ ? champ.toLowerCase().includes(recherche.toLowerCase()) : false;

enum IdFiltre {
  rechercheTextuelle,
  rechercheCategorie,
  rechercheStatut,
}
type Filtre = (mesure: MesureSpecifique | MesureGenerale) => boolean;
type FiltresPredicats = Record<IdFiltre, Filtre>;

type Predicats = { actifs: IdFiltre[]; filtres: FiltresPredicats };
export const predicats = derived<
  [
    typeof rechercheTextuelle,
    typeof rechercheCategorie,
    typeof rechercheStatut,
  ],
  Predicats
>(
  [rechercheTextuelle, rechercheCategorie, rechercheStatut],
  ([$rechercheTextuelle, $rechercheCategorie, $rechercheStatut]) => {
    const actifs = [];
    if ($rechercheTextuelle) actifs.push(IdFiltre.rechercheTextuelle);
    if ($rechercheCategorie.length > 0)
      actifs.push(IdFiltre.rechercheCategorie);
    if ($rechercheStatut.length > 0) actifs.push(IdFiltre.rechercheStatut);

    return {
      actifs,
      filtres: {
        [IdFiltre.rechercheTextuelle]: (
          mesure: MesureSpecifique | MesureGenerale
        ) =>
          contientEnMinuscule(mesure.description, $rechercheTextuelle) ,
        [IdFiltre.rechercheCategorie]: (
          mesure: MesureSpecifique | MesureGenerale
        ) => $rechercheCategorie.includes(mesure.categorie),
        [IdFiltre.rechercheStatut]: (
          mesure: MesureSpecifique | MesureGenerale
        ) =>
          $rechercheStatut.includes(mesure.statut ?? '') ||
          ($rechercheStatut.includes('nonRenseignee') && !mesure.statut),
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
