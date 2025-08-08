class TeleversementModelesMesureSpecifique {
  constructor(donnees) {
    this.modelesTeleverses = donnees;
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

    if (!modele.description || modele.description.trim() === '')
      erreurs.push('INTITULE_MANQUANT');

    if (!modele.categorie || modele.categorie.trim() === '')
      erreurs.push('CATEGORIE_MANQUANTE');

    return erreurs;
  }
}

module.exports = TeleversementModelesMesureSpecifique;
