const {
  fabriqueAdaptateurGestionErreur,
} = require('../adaptateurs/fabriqueAdaptateurGestionErreur');

class ServiceProfilAnssi {
  constructor({ depotDonnees, adaptateurProfilAnssi }) {
    this.depotDonnees = depotDonnees;
    this.adaptateurProfilAnssi = adaptateurProfilAnssi;
  }

  async synchroniseProfilUtilisateur(idUtilisateur) {
    const utilisateurMss = await this.depotDonnees.utilisateur(idUtilisateur);
    let profilAnssi;
    try {
      profilAnssi = await this.adaptateurProfilAnssi.recupere(
        utilisateurMss.email
      );
    } catch (e) {
      fabriqueAdaptateurGestionErreur().logueErreur(
        'Erreur de récupération du profil ANSSI',
        e
      );
    }

    if (!profilAnssi) {
      return;
    }

    const { nom, prenom, organisation, telephone, domainesSpecialite } =
      profilAnssi;

    const doitMettreAJour =
      utilisateurMss.nom !== nom ||
      utilisateurMss.prenom !== prenom ||
      utilisateurMss.entite.siret !== organisation.siret ||
      utilisateurMss.entite.nom !== organisation.nom ||
      utilisateurMss.entite.departement !== organisation.departement ||
      utilisateurMss.telephone !== telephone ||
      utilisateurMss.postes.toString() !== domainesSpecialite.toString();

    if (doitMettreAJour) {
      await this.depotDonnees.metsAJourUtilisateur(utilisateurMss.id, {
        nom,
        prenom,
        ...(organisation && { entite: organisation }),
        ...(telephone && { telephone }),
        postes: domainesSpecialite,
      });
    }
  }
}

module.exports = ServiceProfilAnssi;
