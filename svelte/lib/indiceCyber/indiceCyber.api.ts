export const recupereIndiceCyber = async (idService: string) => {
  const reponse = await axios.get(`/api/service/${idService}/indiceCyber`);
  return reponse.data.total as number;
};
