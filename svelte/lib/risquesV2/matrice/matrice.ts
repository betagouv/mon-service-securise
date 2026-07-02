import type { Risque, TousRisques } from '../risquesV2';

export type RisqueAAfficher = Pick<Risque, 'id' | 'gravite' | 'vraisemblance'>;

const enRisqueAAfficher = (risques: Risque[]) =>
  risques
    .filter((r) => !r.desactive)
    .map(({ id, vraisemblance, gravite }) => ({
      id,
      vraisemblance,
      gravite,
    }));

export const enRisquesBrutsAAfficher = (risques: TousRisques) => [
  ...enRisqueAAfficher(risques.risquesBruts),
  ...risques.risquesSpecifiques.map(
    ({ identifiantNumerique, vraisemblanceBrute, graviteBrute }) => ({
      id: identifiantNumerique,
      vraisemblance: vraisemblanceBrute,
      gravite: graviteBrute,
    })
  ),
];

export const enRisquesActuelsAAfficher = (risques: TousRisques) => [
  ...enRisqueAAfficher(risques.risques),
  ...risques.risquesSpecifiques.map(
    ({ identifiantNumerique, vraisemblance, gravite }) => ({
      id: identifiantNumerique,
      vraisemblance,
      gravite,
    })
  ),
];

export const enRisquesCiblesAAfficher = (risques: TousRisques) => [
  ...enRisqueAAfficher(risques.risquesCibles),
  ...risques.risquesSpecifiques.map(
    ({ identifiantNumerique, vraisemblance, gravite }) => ({
      id: identifiantNumerique,
      vraisemblance,
      gravite,
    })
  ),
];
