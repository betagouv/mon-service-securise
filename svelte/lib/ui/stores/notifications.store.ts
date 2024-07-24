import { writable } from 'svelte/store';
import type {
  Notification,
  TypeNotification,
} from '../../centreNotifications/centreNotifications.d';
import axios from 'axios';

const { subscribe, set } = writable<Notification[]>([]);

const routes: Record<TypeNotification, string> = {
  nouveaute: 'nouveautes',
  tache: 'taches',
};

export const storeNotifications = {
  subscribe,
  rafraichis: async () => {
    const reponse = await axios.get('/api/notifications');
    set(reponse.data.notifications);
  },
  marqueLue: async (type: TypeNotification, id: string) => {
    await axios.put(`/api/notifications/${routes[type]}/${id}`);
  },
};
