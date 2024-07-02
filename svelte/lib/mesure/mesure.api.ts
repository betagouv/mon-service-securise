import type { MesuresExistantes } from './mesure.d';
import type { MesureStore } from './mesure.store';

export const enregistreMesures = async (
  idService: string,
  mesuresExistantes: MesuresExistantes,
  $store: MesureStore
) => {
  async function enregistreMesureGenerale() {
    const idMesure = $store.mesureEditee.metadonnees.idMesure;
    const { modalites, statut } = $store.mesureEditee.mesure;
    mesuresExistantes.mesuresGenerales[idMesure] = { modalites, statut };
    await axios.put(`/api/service/${idService}/mesures/${idMesure}`, {
      modalites,
      statut,
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
      mesuresExistantes.mesuresSpecifiques
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
