import type {
  IdMesureGenerale,
  IdService,
  Mesures,
} from './tableauDesMesures.d';

export const recupereMesures = async (idService: IdService) => {
  const reponse = await axios.get(`/api/service/${idService}/mesures`);
  return reponse.data as Mesures;
};

export const metEnFormeMesures = (mesures: Mesures) => {
  type MesureGeneraleApi = {
    statut: string;
    modalites?: string;
  };

  const mesuresGenerales: Record<IdMesureGenerale, MesureGeneraleApi> =
    Object.entries(mesures.mesuresGenerales)
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

  return {
    mesuresGenerales,
    mesuresSpecifiques: mesures.mesuresSpecifiques,
  };
};

export const enregistreMesures = async (
  idService: IdService,
  mesures: Mesures
) => {
  await axios.post(
    `/api/service/${idService}/mesures`,
    metEnFormeMesures(mesures)
  );
};
