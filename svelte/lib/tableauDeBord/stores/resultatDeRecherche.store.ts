import { derived } from 'svelte/store';
import {
  appliqueFiltreTextuel,
  rechercheTextuelle,
} from './rechercheTextuelle.store';
import type { ServiceAvecIndiceCyber } from '../tableauDeBord.d';
import { services } from './services.store';
import {
  appliqueFiltrageParCompletude,
  appliqueFiltrageParIndiceCyber,
  appliqueFiltrageParNiveauDeSecurite,
  appliqueFiltrageParProprietaire,
  filtrageServices,
  type OptionsDeFiltrage,
} from './filtrageServices.store';

type Filtre = (service: ServiceAvecIndiceCyber) => boolean;
type Predicats = {
  filtres: Filtre[];
};

const construisFiltres = (
  rechercheTextuelle: string,
  filtrageServices: OptionsDeFiltrage
) => {
  const filtres: Filtre[] = [];

  if (rechercheTextuelle)
    filtres.push((service: ServiceAvecIndiceCyber) =>
      appliqueFiltreTextuel(service, rechercheTextuelle)
    );

  if (filtrageServices.niveauSecurite.length)
    filtres.push((service: ServiceAvecIndiceCyber) =>
      appliqueFiltrageParNiveauDeSecurite(
        service,
        filtrageServices.niveauSecurite
      )
    );

  if (filtrageServices.indiceCyber.length)
    filtres.push((service: ServiceAvecIndiceCyber) =>
      appliqueFiltrageParIndiceCyber(service, filtrageServices.indiceCyber)
    );

  if (filtrageServices.propriete.length)
    filtres.push((service: ServiceAvecIndiceCyber) =>
      appliqueFiltrageParProprietaire(service, filtrageServices.propriete)
    );

  if (filtrageServices.completude.length)
    filtres.push((service: ServiceAvecIndiceCyber) =>
      appliqueFiltrageParCompletude(service, filtrageServices.completude)
    );

  return filtres;
};

const predicats = derived<
  [typeof rechercheTextuelle, typeof filtrageServices],
  Predicats
>(
  [rechercheTextuelle, filtrageServices],
  ([$rechercheTextuelle, $filtrageServices]) => ({
    filtres: construisFiltres($rechercheTextuelle, $filtrageServices),
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
