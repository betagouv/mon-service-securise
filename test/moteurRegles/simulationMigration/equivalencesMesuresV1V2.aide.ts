import {
  conversionMesuresV1versV2,
  EquivalencesMesuresV1V2,
} from '../../../donneesConversionReferentielMesures.js';

export const toutesEquivalencesAvecStatut = (
  statut: 'inchangee' | 'modifiee' | 'supprimee'
): EquivalencesMesuresV1V2 =>
  Object.fromEntries(
    Object.entries(conversionMesuresV1versV2).map(([cle, valeur]) => [
      cle,
      { ...valeur, statut },
    ])
  ) as EquivalencesMesuresV1V2;
