export const creeBrouillonService = async (nomService: string) => {
  await axios.post('/api/brouillon-service', { nomService });
};
