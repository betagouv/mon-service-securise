class SuggestionAction {
  constructor(donnees, referentiel) {
    this.nature = donnees.nature;
    this.lien = referentiel.natureSuggestionAction(donnees.nature).lien;
  }
}

module.exports = SuggestionAction;
