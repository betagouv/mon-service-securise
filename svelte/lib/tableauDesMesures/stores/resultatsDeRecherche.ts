import { derived, get } from 'svelte/store';
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
import {
  appliqueFiltreAvancement,
  type Avancement,
  rechercheParAvancement,
} from './rechercheParAvancement.store';

enum IdFiltre {
  rechercheTextuelle,
  rechercheParCategorie,
  rechercheParReferentiel,
  rechercheParAvancement,
}

type Filtre = (mesure: MesureSpecifique | MesureGenerale) => boolean;
type FiltresPredicats = Record<IdFiltre, Filtre>;
type Predicats = {
  actifs: IdFiltre[];
  filtres: FiltresPredicats;
  substitueAvancement: (simulation: Avancement) => {
    actifs: IdFiltre[];
    filtres: FiltresPredicats;
  };
};

const predicats = derived<
  [
    typeof rechercheTextuelle,
    typeof rechercheParCategorie,
    typeof rechercheParReferentiel,
    typeof rechercheParAvancement,
  ],
  Predicats
>(
  [
    rechercheTextuelle,
    rechercheParCategorie,
    rechercheParReferentiel,
    rechercheParAvancement,
  ],
  ([
    $rechercheTextuelle,
    $rechercheParCategorie,
    $rechercheParReferentiel,
    $rechercheParAvancement,
  ]) => {
    const filtresActifs: IdFiltre[] = [];

    if ($rechercheTextuelle) filtresActifs.push(IdFiltre.rechercheTextuelle);
    if ($rechercheParCategorie.length > 0)
      filtresActifs.push(IdFiltre.rechercheParCategorie);
    if ($rechercheParReferentiel.length > 0)
      filtresActifs.push(IdFiltre.rechercheParReferentiel);
    if ($rechercheParAvancement)
      filtresActifs.push(IdFiltre.rechercheParAvancement);

    const implementations = {
      [IdFiltre.rechercheTextuelle]: (
        mesure: MesureSpecifique | MesureGenerale
      ) => appliqueFiltreTextuel(mesure, $rechercheTextuelle),

      [IdFiltre.rechercheParCategorie]: (
        mesure: MesureSpecifique | MesureGenerale
      ) => appliqueFiltreParCategorie(mesure, $rechercheParCategorie),

      [IdFiltre.rechercheParReferentiel]: (
        mesure: MesureSpecifique | MesureGenerale
      ) => appliqueRechercheParReferentiel(mesure, $rechercheParReferentiel),

      [IdFiltre.rechercheParAvancement]: (
        mesure: MesureSpecifique | MesureGenerale
      ) => appliqueFiltreAvancement(mesure, $rechercheParAvancement),
    };

    return {
      actifs: filtresActifs,
      filtres: implementations,
      substitueAvancement: (simulation: Avancement) => ({
        actifs: [...filtresActifs, IdFiltre.rechercheParAvancement],
        filtres: {
          ...implementations,
          [IdFiltre.rechercheParAvancement]: (
            mesure: MesureSpecifique | MesureGenerale
          ) => appliqueFiltreAvancement(mesure, simulation),
        },
      }),
    };
  }
);

type ResultatsRecherche = Mesures & {
  parAvancement: Record<Avancement, (MesureSpecifique | MesureGenerale)[]>;
};

export const resultatsDeRecherche = derived<
  [typeof mesures, typeof predicats],
  ResultatsRecherche
>([mesures, predicats], ([$mesures, $predicats]) => {
  const mesuresGenerales = Object.entries($mesures.mesuresGenerales)
    .filter(([_, mesure]) =>
      $predicats.actifs
        .map((idPredicat: IdFiltre) => $predicats.filtres[idPredicat])
        .every((predicat: Filtre) => predicat(mesure))
    )
    .reduce(
      (record, [idMesure, mesure]) => ({ ...record, [idMesure]: mesure }),
      {}
    );

  const mesuresSpecifiques = $mesures.mesuresSpecifiques.filter((mesure) =>
    $predicats.actifs
      .map((idPredicat: IdFiltre) => $predicats.filtres[idPredicat])
      .every((predicat: Filtre) => predicat(mesure))
  );

  const mesuresParAvancement = (avancementASimuler: Avancement) => {
    const avecAvancementSubstitue =
      $predicats.substitueAvancement(avancementASimuler);
    const toutesLesMesures = [
      ...Object.values($mesures.mesuresGenerales),
      ...$mesures.mesuresSpecifiques,
    ];
    return toutesLesMesures.filter((m) =>
      avecAvancementSubstitue.actifs
        .map((id) => avecAvancementSubstitue.filtres[id])
        .every((p: Filtre) => p(m))
    );
  };

  return {
    mesuresGenerales,
    mesuresSpecifiques,
    parAvancement: {
      statutADefinir: mesuresParAvancement('statutADefinir'),
      enAction: mesuresParAvancement('enAction'),
      toutes: mesuresParAvancement('toutes'),
      traite: mesuresParAvancement('traite'),
    },
  };
});
