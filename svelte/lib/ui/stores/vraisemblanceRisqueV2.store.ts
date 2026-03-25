import { get, writable } from 'svelte/store';
import { toasterStore } from './toaster.store';

type IdRisqueV2 = string;

type VraisemblancesRisques = Record<IdRisqueV2, number>;

type RisquesV2API = {
  risques: Array<{
    id: IdRisqueV2;
    vraisemblance: number;
  }>;
};

const { subscribe, set } = writable<VraisemblancesRisques>({});

export const storeVraisemblanceRisqueV2 = {
  subscribe,
  async rafraichis(idService: string) {
    const avant = get(storeVraisemblanceRisqueV2);

    const reponse = await axios.get<RisquesV2API>(
      `/api/service/${idService}/risques/v2`
    );
    const apres = reponse.data.risques.reduce(
      (acc, risque) => ({ ...acc, [risque.id]: risque.vraisemblance }),
      {} as VraisemblancesRisques
    );

    set(apres);
    if (avant) {
      const changements: Array<{
        idRisque: IdRisqueV2;
        vraisemblanceAvant: number;
        vraisemblanceApres: number;
      }> = [];
      Object.entries(avant).forEach(([idRisque, vraisemblanceAvant]) => {
        if (apres[idRisque] !== vraisemblanceAvant) {
          changements.push({
            idRisque,
            vraisemblanceAvant,
            vraisemblanceApres: apres[idRisque],
          });
        }
      });
      if (changements.length) {
        const contenu = changements
          .map(
            ({ idRisque, vraisemblanceAvant, vraisemblanceApres }) =>
              `Le risque ${idRisque} est passé d'une vraisemblance ${vraisemblanceAvant} à ${vraisemblanceApres}.`
          )
          .join('<br/>');
        toasterStore.info(
          'Cartographie de risques de sécurité mise à jour',
          contenu,
          true
        );
      }
    }
  },
};
