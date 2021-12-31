const { ErreurNiveauGraviteInconnu } = require('../erreurs');
const Referentiel = require('../referentiel');

const valide = (idNiveau, referentiel) => {
  const identifiantsNiveauxGravite = referentiel.identifiantsNiveauxGravite();
  if (idNiveau && !identifiantsNiveauxGravite.includes(idNiveau)) {
    throw new ErreurNiveauGraviteInconnu(`Le niveau de gravité "${idNiveau}" n'est pas répertorié`);
  }
};

class NiveauGravite {
  constructor(idNiveau, referentiel = Referentiel.creeReferentielVide()) {
    valide(idNiveau, referentiel);

    const { position, description, important } = referentiel.niveauGravite(idNiveau);
    this.position = position;
    this.description = description;
    this.important = important;
  }

  descriptionNiveau() {
    return this.description || 'Non renseigné';
  }

  niveauImportant() {
    return !!this.important;
  }
}

module.exports = NiveauGravite;
