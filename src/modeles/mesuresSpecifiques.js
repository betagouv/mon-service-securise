const ElementsConstructibles = require('./elementsConstructibles');
const MesureSpecifique = require('./mesureSpecifique');
const Referentiel = require('../referentiel');

class MesuresSpecifiques extends ElementsConstructibles {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    const { mesuresSpecifiques } = donnees;
    super(MesureSpecifique, { items: mesuresSpecifiques }, referentiel);
  }

  parStatut(accumulateur = { fait: {}, enCours: {}, nonFait: {} }) {
    return this.toutes().reduce((acc, mesure) => {
      acc[mesure.statut][mesure.categorie] ||= [];
      acc[mesure.statut][mesure.categorie].push({
        description: mesure.descriptionMesure(),
      });
      return acc;
    }, accumulateur);
  }
}

module.exports = MesuresSpecifiques;
