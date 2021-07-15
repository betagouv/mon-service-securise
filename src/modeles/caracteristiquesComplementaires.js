const Base = require('./base');
const { ErreurLocalisationDonneesInvalide } = require('../erreurs');
const Referentiel = require('../referentiel');

const valide = (donnees, referentiel) => {
  const { localisationDonnees } = donnees;

  if (localisationDonnees
    && !referentiel.identifiantsLocalisationsDonnees().includes(localisationDonnees)) {
    throw new ErreurLocalisationDonneesInvalide(
      `La localisation des données "${localisationDonnees}" est invalide`
    );
  }
};

class CaracteristiquesComplementaires extends Base {
  constructor(donneesCaracteristiques = {}, referentiel = Referentiel.creeReferentielVide()) {
    super(['presentation', 'structureDeveloppement', 'hebergeur', 'localisationDonnees']);

    valide(donneesCaracteristiques, referentiel);

    this.renseigneProprietes(donneesCaracteristiques);
    this.referentiel = referentiel;
  }

  descriptionLocalisationDonnees() {
    return this.referentiel.localisationDonnees(this.localisationDonnees);
  }

  descriptionHebergeur() {
    return this.hebergeur || 'Hébergeur non renseigné';
  }
}

module.exports = CaracteristiquesComplementaires;
