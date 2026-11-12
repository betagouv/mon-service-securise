import { DescriptionServiceV2 } from '../descriptionServiceV2.js';
import { NiveauSecurite } from '../../../donneesReferentielMesuresV2.js';

export type BesoinsDeSecurite = {
  niveau: string;
  resume: string;
};

const NIVEAUX: Record<NiveauSecurite, { nom: string; resume: string }> = {
  niveau1: {
    nom: 'Basiques',
    resume:
      "Les besoins de sécurité sont basiques en l'absence de données ou de fonctionnalités sensibles.",
  },
  niveau2: {
    nom: 'Modérés',
    resume:
      'Les besoins de sécurité sont modérés compte tenu de données ou de fonctionnalités plus sensibles traitées par le service.',
  },
  niveau3: {
    nom: 'Avancés',
    resume:
      'Les besoins de sécurité sont avancés compte tenu de la sensibilité des données traitées ou des fonctionnalités proposées.',
  },
};

export const besoinsDeSecurite = (
  description: DescriptionServiceV2
): BesoinsDeSecurite => {
  const niveau = NIVEAUX[description.niveauSecurite];
  return { niveau: niveau.nom, resume: niveau.resume };
};
