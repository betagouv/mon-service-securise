class SuggestionAction {
  constructor(donnees, referentiel) {
    const { nature, idService } = donnees;

    this.nature = nature;

    const natureDansReferentiel = referentiel.natureSuggestionAction(nature);

    this.lien = natureDansReferentiel.lien.replace('%ID_SERVICE%', idService);
    this.permissionRequise = natureDansReferentiel.permissionRequise;
  }

  route() {
    return {
      rubrique: this.permissionRequise.rubrique,
      niveau: this.permissionRequise.niveau,
      route: this.lien,
    };
  }
}

module.exports = SuggestionAction;
