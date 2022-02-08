const ElementsConstructibles = require('./elementsConstructibles');
const MesureGenerale = require('./mesureGenerale');
const StatistiquesMesures = require('./statistiquesMesures');

class MesuresGenerales extends ElementsConstructibles {
  constructor(donnees, referentiel) {
    const { mesuresGenerales } = donnees;
    super(MesureGenerale, { items: mesuresGenerales }, referentiel);
  }

  nonSaisies() {
    return this.nombre() === 0;
  }

  proportion(nbMisesEnOeuvre, idsMesures) {
    const identifiantsMesuresNonRetenues = () => this.items
      .filter((m) => m.nonRetenue())
      .map((m) => m.id);

    const nbTotalMesuresRetenuesParmi = (identifiantsMesures) => {
      const nonRetenues = identifiantsMesuresNonRetenues();

      return identifiantsMesures
        .filter((id) => !nonRetenues.includes(id))
        .length;
    };

    const nbTotal = nbTotalMesuresRetenuesParmi(idsMesures);
    return nbTotal ? nbMisesEnOeuvre / nbTotal : 1;
  }

  statistiques() {
    const stats = {};

    this.items.forEach(({ id, statut }) => {
      const { categorie } = this.referentiel.mesures()[id];

      if (statut === MesureGenerale.STATUT_FAIT || statut === MesureGenerale.STATUT_PLANIFIE) {
        stats[categorie] ||= { retenues: 0, misesEnOeuvre: 0 };
        stats[categorie].retenues += 1;

        if (statut === MesureGenerale.STATUT_FAIT) {
          stats[categorie].misesEnOeuvre += 1;
        }
      }
    });

    return new StatistiquesMesures(stats, this.referentiel);
  }

  statutSaisie() {
    if (this.nonSaisies()) return MesuresGenerales.A_SAISIR;
    if (this.items.length === this.referentiel.identifiantsMesures().length) {
      return MesuresGenerales.COMPLETES;
    }
    return MesuresGenerales.A_COMPLETER;
  }
}

module.exports = MesuresGenerales;
