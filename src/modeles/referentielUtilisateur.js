const { ErreurModeleMesureSpecifiqueIntrouvable } = require('../erreurs');

class ReferentielUtilisateur {
  constructor({ modelesMesuresSpecifiques }) {
    this.modelesMesuresSpecifiques = modelesMesuresSpecifiques;
  }

  toutesMesuresSpecifiques(donneesMesuresSpecifiques) {
    return donneesMesuresSpecifiques.map((mesureSpecifique) => {
      if (!mesureSpecifique.idModele) {
        return mesureSpecifique;
      }

      const modele = this.modelesMesuresSpecifiques[mesureSpecifique.idModele];
      if (!modele) {
        throw new ErreurModeleMesureSpecifiqueIntrouvable(
          mesureSpecifique.idModele
        );
      }

      return {
        ...mesureSpecifique,
        description: modele.description,
        categorie: modele.categorie,
      };
    });
  }
}

module.exports = ReferentielUtilisateur;
