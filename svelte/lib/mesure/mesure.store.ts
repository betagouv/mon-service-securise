import { derived, writable } from 'svelte/store';
import type { MesureEditee, MesureGeneraleEnrichie } from './mesure.d';
import { Referentiel } from '../ui/types.d';

type Etape =
  | 'Creation'
  | 'EditionGenerale'
  | 'EditionSpecifique'
  | 'SuppressionSpecifique';
export type MesureStore = {
  etape: Etape;
  mesureEditee: MesureEditee;
};

const mesureEditeeParDefaut = (): MesureEditee => ({
  mesure: {
    categorie: '',
    description: '',
    statut: undefined,
    modalites: '',
  },
  metadonnees: {
    typeMesure: 'SPECIFIQUE',
    idMesure: 0,
  },
});
const { subscribe, set, update } = writable<MesureStore>();

export const store = {
  set,
  subscribe,
  reinitialise: (mesureEditee?: MesureEditee) => {
    const etape: Etape = !mesureEditee
      ? 'Creation'
      : mesureEditee.metadonnees.typeMesure === 'GENERALE'
      ? 'EditionGenerale'
      : 'EditionSpecifique';
    set({
      etape,
      mesureEditee: mesureEditee ?? mesureEditeeParDefaut(),
    });
  },
  afficheEtapeSuppression: () =>
    update((etat) => ({
      ...etat,
      etape: 'SuppressionSpecifique',
    })),
  afficheEtapeEditionSpecifique: () =>
    update((etat) => ({
      ...etat,
      etape: 'EditionSpecifique',
    })),
};

export const configurationAffichage = derived(store, ($store) => {
  const referentiel: Referentiel =
    $store.etape === 'EditionGenerale'
      ? ($store.mesureEditee.mesure as MesureGeneraleEnrichie).referentiel
      : Referentiel.SPECIFIQUE;
  return {
    referentiel,
    indispensable:
      referentiel === Referentiel.SPECIFIQUE
        ? false
        : ($store.mesureEditee.mesure as MesureGeneraleEnrichie).indispensable,
    identifiantNumerique:
      $store.etape === 'EditionGenerale'
        ? $store.mesureEditee.mesure.identifiantNumerique
        : '',
    doitAfficherIntitule:
      $store.etape === 'Creation' || $store.etape === 'EditionSpecifique',
    doitAfficherChoixCategorie:
      $store.etape === 'Creation' || $store.etape === 'EditionSpecifique',
    doitAfficherDescriptionLongue: $store.etape === 'EditionGenerale',
    doitAfficherSuppression: $store.etape === 'EditionSpecifique',
    doitAfficherRetourUtilisateur: $store.etape === 'EditionGenerale',
  };
});
