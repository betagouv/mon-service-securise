import { IdMesureV2 } from '../../../donneesReferentielMesuresV2.js';
import MesureGenerale from '../../modeles/mesureGenerale.js';
import { MesureAvecStatut } from './vraisemblance/vraisemblance.types.js';
import type { StatutMesure } from '../../modeles/mesure.js';

export class MesuresPourRisque {
  // eslint-disable-next-line no-empty-function
  constructor(private readonly mesures: Record<IdMesureV2, MesureGenerale>) {}

  avecStatutReel(): Record<IdMesureV2, MesureAvecStatut> {
    return Object.fromEntries(
      Object.entries(this.mesures).map(([id, mesure]) => [
        id,
        { statut: mesure.statut },
      ])
    ) as Record<IdMesureV2, MesureAvecStatut>;
  }

  avecStatutVide(): Record<IdMesureV2, MesureAvecStatut> {
    return this.cloneAvecStatut('');
  }

  avecStatutFait() {
    return this.cloneAvecStatut('fait');
  }

  private cloneAvecStatut(statut: StatutMesure | '') {
    const statutsVides = structuredClone(this.avecStatutReel());
    // eslint-disable-next-line no-restricted-syntax,guard-for-in
    for (const idMesure in statutsVides) {
      statutsVides[idMesure].statut = statut;
    }
    return statutsVides;
  }
}
