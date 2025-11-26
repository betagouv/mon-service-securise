import { Referentiel, ReferentielV2 } from '../../referentiel.interface.js';
import { DetailMesure } from './simulationMigrationReferentiel.types.js';
import { IdMesureV2 } from '../../../donneesReferentielMesuresV2.js';
import { IdMesureV1 } from '../../../donneesConversionReferentielMesures.js';

export class DescriptionEquivalenceMesure {
  constructor(
    private readonly referentielV1: Referentiel,
    private readonly referentielV2: ReferentielV2 // eslint-disable-next-line no-empty-function
  ) {}

  ajoutee(idMesure: IdMesureV2): DetailMesure {
    return {
      nouvelleDescription: this.referentielV2.mesure(idMesure).description,
      statut: 'ajoutee',
    };
  }

  inchangees(
    idMesureV1: IdMesureV1,
    idsMesureV2: IdMesureV2[]
  ): DetailMesure[] {
    return idsMesureV2.map((idMesureV2) => ({
      ancienneDescription: this.referentielV1.mesure(idMesureV1).description,
      nouvelleDescription: this.referentielV2.mesure(idMesureV2).description,
      statut: 'inchangee',
    }));
  }

  modifiees(idMesureV1: IdMesureV1, idsMesureV2: IdMesureV2[]): DetailMesure[] {
    return idsMesureV2.map((idMesureV2) => ({
      ancienneDescription: this.referentielV1.mesure(idMesureV1).description,
      nouvelleDescription: this.referentielV2.mesure(idMesureV2).description,
      statut: 'modifiee',
    }));
  }

  supprimee(idMesureV1: IdMesureV1): DetailMesure {
    return {
      ancienneDescription: this.referentielV1.mesure(idMesureV1).description,
      statut: 'supprimee',
    };
  }
}
