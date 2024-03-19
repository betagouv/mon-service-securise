const Evenement = require('./evenement');
const { ErreurUtilisateurManquant } = require('./erreurs');
const Utilisateur = require('../utilisateur');

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
      },
      date
    );
  }
}

module.exports = EvenementProfilUtilisateurModifie;
