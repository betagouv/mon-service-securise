const Evenement = require('./evenement');
const { ErreurIdentifiantUtilisateurManquant } = require('./erreurs');

class EvenementProfilUtilisateurModifie extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    const valide = () => {
      if (!donnees.idUtilisateur)
        throw new ErreurIdentifiantUtilisateurManquant();
    };

    valide();

    super(
      'PROFIL_UTILISATEUR_MODIFIE',
      {
        idUtilisateur: adaptateurChiffrement.hacheSha256(donnees.idUtilisateur),
        departementOrganisation: donnees.departementEntitePublique,
        roles: donnees.postes ?? [],
      },
      date
    );
  }
}

module.exports = EvenementProfilUtilisateurModifie;
