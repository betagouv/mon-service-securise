import { derived } from 'svelte/store';
import {
  appliqueFiltreTextuel,
  rechercheTextuelle,
} from './rechercheTextuelle.store';
import type { ServiceAvecIndiceCyber } from '../tableauDeBord.d';
import { services } from './services.store';

type Filtre = (service: ServiceAvecIndiceCyber) => boolean;
type Predicats = {
  filtres: Filtre[];
};

const construisFiltres = (rechercheTextuelle: string) => {
  const filtres: Filtre[] = [];

  if (rechercheTextuelle)
    filtres.push((service: ServiceAvecIndiceCyber) =>
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

type ResultatsRecherche = ServiceAvecIndiceCyber[];

export const resultatsDeRecherche = derived<
  [typeof services, typeof predicats],
  ResultatsRecherche
>([services, predicats], ([$services, $predicats]) => {
  return $services.filter((service) =>
    $predicats.filtres.every((predicat: Filtre) => predicat(service))
  );
});
