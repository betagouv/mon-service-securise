import type { TypeNotification } from './centreNotifications.d';

export const recupereNotifications = async () => {
  const reponse = await axios.get('/api/notifications');
  return reponse.data.notifications;
};

export const marqueNotificationCommeLue = async (
  type: TypeNotification,
  id: string
) => {
  const routes: Record<TypeNotification, string> = {
    nouveaute: 'nouveautes',
    tache: 'taches',
  };
  await axios.put(`/api/notifications/${routes[type]}/${id}`);
};
