export const recupereNotifications = async () => {
  const reponse = await axios.get('/api/notifications');
  return reponse.data.notifications;
};

export const marqueNotificationCommeLue = async (type: string, id: string) => {
  await axios.put(`/api/notifications/${type}/${id}`);
};
