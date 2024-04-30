export const termineEtape = async (idEtape: string) => {
  const reponse = await axios.post(`/api/visiteGuidee/${idEtape}/termine`);
  return reponse.data.urlEtapeSuivante;
};
export const finaliseVisiteGuidee = async () => {
  await axios.post(`/api/visiteGuidee/termine`);
};
