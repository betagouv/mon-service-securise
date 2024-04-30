const adaptateurHorlogeParDefaut = require('../adaptateurs/adaptateurHorloge');
const Base = require('./base');
const Referentiel = require('../referentiel');
const EtatVisiteGuidee = require('./etatVisiteGuidee');

class ParcoursUtilisateur extends Base {
  constructor(
    donnees = {},
    referentiel = Referentiel.creeReferentielVide(),
    adaptateurHorloge = adaptateurHorlogeParDefaut
  ) {
    super({
      proprietesAtomiquesRequises: ['idUtilisateur', 'dateDerniereConnexion'],
    });
    this.renseigneProprietes(donnees);
    this.etatVisiteGuidee = new EtatVisiteGuidee(
      donnees.etatVisiteGuidee,
      referentiel
    );
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
      this.referentiel.derniereNouvelleFonctionnalite(
        this.adaptateurHorloge.maintenant()
      );
    if (!derniereFonctionnalite) return undefined;
    if (!this.dateDerniereConnexion) return derniereFonctionnalite?.id;
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

  static pourUtilisateur(idUtilisateur, referentiel) {
    return new ParcoursUtilisateur(
      {
        idUtilisateur,
        etatVisiteGuidee: { dejaTerminee: false, enPause: false },
      },
      referentiel
    );
  }

  toJSON() {
    return {
      ...super.toJSON(),
      etatVisiteGuidee: this.etatVisiteGuidee.toJSON(),
    };
  }
}

module.exports = ParcoursUtilisateur;
