import { derived, writable } from 'svelte/store';
import type {
  MesureEditee,
  MesureGeneraleEnrichie,
  MesureSpecifique,
} from './mesure.d';
import { CategorieMesure, Referentiel } from '../ui/types.d';

type Etape =
  | 'Creation'
  | 'EditionGenerale'
  | 'EditionSpecifique'
  | 'SuppressionSpecifique';

type AvecModalites<T> = T & {
  modalites: string;
};

type MesureEditeeAvecModalites = Omit<MesureEditee, 'mesure'> & {
  mesure: AvecModalites<MesureSpecifique | MesureGeneraleEnrichie>;
};

export type MesureStore = {
  etape: Etape;
  mesureEditee: MesureEditeeAvecModalites;
};

const mesureEditeeParDefaut = (): MesureEditee => ({
  mesure: {
    categorie: '',
    description: '',
    statut: undefined,
    modalites: '',
    identifiantNumerique: '',
    id: '',
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
    const mesureEditeeAvecModalites = mesureEditee ?? mesureEditeeParDefaut();
    if (!mesureEditeeAvecModalites.mesure.modalites)
      mesureEditeeAvecModalites.mesure.modalites = '';
    set({
      etape,
      mesureEditee: mesureEditeeAvecModalites as MesureEditeeAvecModalites,
    });
  },
  afficheEtapeSuppression: () =>
    update((etat) => ({ ...etat, etape: 'SuppressionSpecifique' })),
  afficheEtapeEditionSpecifique: () =>
    update((etat) => ({ ...etat, etape: 'EditionSpecifique' })),
};

export const configurationAffichage = derived(store, ($store) => {
  const referentiel: Referentiel =
    $store.etape === 'EditionGenerale'
      ? ($store.mesureEditee.mesure as MesureGeneraleEnrichie).referentiel
      : Referentiel.SPECIFIQUE;

  const categorie: CategorieMesure | '' =
    $store.etape === 'EditionGenerale' || $store.etape === 'EditionSpecifique'
      ? ($store.mesureEditee.mesure.categorie as CategorieMesure)
      : '';

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
    categorie,
    thematique:
      $store.etape === 'EditionGenerale'
        ? $store.mesureEditee.mesure.thematique
        : undefined,
    doitAfficherIntitule:
      $store.etape === 'Creation' || $store.etape === 'EditionSpecifique',
    doitAfficherChoixCategorie:
      $store.etape === 'Creation' || $store.etape === 'EditionSpecifique',
    doitAfficherDescriptionLongue: $store.etape === 'EditionGenerale',
    doitAfficherDescriptionLongueEditable:
      $store.etape === 'Creation' || $store.etape === 'EditionSpecifique',
    doitAfficherSuppression: $store.etape === 'EditionSpecifique',
    doitAfficherRetourUtilisateur: $store.etape === 'EditionGenerale',
    doitAfficherPorteursSinguliers: $store.etape === 'EditionGenerale',
  };
});
