import Evenement, { Hacheur } from './evenement.js';
import { UUID } from '../../typesBasiques.js';

const LONGUEUR_MAXIMALE_COMMENTAIRE = 2000;

type Donnees = {
  idService: UUID;
  idUtilisateur: UUID;
  idMesure: string;
  idRetour: string;
  commentaire: string;
};

class EvenementRetourUtilisateurMesure extends Evenement<Donnees> {
  protected override typeEvenement() {
    return 'RETOUR_UTILISATEUR_MESURE_RECU';
  }

  protected override proprietesRequises(): (keyof Donnees)[] {
    return ['idService', 'idUtilisateur', 'idMesure', 'idRetour'];
  }

  protected override donneesAConsigner(
    { idService, idUtilisateur, idMesure, idRetour, commentaire }: Donnees,
    hache: Hacheur
  ) {
    return {
      idService: hache(idService),
      idUtilisateur: hache(idUtilisateur),
      idMesure,
      idRetour,
      commentaire: commentaire.substring(0, LONGUEUR_MAXIMALE_COMMENTAIRE),
    };
  }
}

export default EvenementRetourUtilisateurMesure;
