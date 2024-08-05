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

export const afficheTiroirDeMesure = (mesureAEditer?: MesureAEditer) => {
  document.body.dispatchEvent(
    new CustomEvent('svelte-affiche-tiroir-ajout-mesure-specifique', {
      detail: {
        mesuresExistantes: metEnFormeMesures(get(mesures)),
        titreTiroir:
          mesureAEditer && mesureAEditer.metadonnees.typeMesure === 'GENERALE'
            ? mesureAEditer.mesure.description
            : 'Ajouter une mesure',
        ...(mesureAEditer && { mesureAEditer }),
      },
    })
  );
};

export const afficheTiroirExportDesMesures = () => {
  document.body.dispatchEvent(
    new CustomEvent('svelte-affiche-tiroir-export-mesures')
  );
};
