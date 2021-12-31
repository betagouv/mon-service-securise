const EntitesExternes = require('./entitesExternes');
const InformationsHomologation = require('./informationsHomologation');
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

class CaracteristiquesComplementaires extends InformationsHomologation {
  constructor(donneesCaracteristiques = {}, referentiel = Referentiel.creeReferentielVide()) {
    super({
      proprietesAtomiquesRequises: [
        'structureDeveloppement', 'hebergeur', 'localisationDonnees',
      ],
      proprietesAtomiquesFacultatives: ['presentation'],
      listesAgregats: { entitesExternes: EntitesExternes },
    });
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

  nombreEntitesExternes() {
    return this.entitesExternes.nombre();
  }
}

module.exports = CaracteristiquesComplementaires;
