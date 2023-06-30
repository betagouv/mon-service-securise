const Evenement = require('./evenement');
const { ErreurIdentifiantUtilisateurManquant } = require('./erreurs');
const Utilisateur = require('../utilisateur');

class EvenementProfilUtilisateurModifie extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    const valide = () => {
      if (!donnees.idUtilisateur)
        throw new ErreurIdentifiantUtilisateurManquant();
    };

    valide();

    const roles = [];
    if (donnees.rssi) roles.push(Utilisateur.RSSI);
    if (donnees.delegueProtectionDonnees) roles.push('DPO');

    super(
      'PROFIL_UTILISATEUR_MODIFIE',
      {
        idUtilisateur: adaptateurChiffrement.hacheSha256(donnees.idUtilisateur),
        departementOrganisation: donnees.departementEntitePublique,
        roles,
      },
      date
    );
  }
}

module.exports = EvenementProfilUtilisateurModifie;
