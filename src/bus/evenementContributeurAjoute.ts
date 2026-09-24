import { EvenementMetier } from './evenementMetier.js';
import Service from '../modeles/service.js';
import Utilisateur from '../modeles/utilisateur.js';
import { ErreurDonneesObligatoiresManquantes } from '../erreurs.js';

type Donnees = {
  acteur: Utilisateur;
  destinataire: Utilisateur;
  services: Service[];
};

export class EvenementContributeurAjoute extends EvenementMetier<Donnees>([
  'acteur',
  'destinataire',
  'services',
]) {
  constructor(donnees: Donnees) {
    super(donnees);
    if (donnees.services.length === 0)
      throw new ErreurDonneesObligatoiresManquantes(
        'Il manque la donnée services'
      );
  }
}
