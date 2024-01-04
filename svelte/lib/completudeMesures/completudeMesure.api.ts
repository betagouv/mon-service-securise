export const recupereCompletudeMesure = async (idService: string) => {
  const reponse = await axios.get(`/api/service/${idService}/completude`);
  return reponse.data.completude as number;
};
