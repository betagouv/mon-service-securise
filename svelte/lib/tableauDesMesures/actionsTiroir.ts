import { get } from 'svelte/store';
import { metEnFormeMesures } from './tableauDesMesures.api';
import type { MesureGenerale, MesureSpecifique } from './tableauDesMesures.d';
import { mesures } from './stores/mesures.store';

type MesureAEditer = {
  mesure: MesureSpecifique | MesureGenerale;
  metadonnees: {
    typeMesure: 'GENERALE' | 'SPECIFIQUE';
    idMesure: string | number;
  };
};

export const afficheTiroirEditeMesure = (mesureAEditer: MesureAEditer) => {
  document.body.dispatchEvent(
    new CustomEvent('svelte-affiche-tiroir-ajout-mesure-specifique', {
      detail: {
        titreTiroir:
          mesureAEditer.metadonnees.typeMesure === 'GENERALE'
            ? mesureAEditer.mesure.description
            : 'Ajouter une mesure',
        mesureAEditer,
      },
    })
  );
};

export const afficheTiroirCreeMesure = () => {
  document.body.dispatchEvent(
    new CustomEvent('svelte-affiche-tiroir-ajout-mesure-specifique', {
      detail: {
        titreTiroir: 'Ajouter une mesure',
      },
    })
  );
};

export const afficheTiroirExportDesMesures = () => {
  document.body.dispatchEvent(
    new CustomEvent('svelte-affiche-tiroir-export-mesures')
  );
};
