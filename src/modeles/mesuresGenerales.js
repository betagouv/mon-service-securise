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

  statistiques(identifiantsMesuresPersonnalisees) {
    const statsInitiales = () => ({
      indispensablesFaites: 0,
      misesEnOeuvre: 0,
      recommandeesFaites: 0,
      retenues: 0,
      totalIndispensables: 0,
      totalRecommandees: 0,
    });

    const stats = this.referentiel.identifiantsCategoriesMesures()
      .reduce((acc, categorie) => Object.assign(acc, { [categorie]: statsInitiales() }), {});

    this.items.forEach((mesure) => {
      const { id, statut } = mesure;
      const { categorie } = this.referentiel.mesure(id);

      if (statut === MesureGenerale.STATUT_FAIT || statut === MesureGenerale.STATUT_PLANIFIE) {
        stats[categorie].retenues += 1;

        if (statut === MesureGenerale.STATUT_FAIT) {
          stats[categorie].misesEnOeuvre += 1;

          if (mesure.estIndispensable()) stats[categorie].indispensablesFaites += 1;
          if (mesure.estRecommandee()) stats[categorie].recommandeesFaites += 1;
        }
      }
    });

    identifiantsMesuresPersonnalisees
      .map((id) => new MesureGenerale({ id }, this.referentiel))
      .reduce((acc, mesure) => {
        const { categorie } = this.referentiel.mesure(mesure.id);
        if (mesure.estIndispensable()) acc[categorie].totalIndispensables += 1;
        if (mesure.estRecommandee()) acc[categorie].totalRecommandees += 1;
        return acc;
      }, stats);

    return new StatistiquesMesures(stats, this.referentiel);
  }

  statutSaisie() {
    if (this.nonSaisies()) return MesuresGenerales.A_SAISIR;
    if (this.items.every((item) => item.statutSaisie() === MesuresGenerales.COMPLETES)) {
      return MesuresGenerales.COMPLETES;
    }
    return MesuresGenerales.A_COMPLETER;
  }
}

module.exports = MesuresGenerales;
