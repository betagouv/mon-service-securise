const Mesure = require('./mesure');
const { ErreurMesureInconnue } = require('../erreurs');

class MesureGenerale extends Mesure {
  constructor(donneesMesure, referentiel) {
    super({ proprietesAtomiquesRequises: ['id', 'statut', 'modalites'] });

    MesureGenerale.valide(donneesMesure, referentiel);
    this.renseigneProprietes(donneesMesure);

    this.referentiel = referentiel;
  }

  donneesReferentiel() {
    return this.referentiel.mesures()[this.id];
  }

  descriptionMesure() {
    return this.donneesReferentiel().description;
  }

  estIndispensable() {
    return !!this.donneesReferentiel().indispensable;
  }

  nonRetenue() {
    return this.statut === Mesure.STATUT_NON_RETENU;
  }

  static valide({ id, statut }, referentiel) {
    super.valide({ statut }, referentiel);

    const identifiantsMesuresRepertoriees = referentiel.identifiantsMesures();
    if (!identifiantsMesuresRepertoriees.includes(id)) {
      throw new ErreurMesureInconnue(`La mesure "${id}" n'est pas répertoriée`);
    }
  }
}

module.exports = MesureGenerale;
