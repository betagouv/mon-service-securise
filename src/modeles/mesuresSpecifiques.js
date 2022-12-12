const ElementsConstructibles = require('./elementsConstructibles');
const MesureSpecifique = require('./mesureSpecifique');
const Referentiel = require('../referentiel');

class MesuresSpecifiques extends ElementsConstructibles {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    const { mesuresSpecifiques } = donnees;
    super(MesureSpecifique, { items: mesuresSpecifiques }, referentiel);
  }

  parStatutEtCategorie(accumulateur = MesureSpecifique.accumulateurInitialStatuts(true)) {
    return this.toutes().reduce((acc, mesure) => {
      if (!mesure.statut || !mesure.categorie) return acc;
      acc[mesure.statut][mesure.categorie] ||= [];
      acc[mesure.statut][mesure.categorie].push({
        description: mesure.descriptionMesure(),
        modalites: mesure.modalites,
      });
      return acc;
    }, accumulateur);
  }
}

module.exports = MesuresSpecifiques;
