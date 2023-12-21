import type { MesuresExistantes } from './mesure.d';
import type { MesureStore } from './mesure.store';

export const enregistreMesures = async (
  idService: string,
  mesuresExistantes: MesuresExistantes,
  $store: MesureStore
) => {
  if ($store.etape === 'Creation') {
    mesuresExistantes.mesuresSpecifiques.push($store.mesureEditee.mesure);
  } else {
    if ($store.etape === 'EditionGenerale') {
      const { modalites, statut } = $store.mesureEditee.mesure;
      mesuresExistantes.mesuresGenerales[
        $store.mesureEditee.metadonnees.idMesure
      ] = { modalites, statut };
    } else {
      mesuresExistantes.mesuresSpecifiques[
        $store.mesureEditee.metadonnees.idMesure as number
      ] = $store.mesureEditee.mesure;
    }
  }
  await axios.post(`/api/service/${idService}/mesures`, mesuresExistantes);
};
