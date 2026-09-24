import { EvenementMetier } from './evenementMetier.js';
import { UUID } from '../typesBasiques.js';
import { SourceAuthentification } from '../modeles/sourceAuthentification.js';

type Donnees = {
  idUtilisateur: UUID;
  dateDerniereConnexion: string;
  source: SourceAuthentification;
  connexionAvecMFA: boolean;
};

class EvenementNouvelleConnexionUtilisateur extends EvenementMetier<Donnees>([
  'idUtilisateur',
  'dateDerniereConnexion',
  'source',
  'connexionAvecMFA',
]) {
  constructor(donnees: Donnees) {
    super(donnees);
    if (Number.isNaN(new Date(donnees.dateDerniereConnexion).valueOf()))
      throw Error(
        "Impossible d'instancier l'événement sans date de dernière connexion valide"
      );
  }
}

export default EvenementNouvelleConnexionUtilisateur;
