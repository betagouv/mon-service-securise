import * as adaptateurRechercheEntreprise from './adaptateurRechercheEntrepriseAPI.js';

export type AdaptateurRechercheEntreprise = Pick<
  typeof adaptateurRechercheEntreprise,
  'rechercheOrganisations' | 'recupereDetailsOrganisation'
>;
