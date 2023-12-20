import { derived, writable } from 'svelte/store';
import type { MesureEditee, MesureGeneraleEnrichie } from './mesure.d';

type Etape =
  | 'Creation'
  | 'EditionGenerale'
  | 'EditionSpecifique'
  | 'SuppressionSpecifique';
export type MesureStore = {
  etape: Etape;
  mesureEditee: MesureEditee;
};

const { subscribe, set, update } = writable<MesureStore>();

const mesureEditeeParDefaut: MesureEditee = {
  mesure: {
    categorie: '',
    description: '',
    statut: '',
    modalites: '',
  },
  metadonnees: {
    typeMesure: 'SPECIFIQUE',
    idMesure: 0,
  },
};
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
      mesureEditee: mesureEditee ?? mesureEditeeParDefaut,
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
  const contenuTexteCartoucheDuReferentiel: string =
    $store.etape === 'Creation'
      ? 'Ajoutée'
      : $store.etape === 'EditionSpecifique'
      ? 'Nouvelle'
      : ($store.mesureEditee.mesure as MesureGeneraleEnrichie).indispensable
      ? 'Indispensable'
      : 'Recommandée';
  return {
    contenuTexteCartoucheDuReferentiel,
    doitAfficherIntitule:
      $store.etape === 'Creation' || $store.etape === 'EditionSpecifique',
    doitAfficherChoixCategorie:
      $store.etape === 'Creation' || $store.etape === 'EditionSpecifique',
    doitAfficherDescriptionLongue: $store.etape === 'EditionGenerale',
    doitAfficherSuppression: $store.etape === 'EditionSpecifique',
  };
});
