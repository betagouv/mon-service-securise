import { derived } from 'svelte/store';
import type {
  IdCategorie,
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
  IdReferentiel,
  rechercheParReferentiel,
} from './rechercheParReferentiel.store';
import { mesures } from './mesures.store';
import {
  appliqueFiltreAvancement,
  type Avancement,
  rechercheParAvancement,
} from './rechercheParAvancement.store';
import {
  appliqueFiltreParPriorite,
  rechercheParPriorite,
} from './rechercheParPriorite.store';
import type { PrioriteMesure } from '../../ui/types';

type Filtre = (mesure: MesureSpecifique | MesureGenerale) => boolean;
type Predicats = {
  filtres: Filtre[];
  substitueAvancement: (simulation: Avancement) => { filtres: Filtre[] };
};

const construisFiltres = (
  rechercheTextuelle: string,
  categories: IdCategorie[],
  priorites: PrioriteMesure[],
  referentiels: IdReferentiel[],
  avancement: 'statutADefinir' | 'enAction' | 'traite' | 'toutes'
) => {
  const filtres: Filtre[] = [];

  if (rechercheTextuelle)
    filtres.push((mesure: MesureSpecifique | MesureGenerale) =>
      appliqueFiltreTextuel(mesure, rechercheTextuelle)
    );

  if (categories.length > 0)
    filtres.push((mesure: MesureSpecifique | MesureGenerale) =>
      appliqueFiltreParCategorie(mesure, categories)
    );

  if (priorites.length > 0)
    filtres.push((mesure: MesureSpecifique | MesureGenerale) =>
      appliqueFiltreParPriorite(mesure, priorites)
    );

  if (referentiels.length > 0)
    filtres.push((mesure: MesureSpecifique | MesureGenerale) =>
      appliqueRechercheParReferentiel(mesure, referentiels)
    );

  if (avancement)
    filtres.push((mesure: MesureSpecifique | MesureGenerale) =>
      appliqueFiltreAvancement(mesure, avancement)
    );

  return filtres;
};

const predicats = derived<
  [
    typeof rechercheTextuelle,
    typeof rechercheParCategorie,
    typeof rechercheParPriorite,
    typeof rechercheParReferentiel,
    typeof rechercheParAvancement,
  ],
  Predicats
>(
  [
    rechercheTextuelle,
    rechercheParCategorie,
    rechercheParPriorite,
    rechercheParReferentiel,
    rechercheParAvancement,
  ],
  ([
    $rechercheTextuelle,
    $rechercheParCategorie,
    $rechercheParPriorite,
    $rechercheParReferentiel,
    $rechercheParAvancement,
  ]) => ({
    filtres: construisFiltres(
      $rechercheTextuelle,
      $rechercheParCategorie,
      $rechercheParPriorite,
      $rechercheParReferentiel,
      $rechercheParAvancement
    ),
    substitueAvancement: (avancementDeSimulation: Avancement) => ({
      filtres: construisFiltres(
        $rechercheTextuelle,
        $rechercheParCategorie,
        $rechercheParPriorite,
        $rechercheParReferentiel,
        avancementDeSimulation
      ),
    }),
  })
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
      $predicats.filtres.every((predicat: Filtre) => predicat(mesure))
    )
    .reduce(
      (record, [idMesure, mesure]) => ({ ...record, [idMesure]: mesure }),
      {}
    );

  const mesuresSpecifiques = $mesures.mesuresSpecifiques.filter((mesure) =>
    $predicats.filtres.every((predicat: Filtre) => predicat(mesure))
  );

  const mesuresParAvancement = (avancementASimuler: Avancement) => {
    const avecAvancementSubstitue =
      $predicats.substitueAvancement(avancementASimuler);

    const toutesLesMesures = [
      ...Object.values($mesures.mesuresGenerales),
      ...$mesures.mesuresSpecifiques,
    ];

    return toutesLesMesures.filter((m) =>
      avecAvancementSubstitue.filtres.every((p: Filtre) => p(m))
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
