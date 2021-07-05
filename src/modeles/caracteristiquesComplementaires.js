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

class CaracteristiquesComplementaires {
  constructor(donneesCaracteristiques = {}, referentiel = Referentiel.creeReferentielVide()) {
    valide(donneesCaracteristiques, referentiel);
    const {
      presentation,
      structureDeveloppement,
      hebergeur,
      localisationDonnees,
    } = donneesCaracteristiques;

    this.presentation = presentation;
    this.structureDeveloppement = structureDeveloppement;
    this.hebergeur = hebergeur;
    this.localisationDonnees = localisationDonnees;

    this.referentiel = referentiel;
  }

  descriptionLocalisationDonnees() {
    return this.referentiel.localisationDonnees(this.localisationDonnees);
  }

  descriptionHebergeur() {
    return this.hebergeur || 'Hébergeur non renseigné';
  }

  toJSON() {
    const resultat = {};
    ['presentation', 'structureDeveloppement', 'hebergeur', 'localisationDonnees']
      .filter((k) => this[k])
      .forEach((k) => (resultat[k] = this[k]));

    return resultat;
  }
}

module.exports = CaracteristiquesComplementaires;
