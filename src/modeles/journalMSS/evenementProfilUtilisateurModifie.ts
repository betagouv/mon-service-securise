import Evenement, { Hacheur } from './evenement.js';
import { ErreurDonneeManquante } from './erreurs.js';
import Utilisateur from '../utilisateur.js';

class EvenementProfilUtilisateurModifie extends Evenement<Utilisateur> {
  protected override typeEvenement() {
    return 'PROFIL_UTILISATEUR_MODIFIE';
  }

  protected override valide(utilisateur: Utilisateur) {
    if (!(utilisateur instanceof Utilisateur))
      throw new ErreurDonneeManquante('utilisateur');
  }

  protected override donneesAConsigner(
    utilisateur: Utilisateur,
    hache: Hacheur
  ) {
    return {
      idUtilisateur: hache(utilisateur.id),
      departementOrganisation: utilisateur.entite?.departement,
      roles: utilisateur.postes ?? [],
      estimationNombreServices: utilisateur.estimationNombreServices ?? {},
    };
  }
}

export default EvenementProfilUtilisateurModifie;
