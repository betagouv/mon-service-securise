import { EvenementMetier } from './evenementMetier.js';
import { UUID } from '../typesBasiques.js';
import { Role } from '../modeles/autorisations/autorisation.js';
import { ErreurDonneesObligatoiresManquantes } from '../erreurs.js';

type Donnees = {
  idService: UUID;
  autorisations: { idUtilisateur: UUID; droit: Role }[];
};

export class EvenementAutorisationsServiceModifiees extends EvenementMetier<Donnees>(
  ['idService', 'autorisations']
) {
  constructor(donnees: Donnees) {
    super(donnees);
    if (donnees.autorisations.length === 0)
      throw new ErreurDonneesObligatoiresManquantes(
        'Il manque la donnée autorisations'
      );
  }
}
