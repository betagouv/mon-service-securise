const adaptateurHorlogeParDefaut = require('../adaptateurs/adaptateurHorloge');
const Base = require('./base');
const Referentiel = require('../referentiel');

class ParcoursUtilisateur extends Base {
  constructor(
    donnees = {},
    referentiel = Referentiel.creeReferentielVide(),
    adaptateurHorloge = adaptateurHorlogeParDefaut
  ) {
    super({
      proprietesAtomiquesRequises: [
        'id',
        'idUtilisateur',
        'dateDerniereConnexion',
      ],
    });
    this.renseigneProprietes(donnees);
    this.adaptateurHorloge = adaptateurHorloge;
    this.referentiel = referentiel;
  }

  enregistreDerniereConnexionMaintenant() {
    this.dateDerniereConnexion = this.adaptateurHorloge
      .maintenant()
      .toISOString();
  }

  recupereNouvelleFonctionnalite() {
    const derniereFonctionnalite =
      this.referentiel.derniereNouvelleFonctionnalite();
    if (!derniereFonctionnalite) return undefined;
    const dateDerniereConnexion = new Date(this.dateDerniereConnexion);
    const dateDeploiementDerniereFonctionnalite = new Date(
      derniereFonctionnalite.dateDeDeploiement
    );
    const dateAujourdhui = this.adaptateurHorloge.maintenant();
    if (
      dateDerniereConnexion < dateDeploiementDerniereFonctionnalite &&
      dateAujourdhui > dateDeploiementDerniereFonctionnalite
    )
      return derniereFonctionnalite.id;
    return undefined;
  }
}

module.exports = ParcoursUtilisateur;
