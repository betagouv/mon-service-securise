import type {
  IdMesureGenerale,
  IdService,
  Mesures,
  MesureSpecifique,
  MesureGenerale,
} from './tableauDesMesures.d';
import type { DonneesServicePourTiroirContributeurs } from '../gestionContributeurs/gestionContributeurs.d';

const formatteurDate = new Intl.DateTimeFormat('en-EN');

export const recupereMesures = async (idService: IdService) => {
  const reponse = await axios.get(`/api/service/${idService}/mesures`);
  return reponse.data as Mesures;
};

export const recupereService = async (idService: IdService) => {
  const reponse = await axios.get<DonneesServicePourTiroirContributeurs>(
    `/api/service/${idService}`
  );
  return reponse.data;
};

export const recupereAutorisations = async (idService: IdService) => {
  const reponse = await axios.get(`/api/service/${idService}/autorisations`);
  return reponse.data;
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

export const associeModelesMesureSpecifiqueAuService = async (
  idService: IdService,
  idsModeles: string[]
) => {
  await axios.put(`/api/service/${idService}/modeles/mesureSpecifique`, {
    idsModeles,
  });
};
