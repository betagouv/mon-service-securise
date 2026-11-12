import { DescriptionServiceV2 } from '../descriptionServiceV2.js';
import { NiveauSecurite } from '../../../donneesReferentielMesuresV2.js';

export type BesoinsDeSecurite = {
  niveau: string;
};

const NOMS_DES_NIVEAUX: Record<NiveauSecurite, string> = {
  niveau1: 'Basiques',
  niveau2: 'Modérés',
  niveau3: 'Avancés',
};

export const besoinsDeSecurite = (
  description: DescriptionServiceV2
): BesoinsDeSecurite => ({
  niveau: NOMS_DES_NIVEAUX[description.niveauSecurite],
});
