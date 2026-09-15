import { writable } from 'svelte/store';

export const creeFileMisesAJour = (callbackErreur: () => void = () => {}) => {
  const enCours = writable(false);
  let derniereTache: Promise<void> = Promise.resolve();

  const ajoute = <T>(tache: () => Promise<T>): Promise<T> => {
    const resultat = derniereTache.then(tache);
    const finDeLaTache = resultat.then(() => {}, callbackErreur);

    derniereTache = finDeLaTache;
    enCours.set(true);

    finDeLaTache.then(() => {
      const fileVide = derniereTache === finDeLaTache;
      if (fileVide) enCours.set(false);
    });

    return resultat;
  };

  const attendsLaFin = async () => {
    let tacheAttendue: Promise<void>;
    do {
      tacheAttendue = derniereTache;
      await tacheAttendue;
    } while (tacheAttendue !== derniereTache);
  };

  return { enCours: { subscribe: enCours.subscribe }, ajoute, attendsLaFin };
};
