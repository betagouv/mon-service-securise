import type Service from './service.js';
import { DescriptionServiceV2 } from './descriptionServiceV2.js';
import { Referentiel, ReferentielV2 } from '../referentiel.interface.js';
import {
  conversionMesuresV1versV2,
  IdMesureV1,
} from '../../donneesConversionReferentielMesures.js';

export class SimulationMigrationReferentiel {
  private readonly serviceV1: Service;
  private readonly descriptionServiceV2: DescriptionServiceV2;
  private readonly referentielV1: Referentiel;
  private readonly referentielV2: ReferentielV2;

  constructor({
    serviceV1,
    descriptionServiceV2,
    referentielV1,
    referentielV2,
  }: {
    serviceV1: Service;
    descriptionServiceV2: DescriptionServiceV2;
    referentielV1: Referentiel;
    referentielV2: ReferentielV2;
  }) {
    this.serviceV1 = serviceV1;
    this.descriptionServiceV2 = descriptionServiceV2;
    this.referentielV1 = referentielV1;
    this.referentielV2 = referentielV2;
  }

  evolutionMesures() {
    const mesuresDuServiceV1 = this.serviceV1.mesures.mesuresPersonnalisees;

    return Object.keys(mesuresDuServiceV1).reduce(
      (acc, idMesureV1) => {
        const { statut } = conversionMesuresV1versV2[idMesureV1 as IdMesureV1];
        if (statut === 'inchangee') {
          acc.nbMesuresInchangees += 1;
        } else if (statut === 'modifiee') {
          acc.nbMesuresModifiees += 1;
        } else if (statut === 'supprimee') {
          acc.nbMesuresSupprimees += 1;
        }
        return acc;
      },
      { nbMesuresInchangees: 0, nbMesuresModifiees: 0, nbMesuresSupprimees: 0 }
    );
  }
}
