import { EvenementMetier } from './evenementMetier.js';
import { UUID } from '../typesBasiques.js';

type Donnees = {
  idAdmin: UUID;
  idUtilisateurAdministre: UUID;
  idsServices: UUID[];
};

export class EvenementAccesUtilisateurAdministreRetires extends EvenementMetier<Donnees>(
  ['idAdmin', 'idUtilisateurAdministre', 'idsServices']
) {}
