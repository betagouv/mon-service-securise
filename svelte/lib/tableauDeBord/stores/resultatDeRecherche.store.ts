import { derived } from 'svelte/store';
import {
  appliqueFiltreTextuel,
  rechercheTextuelle,
} from './rechercheTextuelle.store';
import type { Service } from '../tableauDeBord.d';
import { services } from './services.store';

type Filtre = (service: Service) => boolean;
type Predicats = {
  filtres: Filtre[];
};

const construisFiltres = (rechercheTextuelle: string) => {
  const filtres: Filtre[] = [];

  if (rechercheTextuelle)
    filtres.push((service: Service) =>
      appliqueFiltreTextuel(service, rechercheTextuelle)
    );

  return filtres;
};

const predicats = derived<[typeof rechercheTextuelle], Predicats>(
  [rechercheTextuelle],
  ([$rechercheTextuelle]) => ({
    filtres: construisFiltres($rechercheTextuelle),
  })
);

type ResultatsRecherche = Service[];

export const resultatsDeRecherche = derived<
  [typeof services, typeof predicats],
  ResultatsRecherche
>([services, predicats], ([$services, $predicats]) => {
  return $services.filter((service) =>
    $predicats.filtres.every((predicat: Filtre) => predicat(service))
  );
});
