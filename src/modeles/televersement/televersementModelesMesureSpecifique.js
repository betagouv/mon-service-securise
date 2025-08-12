const Referentiel = require('../../referentiel');

class TeleversementModelesMesureSpecifique {
  constructor(donnees, referentiel = Referentiel.creeReferentielVide()) {
    this.modelesTeleverses = donnees;
    this.referentiel = referentiel;
  }

  rapportDetaille() {
    return {
      modelesTeleverses: this.modelesTeleverses.map((m) => ({
        modele: m,
        erreurs: this.#controleUnModele(m),
      })),
    };
  }

  // eslint-disable-next-line class-methods-use-this
  #controleUnModele(modele) {
    const erreurs = [];

    if (!modele.description) erreurs.push('INTITULE_MANQUANT');

    if (!this.referentiel.categorieMesureParLabel(modele.categorie))
      erreurs.push('CATEGORIE_INCONNUE');

    return erreurs;
  }
}

module.exports = TeleversementModelesMesureSpecifique;
