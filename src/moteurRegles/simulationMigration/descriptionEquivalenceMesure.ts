import { Referentiel, ReferentielV2 } from '../../referentiel.interface.js';
import { DetailMesure } from './simulationMigrationReferentiel.types.js';
import { IdMesureV2 } from '../../../donneesReferentielMesuresV2.js';
import {
  EquivalencesMesuresV1V2,
  IdMesureV1,
} from '../../../donneesConversionReferentielMesures.js';

export class DescriptionEquivalenceMesure {
  constructor(
    private readonly referentielV1: Referentiel,
    private readonly referentielV2: ReferentielV2,
    private readonly equivalences: EquivalencesMesuresV1V2 // eslint-disable-next-line no-empty-function
  ) {}

  ajoutee(idMesure: IdMesureV2): DetailMesure {
    return {
      nouvelleDescription: this.referentielV2.mesure(idMesure).description,
      statut: 'ajoutee',
      detailStatut: 'introduite',
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
      detailStatut: this.equivalences[idMesureV1].detailStatut,
    }));
  }

  modifiees(idMesureV1: IdMesureV1, idsMesureV2: IdMesureV2[]): DetailMesure[] {
    return idsMesureV2.map((idMesureV2) => ({
      ancienneDescription: this.referentielV1.mesure(idMesureV1).description,
      nouvelleDescription: this.referentielV2.mesure(idMesureV2).description,
      statut: 'modifiee',
      detailStatut: this.equivalences[idMesureV1].detailStatut,
    }));
  }

  supprimee(idMesureV1: IdMesureV1): DetailMesure {
    return {
      ancienneDescription: this.referentielV1.mesure(idMesureV1).description,
      statut: 'supprimee',
      detailStatut: this.equivalences[idMesureV1].detailStatut,
    };
  }
}
