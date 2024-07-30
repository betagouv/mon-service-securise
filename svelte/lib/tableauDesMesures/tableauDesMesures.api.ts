import { decode } from 'html-entities';
import type {
  IdMesureGenerale,
  IdService,
  Mesures,
  MesureSpecifique,
  MesureGenerale,
} from './tableauDesMesures.d';

const decodeEntitesHtml = (mesures: Mesures) => {
  mesures.mesuresSpecifiques = mesures.mesuresSpecifiques.map(
    (m: MesureSpecifique) => ({
      ...m,
      description: decode(m.description),
      modalites: decode(m.modalites),
    })
  );

  for (const idMesure in mesures.mesuresGenerales) {
    const laMesure = mesures.mesuresGenerales[idMesure];

    if (!laMesure.modalites) continue;

    laMesure.modalites = decode(laMesure.modalites);
  }
};

export const recupereMesures = async (idService: IdService) => {
  const reponse = await axios.get(`/api/service/${idService}/mesures`);
  decodeEntitesHtml(reponse.data);
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

export const enregistreMesuresSpecifiques = async (
  idService: IdService,
  mesures: MesureSpecifique[]
) => {
  await axios.put(`/api/service/${idService}/mesures-specifiques`, mesures);
};

export const enregistreMesureGenerale = async (
  idService: IdService,
  idMesure: IdMesureGenerale,
  donneesMesure: MesureGenerale
) => {
  await axios.put(`/api/service/${idService}/mesures/${idMesure}`, {
    statut: donneesMesure.statut,
    priorite: donneesMesure.priorite,
    ...(donneesMesure.modalites && { modalites: donneesMesure.modalites }),
  });
};
