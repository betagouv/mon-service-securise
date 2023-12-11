import type { MesureGeneraleDTO, Mesures } from './tableauDesMesures.d';

export const recupereMesures = async (idService: string) => {
  const reponse = await axios.get(`/api/service/${idService}/mesures`);
  return reponse.data as Mesures;
};

export const metEnFormeMesures = (mesures: Mesures) => {
  const mesuresGenerales: Record<string, MesureGeneraleDTO> = Object.entries(
    mesures.mesuresGenerales
  )
    .filter(([id, mesure]) => mesure.statut)
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
  return {
    mesuresGenerales,
    mesuresSpecifiques: mesures.mesuresSpecifiques,
  };
};

export const enregistreMesures = async (
  idService: string,
  mesures: Mesures
) => {
  await axios.post(
    `/api/service/${idService}/mesures`,
    metEnFormeMesures(mesures)
  );
};
