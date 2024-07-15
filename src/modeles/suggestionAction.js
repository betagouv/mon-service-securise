class SuggestionAction {
  constructor(donnees, referentiel) {
    const { nature, idService } = donnees;

    this.nature = nature;

    this.lien = referentiel
      .natureSuggestionAction(nature)
      .lien.replace('%ID_SERVICE%', idService);
  }
}

module.exports = SuggestionAction;
