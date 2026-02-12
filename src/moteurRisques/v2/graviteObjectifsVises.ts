/* eslint-disable class-methods-use-this */
import { DescriptionServiceV2 } from '../../modeles/descriptionServiceV2.js';
import { IdObjectifVise } from './selectionObjectifsVises.types.js';
import {
  AudienceCible,
  DureeDysfonctionnementAcceptable,
  VolumetrieDonneesTraitees,
} from '../../../donneesReferentielMesuresV2.js';

export type Gravite = 1 | 2 | 3 | 4;

const mappingAudienceCible: Record<AudienceCible, Gravite> = {
  limitee: 1,
  moyenne: 2,
  large: 3,
  tresLarge: 4,
};

const mappingVolumetrieDonnees: Record<VolumetrieDonneesTraitees, Gravite> = {
  faible: 1,
  moyen: 2,
  eleve: 3,
  tresEleve: 4,
};

const mappingDureeDysfonctionnement: Record<
  DureeDysfonctionnementAcceptable,
  Gravite
> = {
  plusDe24h: 1,
  moinsDe24h: 2,
  moinsDe12h: 3,
  moinsDe4h: 4,
};

export class GraviteObjectifsVises {
  calculePourService(
    service: DescriptionServiceV2
  ): Record<IdObjectifVise, Gravite> {
    return {
      OV1: mappingAudienceCible[service.audienceCible],
      OV2: mappingVolumetrieDonnees[service.volumetrieDonneesTraitees],
      OV3: mappingDureeDysfonctionnement[
        service.dureeDysfonctionnementAcceptable
      ],
      // Oui, c'est la même règle que pour l'OV1.
      OV4: mappingAudienceCible[service.audienceCible],
    };
  }
}
