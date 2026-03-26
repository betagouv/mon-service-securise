import type Service from '../service.js';
import { RisquesV2 } from '../../moteurRisques/v2/risquesV2.js';
import { RisqueV2 } from '../../moteurRisques/v2/risqueV2.js';

export class ObjetPDFAnnexeRisquesV2 {
  private readonly service: Service;
  private readonly risques: RisquesV2;

  constructor(service: Service) {
    this.service = service;
    this.risques = this.service.risquesV2!;
  }

  donnees() {
    const { risques, risquesSpecifiques, risquesBruts, risquesCibles } =
      this.risques.toJSON();

    function sansRisquesDesactives(
      risquesAFiltrer: ReturnType<InstanceType<typeof RisqueV2>['toJSON']>[]
    ) {
      return risquesAFiltrer.filter((r) => !r.desactive);
    }

    return {
      nomService: this.service.nomService(),
      risques: {
        risques: sansRisquesDesactives(risques),
        risquesBruts: sansRisquesDesactives(risquesBruts),
        risquesCibles: sansRisquesDesactives(risquesCibles),
        risquesSpecifiques,
      },
    };
  }
}
