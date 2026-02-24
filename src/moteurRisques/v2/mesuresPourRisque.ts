import { IdMesureV2 } from '../../../donneesReferentielMesuresV2.js';
import MesureGenerale from '../../modeles/mesureGenerale.js';
import { MesureAvecStatut } from './vraisemblance/vraisemblance.types.js';

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
    const statutsVides = structuredClone(this.avecStatutReel());
    // eslint-disable-next-line no-restricted-syntax,guard-for-in
    for (const idMesure in statutsVides) {
      statutsVides[idMesure].statut = '';
    }
    return statutsVides;
  }
}
