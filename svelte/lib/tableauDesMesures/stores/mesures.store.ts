import type { Mesures, IdUtilisateur } from '../tableauDesMesures.d';
import { writable } from 'svelte/store';
import type { EcheanceMesure, PrioriteMesure } from '../../ui/types';

export const mesuresParDefaut = (): Mesures => ({
  mesuresGenerales: {},
  mesuresSpecifiques: [],
});

const toutesLesMesures = writable<Mesures>(mesuresParDefaut());

export const mesures = {
  set: toutesLesMesures.set,
  subscribe: toutesLesMesures.subscribe,
  reinitialise: (mesures?: Mesures) =>
    toutesLesMesures.set(mesures ?? mesuresParDefaut()),
  metAJourEcheanceMesureGenerale: (
    idMesure: string,
    echeance: EcheanceMesure
  ) => {
    toutesLesMesures.update((valeur) => {
      valeur.mesuresGenerales[idMesure].echeance = echeance;
      return valeur;
    });
  },
  metAJourEcheanceMesureSpecifique: (
    idMesure: number,
    echeance: EcheanceMesure
  ) => {
    toutesLesMesures.update((valeur) => {
      valeur.mesuresSpecifiques[idMesure].echeance = echeance;
      return valeur;
    });
  },
  metAJourResponsablesMesureGenerale: (
    idMesure: string,
    responsables: IdUtilisateur[]
  ) =>
    toutesLesMesures.update((valeur) => {
      valeur.mesuresGenerales[idMesure].responsables = responsables;
      return valeur;
    }),
  metAJourResponsablesMesureSpecifique: (
    idMesure: number,
    responsables: IdUtilisateur[]
  ) =>
    toutesLesMesures.update((valeur) => {
      valeur.mesuresSpecifiques[idMesure].responsables = responsables;
      return valeur;
    }),
  metAJourStatutMesureGenerale: (idMesure: string, statut: string) =>
    toutesLesMesures.update((valeur) => {
      valeur.mesuresGenerales[idMesure].statut = statut;
      return valeur;
    }),
  metAJourStatutMesureSpecifique: (idMesure: number, statut: string) =>
    toutesLesMesures.update((valeur) => {
      valeur.mesuresSpecifiques[idMesure].statut = statut;
      return valeur;
    }),
  metAJourPrioriteMesureGenerale: (
    idMesure: string,
    priorite: PrioriteMesure | undefined
  ) => {
    toutesLesMesures.update((valeur) => {
      valeur.mesuresGenerales[idMesure].priorite = priorite;
      return valeur;
    });
  },
  metAJourPrioriteMesureSpecifique: (
    idMesure: number,
    priorite: PrioriteMesure | undefined
  ) => {
    toutesLesMesures.update((valeur) => {
      valeur.mesuresSpecifiques[idMesure].priorite = priorite;
      return valeur;
    });
  },
};
