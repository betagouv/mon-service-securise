const ElementsConstructibles = require('./elementsConstructibles');
const MesureGenerale = require('./mesureGenerale');

class MesuresGenerales extends ElementsConstructibles {
  constructor(donnees, referentiel) {
    const { mesuresGenerales } = donnees;
    super(MesureGenerale, { items: mesuresGenerales }, referentiel);
    this.referentiel = referentiel;
  }

  nonSaisies() {
    return this.nombre() === 0;
  }

  metsAJourMesure(mesure) {
    const index = this.items.findIndex((m) => m.id === mesure.id);
    if (index !== -1) {
      this.items[index] = mesure;
    } else {
      this.items.push(mesure);
    }
  }

  parStatutEtCategorie() {
    const rangeMesureParStatut = (acc, mesure) => {
      const mesureReference = this.referentiel.mesure(mesure.id);
      acc[mesure.statut][mesureReference.categorie] ||= [];
      acc[mesure.statut][mesureReference.categorie].push({
        description: mesure.descriptionMesure(),
        indispensable: mesure.estIndispensable(),
        modalites: mesure.modalites,
      });
      return acc;
    };

    const statutFaitALaFin = true;
    const accumulateur =
      MesureGenerale.accumulateurInitialStatuts(statutFaitALaFin);

    return this.toutes()
      .filter((mesure) => mesure.statutRenseigne())
      .sort((m, _) => (m.estIndispensable() ? -1 : 1))
      .reduce(rangeMesureParStatut, accumulateur);
  }

  statutSaisie() {
    if (this.nonSaisies()) return MesuresGenerales.A_SAISIR;
    if (
      this.items.every(
        (item) => item.statutSaisie() === MesuresGenerales.COMPLETES
      )
    ) {
      return MesuresGenerales.COMPLETES;
    }
    return MesuresGenerales.A_COMPLETER;
  }

  avecId(idMesure) {
    return this.toutes().find((m) => m.id === idMesure);
  }
}

module.exports = MesuresGenerales;
