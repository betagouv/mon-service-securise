import { writable } from 'svelte/store';

type EtatGestionContributeursStore = {
  idMenuOuvert: string;
};

let { subscribe, update } = writable<EtatGestionContributeursStore>({
  idMenuOuvert: null,
});

export const gestionContributeursStore = {
  subscribe,
  ouvrirMenuPour: (idUtilisateur: string) => {
    update((valeurActuelle) => ({
      ...valeurActuelle,
      idMenuOuvert: idUtilisateur,
    }));
  },
};
