export const termineEtape = async (idEtape: string) => {
  const reponse = await axios.post(`/api/visiteGuidee/${idEtape}/termine`);
  return reponse.data.urlEtapeSuivante;
};
