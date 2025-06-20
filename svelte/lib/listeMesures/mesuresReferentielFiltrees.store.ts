import { mesuresReferentiel } from './mesuresReferentiel.store';
import { derived } from 'svelte/store';
import { filtrageMesures } from './filtrageMesures.store';
import type { ReferentielMesures } from './listeMesures.d';
import { rechercheMesures } from './rechercheMesures.store';

const { subscribe } = derived<
  [typeof mesuresReferentiel, typeof filtrageMesures, typeof rechercheMesures],
  ReferentielMesures
>(
  [mesuresReferentiel, filtrageMesures, rechercheMesures],
  ([$mesuresReferentiel, $filtrageMesures, $rechercheMesures], set) => {
    let mesuresFiltrees = $mesuresReferentiel;
    if (rechercheMesures) {
      mesuresFiltrees = Object.fromEntries(
        Object.entries(mesuresFiltrees).filter(
          ([_, mesure]) =>
            mesure.description
              .toLowerCase()
              .includes($rechercheMesures.toLowerCase()) ||
            mesure.identifiantNumerique.includes($rechercheMesures)
        )
      );
    }
    if ($filtrageMesures.categories?.length > 0) {
      mesuresFiltrees = Object.fromEntries(
        Object.entries(mesuresFiltrees).filter(([_, mesure]) =>
          $filtrageMesures.categories.includes(mesure.categorie)
        )
      );
    }
    if ($filtrageMesures.referentiel?.length > 0) {
      mesuresFiltrees = Object.fromEntries(
        Object.entries(mesuresFiltrees).filter(([_, mesure]) =>
          $filtrageMesures.referentiel.includes(mesure.referentiel)
        )
      );
    }
    set(mesuresFiltrees);
  }
);

export const mesuresReferentielFiltrees = { subscribe };
