export const recupereNotifications = async () => {
  const reponse = await axios.get('/api/notifications');
  return reponse.data.notifications;
};

export const marqueNotificationCommeLue = async (id: string) => {
  await axios.post(`/api/notifications/nouveautes/${id}`);
};
