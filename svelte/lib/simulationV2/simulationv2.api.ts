import type { UUID } from '../typesBasiquesSvelte';
import type { BrouillonIncomplet } from '../creationV2/creationV2.types';

type Simulation = BrouillonIncomplet;

export const lisSimulation = async (idService: UUID): Promise<Simulation> =>
  (
    await axios.get<Simulation>(
      `/api/service/${idService}/simulation-migration-referentiel`
    )
  ).data;
