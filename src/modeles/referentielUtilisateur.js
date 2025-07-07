class ReferentielUtilisateur {
  constructor({ modelesMesuresSpecifiques }) {
    this.modelesMesuresSpecifiques = modelesMesuresSpecifiques;
  }

  toutesMesuresSpecifiques(mesuresSpecifiques) {
    return mesuresSpecifiques.map((mesureSpecifique) => ({
      ...mesureSpecifique,
      ...(mesureSpecifique.idModele && {
        description:
          this.modelesMesuresSpecifiques[mesureSpecifique.idModele].description,
        categorie:
          this.modelesMesuresSpecifiques[mesureSpecifique.idModele].categorie,
      }),
    }));
  }
}

module.exports = ReferentielUtilisateur;
