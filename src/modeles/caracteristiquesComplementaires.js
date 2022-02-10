const EntitesExternes = require('./entitesExternes');
const InformationsHomologation = require('./informationsHomologation');
const Referentiel = require('../referentiel');

class CaracteristiquesComplementaires extends InformationsHomologation {
  constructor(donneesCaracteristiques = {}, referentiel = Referentiel.creeReferentielVide()) {
    super({
      proprietesAtomiquesRequises: ['structureDeveloppement'],
      proprietesAtomiquesFacultatives: ['hebergeur'],
      listesAgregats: { entitesExternes: EntitesExternes },
    });
    this.renseigneProprietes(donneesCaracteristiques);

    this.referentiel = referentiel;
  }

  descriptionHebergeur() {
    return this.hebergeur || 'Hébergeur non renseigné';
  }

  nombreEntitesExternes() {
    return this.entitesExternes.nombre();
  }
}

module.exports = CaracteristiquesComplementaires;
