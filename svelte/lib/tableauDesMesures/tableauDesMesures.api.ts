import type { MesureGeneraleDTO, Mesures } from './tableauDesMesures.d';

export const recupereMesures = async (idService: string) => {
  const reponse = await axios.get(`/api/service/${idService}/mesures`);
  return reponse.data as Mesures;
};

export const enregistreMesures = async (
  idService: string,
  mesures: Mesures
) => {
  const mesuresGenerales: Record<string, MesureGeneraleDTO> = Object.entries(
    mesures.mesuresGenerales
  )
    .filter(([_, mesure]) => mesure.statut)
    .reduce(
      (acc, [id, m]) => ({
        ...acc,
        [id]: {
          statut: m.statut,
          ...(m.modalites && { modalites: m.modalites }),
        },
      }),
      {}
    );

  await axios.post(`/api/service/${idService}/mesures`, {
    mesuresGenerales,
    mesuresSpecifiques: mesures.mesuresSpecifiques,
  });
};
