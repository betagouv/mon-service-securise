import type { ActiviteMesure } from './mesure.d';
import type { MesureStore } from './mesure.store';

const formatteurDate = new Intl.DateTimeFormat('en-EN');

export const enregistreMesures = async (
  idService: string,
  $store: MesureStore
) => {
  async function enregistreMesureGenerale() {
    const idMesure = <string>$store.mesureEditee.metadonnees.idMesure;
    const { modalites, statut, priorite, responsables } =
      $store.mesureEditee.mesure;
    let { echeance } = $store.mesureEditee.mesure;
    if (echeance) echeance = formatteurDate.format(new Date(echeance));

    await axios.put(`/api/service/${idService}/mesures/${idMesure}`, {
      modalites,
      statut,
      priorite,
      echeance,
      responsables,
    });
  }

  async function enregistreMesuresSpecifiques() {
    const { id, echeance, ...donnees } = $store.mesureEditee.mesure;
    const payload = {
      ...donnees,
      ...(echeance && {
        echeance: formatteurDate.format(new Date(echeance)),
      }),
    };
    if ($store.etape === 'Creation') {
      await axios.post(`/api/service/${idService}/mesuresSpecifiques`, payload);
    } else {
      await axios.put(
        `/api/service/${idService}/mesuresSpecifiques/${id}`,
        payload
      );
    }
  }

  if ($store.etape === 'EditionGenerale') {
    await enregistreMesureGenerale();
  } else {
    await enregistreMesuresSpecifiques();
  }
};

export const supprimeMesureSpecifique = async (
  idService: string,
  idMesure: string
) => {
  await axios.delete(
    `/api/service/${idService}/mesuresSpecifiques/${idMesure}`
  );
};

export const enregistreRetourUtilisateur = async (
  idService: string,
  idMesure: string,
  idRetour: string,
  commentaire: string
) => {
  await axios.post(`/api/service/${idService}/retourUtilisateurMesure`, {
    idMesure,
    idRetour,
    commentaire,
  });
};

export const recupereActiviteMesure = async (
  idService: string,
  idMesure: string | number
): Promise<ActiviteMesure[]> => {
  const reponse = await axios.get(
    `/api/service/${idService}/mesures/${idMesure}/activites`
  );
  return reponse.data.map((a: any) => ({ ...a, date: new Date(a.date) }));
};

export const enregistreCommentaire = async (
  idService: string,
  idMesure: string,
  contenu: string
) =>
  await axios.post(
    `/api/service/${idService}/mesures/${idMesure}/activites/commentaires`,
    { contenu }
  );
