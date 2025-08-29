import Evenement from './evenement.js';
import { ErreurUtilisateurManquant } from './erreurs.js';
import Utilisateur from '../utilisateur.js';

class EvenementProfilUtilisateurModifie extends Evenement {
  constructor(utilisateur, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    const valide = () => {
      if (!utilisateur || !(utilisateur instanceof Utilisateur))
        throw new ErreurUtilisateurManquant();
    };

    valide();

    super(
      'PROFIL_UTILISATEUR_MODIFIE',
      {
        idUtilisateur: adaptateurChiffrement.hacheSha256(utilisateur.id),
        departementOrganisation: utilisateur.entite?.departement,
        roles: utilisateur.postes ?? [],
        estimationNombreServices: utilisateur.estimationNombreServices ?? {},
      },
      date
    );
  }
}

export default EvenementProfilUtilisateurModifie;
