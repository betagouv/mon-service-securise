import { writable } from 'svelte/store';
import type { AxiosError } from 'axios';
import type { Notification, TypeNotification } from '../types.d';

type Notifications = {
  pourCentreNotifications: Notification[];
  pourPage: Notification[];
};
const { subscribe, set, update } = writable<Notifications>({
  pourCentreNotifications: [],
  pourPage: [],
});

const routes: Record<TypeNotification, string> = {
  nouveaute: 'nouveautes',
  tache: 'taches',
  mention: 'transactionnelles',
  assignation: 'transactionnelles',
  echeanceProche: 'transactionnelles',
  echeanceAtteinte: 'transactionnelles',
  invitation: 'transactionnelles',
};

export const storeNotifications = {
  subscribe,
  rafraichis: async () => {
    const reponse = await axios.get('/api/notifications');
    const toutesNotifications = reponse.data.notifications ?? [];
    set({
      pourCentreNotifications: toutesNotifications.filter(
        (n: Notification) => n.canalDiffusion === 'centreNotifications'
      ),
      pourPage: toutesNotifications.filter(
        (n: Notification) => n.canalDiffusion === 'page'
      ),
    });
  },
  marqueToutesLues: async () => {
    await axios.put(`/api/notifications/toutes-lues`);
    await storeNotifications.rafraichis();
  },
  marqueLue: async (type: TypeNotification, id: string) => {
    await axios.put(`/api/notifications/${routes[type]}/${id}`);
    await storeNotifications.rafraichis();
  },
  supprime: async (type: TypeNotification, id: string) => {
    update((notifications) => ({
      ...notifications,
      pourCentreNotifications: notifications.pourCentreNotifications.filter(
        (n) => n.id !== id
      ),
    }));
    try {
      await axios.delete(`/api/notifications/${routes[type]}/${id}`);
    } catch (e) {
      const dejaSupprimee = (e as AxiosError).response?.status === 404;
      if (dejaSupprimee) return;

      await storeNotifications.rafraichis();
    }
  },
};
