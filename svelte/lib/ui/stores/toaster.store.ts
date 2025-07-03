import { writable } from 'svelte/store';
import type {
  MesureGenerale,
  MesureSpecifique,
} from '../../tableauDesMesures/tableauDesMesures.d';
import type { StatutMesure } from '../../modeles/modeleMesure';

export type NiveauMessage = 'info' | 'succes' | 'erreur';

export type MessageToast = {
  niveau: NiveauMessage;
  titre: string;
  contenu: string;
  timeout: number;
  id?: number;
};

type StoreToasterProps = {
  queue: MessageToast[];
};

const { subscribe, update } = writable<StoreToasterProps>({
  queue: [],
});

export const toasterStore = {
  subscribe,
  info: (titre: string, contenu: string) => {
    afficheToast(titre, contenu, 'info');
  },
  succes: (titre: string, contenu: string) => {
    afficheToast(titre, contenu, 'succes');
  },
  erreur: (titre: string, contenu: string) => {
    afficheToast(titre, contenu, 'erreur');
  },
  afficheToastChangementStatutMesure: (
    mesure: MesureGenerale | MesureSpecifique,
    statuts: Record<StatutMesure, string>
  ) => {
    if (mesure.statut === 'fait') {
      toasterStore.succes(
        'Félicitation !',
        `Le statut de la mesure <b>• ${mesure.description}</b> est désormais "<b>faite</b>" !`
      );
    } else if (mesure.statut) {
      toasterStore.info(
        'Modification du statut',
        `Le statut de la mesure <b>• ${
          mesure.description
        }</b> est désormais "<b>${statuts[mesure.statut].toLowerCase()}</b>".`
      );
    }
  },
  fermeToast: (id?: number) =>
    update((etatActuel) => {
      etatActuel.queue = etatActuel.queue.filter((toast) => toast.id !== id);
      return etatActuel;
    }),
};

const fabriqueToast = (
  titre: string,
  contenu: string,
  niveau: NiveauMessage,
  timeout = 5000
): MessageToast => {
  return {
    niveau,
    titre,
    contenu,
    timeout,
    id: +new Date() + Math.random(),
  };
};

function afficheToast(titre: string, contenu: string, niveau: NiveauMessage) {
  const message = fabriqueToast(titre, contenu, niveau);
  setTimeout(() => {
    update((etatActuel) => {
      etatActuel.queue.shift();
      return etatActuel;
    });
  }, message.timeout);
  update((etatActuel) => {
    etatActuel.queue = [...etatActuel.queue, message];
    return etatActuel;
  });
}
