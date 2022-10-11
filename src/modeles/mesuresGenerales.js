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
      indispensables: {
        total: 0,
        [MesureGenerale.STATUT_FAIT]: 0,
        [MesureGenerale.STATUT_EN_COURS]: 0,
      },
      recommandees: {
        total: 0,
        [MesureGenerale.STATUT_FAIT]: 0,
        [MesureGenerale.STATUT_EN_COURS]: 0,
      },

      misesEnOeuvre: 0,
      retenues: 0,
    });

    const stats = this.referentiel.identifiantsCategoriesMesures()
      .reduce((acc, categorie) => Object.assign(acc, { [categorie]: statsInitiales() }), {});

    this.items.forEach((mesure) => {
      const { id, statut } = mesure;
      const { categorie } = this.referentiel.mesure(id);

      if (statut === MesureGenerale.STATUT_FAIT) {
        stats[categorie].misesEnOeuvre += 1;
      }
      if (statut === MesureGenerale.STATUT_FAIT || statut === MesureGenerale.STATUT_EN_COURS) {
        stats[categorie].retenues += 1;
      }

      [MesureGenerale.STATUT_EN_COURS, MesureGenerale.STATUT_FAIT].forEach((statutReference) => {
        if (statut === statutReference) {
          if (mesure.estIndispensable()) {
            stats[categorie].indispensables[statut] += 1;
          } else {
            stats[categorie].recommandees[statut] += 1;
          }
        }
      });
    });

    identifiantsMesuresPersonnalisees
      .map((id) => new MesureGenerale({ id }, this.referentiel))
      .reduce((acc, mesure) => {
        const { categorie } = this.referentiel.mesure(mesure.id);
        if (mesure.estIndispensable()) acc[categorie].indispensables.total += 1;
        if (mesure.estRecommandee()) acc[categorie].recommandees.total += 1;
        return acc;
      }, stats);

    this.referentiel.identifiantsCategoriesMesures().forEach((categorie) => {
      stats[categorie].totalRecommandees = stats[categorie].recommandees.total;
      stats[categorie].indispensablesFaites = stats[categorie]
        .indispensables[MesureGenerale.STATUT_FAIT];
      stats[categorie].recommandeesFaites = stats[categorie]
        .recommandees[MesureGenerale.STATUT_FAIT];
    });
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
