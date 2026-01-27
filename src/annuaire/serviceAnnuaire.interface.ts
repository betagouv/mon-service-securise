import { UUID } from '../typesBasiques.js';
import Utilisateur from '../modeles/utilisateur.js';

type Organisation = {
  nom: string;
  departement: string;
  siret: string;
};

export interface ServiceAnnuaire {
  rechercheOrganisations: (
    terme: string,
    departement?: string
  ) => Promise<Organisation[]>;
  rechercheContributeurs: (
    idUtilisateur: UUID,
    recherche: string
  ) => Promise<Utilisateur[]>;
}
