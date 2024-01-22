import { derived, writable } from 'svelte/store';
import type {
  IdCategorie,
  IdStatut,
  MesureGenerale,
  Mesures,
  MesureSpecifique,
} from './tableauDesMesures.d';
import { Referentiel } from '../ui/types.d';

const mesuresParDefaut = (): Mesures => ({
  mesuresGenerales: {},
  mesuresSpecifiques: [],
});

const { subscribe, set, update } = writable<Mesures>(mesuresParDefaut());

export const mesures = {
  set,
  subscribe,
  reinitialise: (mesures?: Mesures) => set(mesures ?? mesuresParDefaut()),
  metAJourStatutMesureGenerale: (idMesure: string, statut: string) =>
    update((valeur) => {
      valeur.mesuresGenerales[idMesure].statut = statut;
      return valeur;
    }),
  metAJourStatutMesureSpecifique: (idMesure: number, statut: string) =>
    update((valeur) => {
      valeur.mesuresSpecifiques[idMesure].statut = statut;
      return valeur;
    }),
};

export const rechercheTextuelle = writable<string>('');
export const rechercheCategorie = writable<IdCategorie[]>([]);
export const rechercheStatut = writable<IdStatut[]>([]);
export enum IdReferentiel {
  ANSSIRecommandee,
  ANSSIIndispensable,
  CNIL,
  MesureAjoutee,
}
const {
  subscribe: subscribeReferentiel,
  set: setReferentiel,
  update: updateReferentiel,
} = writable<IdReferentiel[]>([]);
export const rechercheReferentiel = {
  subscribe: subscribeReferentiel,
  set: setReferentiel,
  ajouteLesReferentielsANSSI: () =>
    updateReferentiel((etatActuel) => [
      ...new Set([
        ...etatActuel,
        IdReferentiel.ANSSIRecommandee,
        IdReferentiel.ANSSIIndispensable,
      ]),
    ]),
  supprimeLesReferentielsANSSI: () =>
    updateReferentiel((etatActuel) =>
      etatActuel.filter(
        (f) =>
          f !== IdReferentiel.ANSSIIndispensable &&
          f !== IdReferentiel.ANSSIRecommandee
      )
    ),
};

const contientEnMinuscule = (champ: string | undefined, recherche: string) =>
  champ ? champ.toLowerCase().includes(recherche.toLowerCase()) : false;
const estMesureGenerale = (
  mesure: MesureSpecifique | MesureGenerale
): mesure is MesureGenerale =>
  //   On utilise ici un typeguard, et on se base sur une propriété qui est uniquement présente dans les mesures générales
  'descriptionLongue' in mesure && mesure.descriptionLongue !== undefined;

enum IdFiltre {
  rechercheTextuelle,
  rechercheCategorie,
  rechercheStatut,
  rechercheReferentiel,
}
type Filtre = (mesure: MesureSpecifique | MesureGenerale) => boolean;
type FiltresPredicats = Record<IdFiltre, Filtre>;

type Predicats = { actifs: IdFiltre[]; filtres: FiltresPredicats };
export const predicats = derived<
  [
    typeof rechercheTextuelle,
    typeof rechercheCategorie,
    typeof rechercheStatut,
    typeof rechercheReferentiel,
  ],
  Predicats
