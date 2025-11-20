import type { UUID } from '../typesBasiquesSvelte';
import type { BrouillonIncomplet } from '../creationV2/creationV2.types';
import type { MiseAJour } from '../creationV2/creationV2.api';

type Simulation = BrouillonIncomplet;

export const lisSimulation = async (idService: UUID): Promise<Simulation> =>
  (
    await axios.get<Simulation>(
      `/api/service/${idService}/simulation-migration-referentiel`
    )
  ).data;

export const metsAJourSimulation = async (
  idService: UUID,
  donnees: MiseAJour
) => {
  const misesAJour = Object.entries(donnees);
  for (let i = 0; i < misesAJour.length; i++) {
    const [proprieteMiseAJour, valeurMiseAJour] = misesAJour[i];
    await axios.put(
      `/api/service/${idService}/simulation-migration-referentiel/${proprieteMiseAJour}`,
      { [proprieteMiseAJour]: valeurMiseAJour }
    );
  }
};
