class SuggestionAction {
  constructor(donnees, referentiel) {
    const { nature } = donnees;

    this.nature = nature;

    const natureDansReferentiel = referentiel.natureSuggestionAction(nature);

    this.lien = natureDansReferentiel.lien;
    this.priorite = natureDansReferentiel.priorite;
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

export default SuggestionAction;
