import { EvenementMetier } from './evenementMetier.js';
import { UUID } from '../typesBasiques.js';

type Donnees = { idActeur: UUID; idCible: UUID; siret: string };

export class EvenementAdminNommeSurOrganisation extends EvenementMetier<Donnees>(
  ['idActeur', 'idCible', 'siret']
) {}
