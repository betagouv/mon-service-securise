export const recupereIndiceCyberPersonnalise = async (idService: string) => {
  const reponse = await axios.get(
    `/api/service/${idService}/indiceCyberPersonnalise`
  );
  return reponse.data.total as number;
};
