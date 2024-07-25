import { writable } from 'svelte/store';
import type { Notification, TypeNotification } from '../types.d';

type Notifications = {
  pourCentreNotifications: Notification[];
  pourPage: Notification[];
};
const { subscribe, set } = writable<Notifications>({
  pourCentreNotifications: [],
  pourPage: [],
});

const routes: Record<TypeNotification, string> = {
  nouveaute: 'nouveautes',
  tache: 'taches',
};

export const storeNotifications = {
  subscribe,
  rafraichis: async () => {
    const reponse = await axios.get('/api/notifications');
    const toutesNotifications = reponse.data.notifications;
    set({
      pourCentreNotifications: toutesNotifications.filter(
        (n: Notification) => n.canalDiffusion === 'centreNotifications'
      ),
      pourPage: toutesNotifications.filter(
        (n: Notification) => n.canalDiffusion === 'page'
      ),
    });
  },
  marqueLue: async (type: TypeNotification, id: string) => {
    await axios.put(`/api/notifications/${routes[type]}/${id}`);
    await storeNotifications.rafraichis();
  },
};
