import type { ActiviteMesure, MesuresExistantes } from './mesure.d';
import type { MesureStore } from './mesure.store';

const formatteurDate = new Intl.DateTimeFormat('en-EN');

export const enregistreMesures = async (
  idService: string,
  mesuresExistantes: MesuresExistantes,
  $store: MesureStore
) => {
  async function enregistreMesureGenerale() {
    const idMesure = $store.mesureEditee.metadonnees.idMesure;
    const { modalites, statut, priorite, responsables } =
      $store.mesureEditee.mesure;
    let { echeance } = $store.mesureEditee.mesure;
    if (echeance) echeance = formatteurDate.format(new Date(echeance));

    mesuresExistantes.mesuresGenerales[idMesure] = { modalites, statut };

    await axios.put(`/api/service/${idService}/mesures/${idMesure}`, {
      modalites,
      statut,
      priorite,
      echeance,
      responsables,
    });
  }

  async function enregistreMesuresSpecifiques() {
    if ($store.etape === 'Creation') {
      mesuresExistantes.mesuresSpecifiques.push($store.mesureEditee.mesure);
    } else {
      mesuresExistantes.mesuresSpecifiques[
        $store.mesureEditee.metadonnees.idMesure as number
      ] = $store.mesureEditee.mesure;
    }
    await axios.put(
      `/api/service/${idService}/mesures-specifiques`,
      mesuresExistantes.mesuresSpecifiques.map((m) => {
        if (m.echeance)
          m.echeance = formatteurDate.format(new Date(m.echeance));
        return m;
      })
    );
  }

  if ($store.etape === 'EditionGenerale') {
    await enregistreMesureGenerale();
  } else {
    await enregistreMesuresSpecifiques();
  }
};

export const supprimeMesureSpecifique = async (
  idService: string,
  mesuresExistantes: MesuresExistantes,
  idMesureSpecifique: number
) => {
  const copieMesuresSpecifiques = [...mesuresExistantes.mesuresSpecifiques];
  copieMesuresSpecifiques.splice(idMesureSpecifique, 1);
  await axios.put(
    `/api/service/${idService}/mesures-specifiques`,
    copieMesuresSpecifiques
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
  idMesure: string | number
): Promise<ActiviteMesure[]> => [];
