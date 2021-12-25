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
        'presentation', 'structureDeveloppement', 'hebergeur', 'localisationDonnees',
      ],
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

  statutSaisie() {
    const statutSaisieBase = super.statutSaisie();
    const statutSaisieEntitesExternes = this.entitesExternes?.statutSaisie?.();

    switch (statutSaisieEntitesExternes) {
      case InformationsHomologation.A_COMPLETER:
        return InformationsHomologation.A_COMPLETER;
      case InformationsHomologation.COMPLETES:
        return statutSaisieBase === InformationsHomologation.COMPLETES
          ? InformationsHomologation.COMPLETES
          : InformationsHomologation.A_COMPLETER;
      default:
        return statutSaisieBase;
    }
  }
}

module.exports = CaracteristiquesComplementaires;
