import { writable } from 'svelte/store';
import type {
  MesureGenerale,
  MesureSpecifique,
} from '../../tableauDesMesures/tableauDesMesures.d';
import type { StatutMesure } from '../../modeles/modeleMesure';
import { encode } from 'html-entities';

export type NiveauMessage = 'info' | 'succes' | 'erreur';

export type MessageToast = {
  niveau: NiveauMessage;
  titre: string;
  contenu: string;
  timeout: number;
  id?: number;
  avecInterpolationHTMLDangereuse?: boolean;
};

type StoreToasterProps = {
  queue: MessageToast[];
};

const { subscribe, update } = writable<StoreToasterProps>({
  queue: [],
});

export const toasterStore = {
  subscribe,
  info: (
    titre: string,
    contenu: string,
    avecInterpolationHTMLDangereuse: boolean = false
  ) => {
    afficheToast(titre, contenu, 'info', avecInterpolationHTMLDangereuse);
  },
  succes: (
    titre: string,
    contenu: string,
    avecInterpolationHTMLDangereuse: boolean = false
  ) => {
    afficheToast(titre, contenu, 'succes', avecInterpolationHTMLDangereuse);
  },
  erreur: (
    titre: string,
    contenu: string,
    avecInterpolationHTMLDangereuse: boolean = false
  ) => {
    afficheToast(titre, contenu, 'erreur', avecInterpolationHTMLDangereuse);
  },
  afficheToastChangementStatutMesure: (
    mesure: MesureGenerale | MesureSpecifique,
    statuts: Record<StatutMesure, string>
  ) => {
    if (mesure.statut === 'fait') {
      toasterStore.succes(
        'Félicitation !',
        `Le statut de la mesure <b>• ${encode(
          mesure.description
        )}</b> est désormais "<b>faite</b>" !`,
        true
      );
    } else if (mesure.statut) {
      toasterStore.info(
        'Modification du statut',
        `Le statut de la mesure <b>• ${encode(
          mesure.description
        )}</b> est désormais "<b>${statuts[mesure.statut].toLowerCase()}</b>".`,
        true
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
  avecInterpolationHTMLDangereuse: boolean,
  timeout = 5000
): MessageToast => {
  return {
    niveau,
    titre,
    contenu,
    timeout,
    avecInterpolationHTMLDangereuse,
    id: +new Date() + Math.random(),
  };
};

function afficheToast(
  titre: string,
  contenu: string,
  niveau: NiveauMessage,
  avecInterpolationHTMLDangereuse: boolean
) {
  const message = fabriqueToast(
    titre,
    contenu,
    niveau,
    avecInterpolationHTMLDangereuse
  );
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
