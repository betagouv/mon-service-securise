import { decode } from 'html-entities';
import type {
  IdMesureGenerale,
  IdService,
  Mesures,
  MesureSpecifique,
  MesureGenerale,
  Contributeur,
} from './tableauDesMesures.d';

const formatteurDate = new Intl.DateTimeFormat('en-EN');

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

const decodeContributeursHtml = (contributeurs: Contributeur[]) => {
  contributeurs = contributeurs.map((c) => ({
    ...c,
    poste: decode(c.poste),
    prenomNom: decode(c.prenomNom),
  }));
};

export const recupereMesures = async (idService: IdService) => {
  const reponse = await axios.get(`/api/service/${idService}/mesures`);
  decodeEntitesHtml(reponse.data);
  return reponse.data as Mesures;
};

export const recupereContributeurs = async (idService: IdService) => {
  const reponse = await axios.get(`/api/service/${idService}`);
  decodeContributeursHtml(reponse.data.contributeurs);
  return reponse.data.contributeurs as Contributeur[];
};

export const recupereAutorisations = async (idService: IdService) => {
  const reponse = await axios.get(`/api/service/${idService}/autorisations`);
  return reponse.data;
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

export const metsAJourMesureSpecifique = async (
  idService: IdService,
  mesure: MesureSpecifique
) => {
  if (mesure.echeance)
    mesure.echeance = formatteurDate.format(new Date(mesure.echeance));
  const { id, ...donnees } = mesure;
  await axios.put(
    `/api/service/${idService}/mesuresSpecifiques/${id}`,
    donnees
  );
};

export const enregistreMesureGenerale = async (
  idService: IdService,
  idMesure: IdMesureGenerale,
  donneesMesure: MesureGenerale
) => {
  await axios.put(`/api/service/${idService}/mesures/${idMesure}`, {
    statut: donneesMesure.statut,
    priorite: donneesMesure.priorite,
    responsables: donneesMesure.responsables,
    echeance: donneesMesure.echeance
      ? formatteurDate.format(new Date(donneesMesure.echeance))
      : donneesMesure.echeance,
    ...(donneesMesure.modalites && { modalites: donneesMesure.modalites }),
  });
};
