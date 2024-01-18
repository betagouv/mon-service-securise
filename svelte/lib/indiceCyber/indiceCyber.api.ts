export const recupereIndiceCyber = async (idService: string) => {
  const { data } = await axios.get(`/api/service/${idService}/indiceCyber`);
  return {
    indiceCyber: data.indiceCyber.total,
    completudeSuffisantePourAfficherIndiceCyber:
      data.completudeSuffisantePourAfficherIndiceCyber,
  };
};
