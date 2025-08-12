const Referentiel = require('../../referentiel');

class TeleversementModelesMesureSpecifique {
  constructor(donnees, referentiel = Referentiel.creeReferentielVide()) {
    this.modelesTeleverses = donnees;
    this.referentiel = referentiel;
  }

  rapportDetaille() {
    const modelesTeleverses = this.modelesTeleverses.map((m, idx) => ({
      modele: m,
      erreurs: this.#controleUnModele(m),
      numeroLigne: idx + 1,
    }));

    const statut =
      modelesTeleverses.some((m) => m.erreurs.length > 0) ||
      modelesTeleverses.length === 0
        ? 'INVALIDE'
        : 'VALIDE';

    return { modelesTeleverses, statut };
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
