export const couleur = (gravite: number, vraisemblance: number) => {
  const niveauRisque = gravite * vraisemblance;
  return niveauRisque <= 4 && vraisemblance < 3 && gravite < 4
    ? 'vert'
    : niveauRisque >= 8 && vraisemblance > 2 && gravite >= 2
    ? 'rouge'
    : 'orange';
};

export const mappingCouleursDSFR = {
  vert: 'green-emeraude',
  orange: 'yellow-moutarde',
  rouge: 'pink-macaron',
};

export const mappingNomCategories: Record<string, string> = {
  disponibilite: 'Disponibilité',
  integrite: 'Intégrité',
  confidentialite: 'Confidentialité',
  tracabilite: 'Traçabilité',
};
