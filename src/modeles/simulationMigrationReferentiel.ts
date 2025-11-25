import type Service from './service.js';
import { DescriptionServiceV2 } from './descriptionServiceV2.js';
import { Referentiel, ReferentielV2 } from '../referentiel.interface.js';
import {
  conversionMesuresV1versV2,
  IdMesureV1,
} from '../../donneesConversionReferentielMesures.js';
import { MoteurReglesV2 } from '../moteurRegles/v2/moteurReglesV2.js';
import { IdMesureV2 } from '../../donneesReferentielMesuresV2.js';

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
    const moteurRegleV2 = new MoteurReglesV2(
      this.referentielV2,
      this.referentielV2.reglesMoteurV2()
    );
    const mesuresDuServiceV1 = this.serviceV1.mesures.mesuresPersonnalisees;
    const mesuresDuServiceV2 = moteurRegleV2.mesures(this.descriptionServiceV2);

    const idMesuresV2ConvertiesDepuisV1: Array<IdMesureV2> = Object.entries(
      conversionMesuresV1versV2
    )
      .filter(([idMesureV1]) =>
        Object.keys(mesuresDuServiceV1).includes(idMesureV1)
      )
      .flatMap(([, equivalence]) => equivalence.idsMesureV2);

    const mesuresAjouteesEnV2 = Object.keys(mesuresDuServiceV2).filter(
      (idMesuresV2) =>
        !idMesuresV2ConvertiesDepuisV1.includes(idMesuresV2 as IdMesureV2)
    );

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
      {
        nbMesuresInchangees: 0,
        nbMesuresModifiees: 0,
        nbMesuresSupprimees: 0,
        nbMesures: Object.keys(mesuresDuServiceV2).length,
        nbMesuresAjoutees: mesuresAjouteesEnV2.length,
      }
    );
  }
}