>(
  [
    rechercheTextuelle,
    rechercheCategorie,
    rechercheStatut,
    rechercheReferentiel,
  ],
  ([
    $rechercheTextuelle,
    $rechercheCategorie,
    $rechercheStatut,
    $rechercheReferentiel,
  ]) => {
    const actifs = [];
    if ($rechercheTextuelle) actifs.push(IdFiltre.rechercheTextuelle);
    if ($rechercheCategorie.length > 0)
      actifs.push(IdFiltre.rechercheCategorie);
    if ($rechercheStatut.length > 0) actifs.push(IdFiltre.rechercheStatut);
    if ($rechercheReferentiel.length > 0)
      actifs.push(IdFiltre.rechercheReferentiel);

    return {
      actifs,
      filtres: {
        [IdFiltre.rechercheTextuelle]: (
          mesure: MesureSpecifique | MesureGenerale
        ) =>
          contientEnMinuscule(mesure.description, $rechercheTextuelle) ||
          contientEnMinuscule(
            (mesure as MesureGenerale).descriptionLongue,
            $rechercheTextuelle
          ),
        [IdFiltre.rechercheCategorie]: (
          mesure: MesureSpecifique | MesureGenerale
        ) => $rechercheCategorie.includes(mesure.categorie),
        [IdFiltre.rechercheStatut]: (
          mesure: MesureSpecifique | MesureGenerale
        ) =>
          $rechercheStatut.includes(mesure.statut ?? '') ||
          ($rechercheStatut.includes('nonRenseignee') && !mesure.statut),
        [IdFiltre.rechercheReferentiel]: (
          mesure: MesureSpecifique | MesureGenerale
        ) =>
          ($rechercheReferentiel.includes(IdReferentiel.MesureAjoutee) &&
            !estMesureGenerale(mesure)) ||
          ($rechercheReferentiel.includes(IdReferentiel.ANSSIIndispensable) &&
            estMesureGenerale(mesure) &&
            mesure.indispensable &&
            mesure.referentiel === Referentiel.ANSSI) ||
          ($rechercheReferentiel.includes(IdReferentiel.CNIL) &&
            estMesureGenerale(mesure) &&
            mesure.referentiel === Referentiel.CNIL) ||
          ($rechercheReferentiel.includes(IdReferentiel.ANSSIRecommandee) &&
            estMesureGenerale(mesure) &&
            !mesure.indispensable &&
            mesure.referentiel === Referentiel.ANSSI),
      },
    };
  }
);

export const mesuresFiltrees = derived<
  [typeof mesures, typeof predicats],
  Mesures
>([mesures, predicats], ([$mesures, $predicats]) => ({
  mesuresGenerales: Object.entries($mesures.mesuresGenerales)
    .filter(([_, m]) =>
      $predicats.actifs
        .map((idPredicat: IdFiltre) => $predicats.filtres[idPredicat])
        .every((p: Filtre) => p(m))
    )
    .reduce((record, [cle, valeur]) => ({ ...record, [cle]: valeur }), {}),
  mesuresSpecifiques: $mesures.mesuresSpecifiques.filter((m) =>
    $predicats.actifs
      .map((idPredicat: IdFiltre) => $predicats.filtres[idPredicat])
      .every((p: Filtre) => p(m))
  ),
}));

type NombreResultats = {
  total: number;
  filtrees: number;
  aucunResultat: boolean;
  aDesFiltresAppliques: boolean;
};
export const nombreResultats = derived<
  [typeof mesures, typeof mesuresFiltrees],
  NombreResultats
>([mesures, mesuresFiltrees], ([$mesures, $mesuresFiltrees]) => {
  const nbMesuresGenerales = Object.keys($mesures.mesuresGenerales).length;
  const nbMesuresSpecifiques = $mesures.mesuresSpecifiques.length;
  const nbMesuresTotal = nbMesuresGenerales + nbMesuresSpecifiques;
  const nbMesuresGeneralesFiltrees = Object.keys(
    $mesuresFiltrees.mesuresGenerales
  ).length;
  const nbMesuresSpecifiquesFiltrees =
    $mesuresFiltrees.mesuresSpecifiques.length;
  const nbMesuresFiltreesTotal =
    nbMesuresGeneralesFiltrees + nbMesuresSpecifiquesFiltrees;
  return {
    total: nbMesuresGenerales + nbMesuresSpecifiques,
    filtrees: nbMesuresFiltreesTotal,
    aucunResultat: nbMesuresFiltreesTotal === 0,
    aDesFiltresAppliques: nbMesuresTotal !== nbMesuresFiltreesTotal,
  };
});
