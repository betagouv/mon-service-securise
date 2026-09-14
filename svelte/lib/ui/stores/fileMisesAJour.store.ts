import { writable } from 'svelte/store';

export const creeFileMisesAJour = () => {
  const enCours = writable(false);
  let derniereTache: Promise<void> = Promise.resolve();

  const ajoute = <T>(tache: () => Promise<T>): Promise<T> => {
    const resultat = derniereTache.then(tache);
    const finDeLaTache = resultat.then(
      () => {},
      () => {}
    );

    derniereTache = finDeLaTache;
    enCours.set(true);

    finDeLaTache.then(() => {
      const fileVide = derniereTache === finDeLaTache;
      if (fileVide) enCours.set(false);
    });

    return resultat;
  };

  return { enCours: { subscribe: enCours.subscribe }, ajoute };
};
