import Evenement, { Hacheur } from './evenement.js';
import { UUID } from '../../typesBasiques.js';

type Donnees = { idUtilisateur: UUID };

class EvenementNouvelUtilisateurInscrit extends Evenement<Donnees> {
  protected override typeEvenement() {
    return 'NOUVEL_UTILISATEUR_INSCRIT';
  }

  protected override proprietesRequises(): (keyof Donnees)[] {
    return ['idUtilisateur'];
  }

  protected override donneesAConsigner(
    { idUtilisateur }: Donnees,
    hache: Hacheur
  ) {
    return { idUtilisateur: hache(idUtilisateur) };
  }
}

export default EvenementNouvelUtilisateurInscrit;
