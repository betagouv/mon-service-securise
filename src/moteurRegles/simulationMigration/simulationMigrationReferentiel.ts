import type Service from '../../modeles/service.js';
import { DescriptionServiceV2 } from '../../modeles/descriptionServiceV2.js';
import { Referentiel, ReferentielV2 } from '../../referentiel.interface.js';
import {
  conversionMesuresV1versV2,
  IdMesureV1,
} from '../../../donneesConversionReferentielMesures.js';
import { MoteurReglesV2 } from '../v2/moteurReglesV2.js';
import { type IdMesureV2 } from '../../../donneesReferentielMesuresV2.js';

export type DetailMesure = {
  ancienneDescription?: string;
  nouvelleDescription?: string;
  statut: 'inchangee' | 'modifiee' | 'supprimee' | 'ajoutee';
};

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

    const tousLesIdMesureV1 = Object.keys(mesuresDuServiceV1) as IdMesureV1[];

    const detailsMesuresAjoutees: DetailMesure[] = mesuresAjouteesEnV2.map(
      (idMesure) => ({
        nouvelleDescription: this.referentielV2.mesure(idMesure).description,
        statut: 'ajoutee',
      })
    );

    const detailsAutresMesures: DetailMesure[] =
      tousLesIdMesureV1.flatMap<DetailMesure>((idMesureV1) => {
        const { idsMesureV2, statut } = conversionMesuresV1versV2[idMesureV1];
        if (statut === 'inchangee')
          return idsMesureV2.map((idMesureV2) => ({
            ancienneDescription:
              this.referentielV1.mesure(idMesureV1).description,
            nouvelleDescription:
              this.referentielV2.mesure(idMesureV2).description,
            statut: 'inchangee',
          }));
        if (statut === 'modifiee')
          return idsMesureV2.map((idMesureV2) => ({
            ancienneDescription:
              this.referentielV1.mesure(idMesureV1).description,
            nouvelleDescription:
              this.referentielV2.mesure(idMesureV2).description,
            statut: 'modifiee',
          }));
        return {
          ancienneDescription:
            this.referentielV1.mesure(idMesureV1).description,
          statut: 'supprimee',
        };
      });

    const detailsMesures: DetailMesure[] = [
      ...detailsMesuresAjoutees,
      ...detailsAutresMesures,
    ];

    return {
      detailsMesures,
      nbMesuresInchangees: detailsAutresMesures.filter(
        (m) => m.statut === 'inchangee'
      ).length,
      nbMesuresModifiees: detailsAutresMesures.filter(
        (m) => m.statut === 'modifiee'
      ).length,
      nbMesuresSupprimees: detailsAutresMesures.filter(
        (m) => m.statut === 'supprimee'
      ).length,
      nbMesures: Object.keys(mesuresDuServiceV2).length,
      nbMesuresAjoutees: detailsMesuresAjoutees.length,
    };
  }
}
