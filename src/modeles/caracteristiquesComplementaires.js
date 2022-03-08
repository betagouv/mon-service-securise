const EntitesExternes = require('./entitesExternes');
const InformationsHomologation = require('./informationsHomologation');
const Referentiel = require('../referentiel');

class CaracteristiquesComplementaires extends InformationsHomologation {
  constructor(donneesCaracteristiques = {}, referentiel = Referentiel.creeReferentielVide()) {
    super({ listesAgregats: { entitesExternes: EntitesExternes } });
    this.renseigneProprietes(donneesCaracteristiques);

    this.referentiel = referentiel;
  }

  nombreEntitesExternes() {
    return this.entitesExternes.nombre();
  }
}

module.exports = CaracteristiquesComplementaires;
