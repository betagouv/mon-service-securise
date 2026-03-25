import type { Niveau } from '../risquesV2.d';

export type CouleurNiveauRisque = 'vert' | 'rouge' | 'orange';

export const couleur = (
  gravite: number,
  vraisemblance: number
): CouleurNiveauRisque => {
  const niveauRisque = gravite * vraisemblance;
  return niveauRisque <= 4 && vraisemblance < 3 && gravite < 4
    ? 'vert'
    : niveauRisque >= 8 && vraisemblance > 2 && gravite >= 2
      ? 'rouge'
      : 'orange';
};

export const mappingCouleursDSFR: Record<CouleurNiveauRisque, string> = {
  vert: 'green-emeraude',
  orange: 'yellow-moutarde',
  rouge: 'pink-macaron',
};

export const mappingCouleursNiveau: Record<CouleurNiveauRisque, string> = {
  vert: 'faible',
  orange: 'moyen',
  rouge: 'élevé',
};

export const mappingNomCategories: Record<string, string> = {
  disponibilite: 'Disponibilité',
  integrite: 'Intégrité',
  confidentialite: 'Confidentialité',
  tracabilite: 'Traçabilité',
};

export const mappingNiveauGravite: Record<Niveau, string> = {
  1: 'Minime',
  2: 'Significatif',
  3: 'Grave',
  4: 'Critique',
};

export const mappingNiveauVraisemblance: Record<Niveau, string> = {
  1: 'Peu vraisemblable',
  2: 'Vraisemblable',
  3: 'Très vraisemblable',
  4: 'Quasi-certain',
};
