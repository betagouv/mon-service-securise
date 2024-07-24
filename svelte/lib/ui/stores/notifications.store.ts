import { writable } from 'svelte/store';
import type { Notification } from '../../centreNotifications/centreNotifications.d';
import axios from 'axios';

const { subscribe, set } = writable<Notification[]>([]);

export const storeNotifications = {
  subscribe,
  rafraichis: async () => {
    const reponse = await axios.get('/api/notifications');
    set(reponse.data.notifications);
  },
};
