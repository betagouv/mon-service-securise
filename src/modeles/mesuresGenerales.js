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
    const fait = (statut) => statut === MesureGenerale.STATUT_FAIT;
    const nonFait = (statut) => statut === MesureGenerale.STATUT_NON_FAIT;
    const enCours = (statut) => statut === MesureGenerale.STATUT_EN_COURS;

    const statsInitiales = () => ({
      indispensablesFaites: 0,
      indispensablesNonFaites: 0,
      indispensablesEnCours: 0,
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

      stats[categorie].misesEnOeuvre += fait(statut) ? 1 : 0;
      stats[categorie].retenues += (fait(statut) || enCours(statut)) ? 1 : 0;

      stats[categorie].indispensablesFaites += (fait(statut) && mesure.estIndispensable()) ? 1 : 0;
      stats[categorie].indispensablesEnCours += (enCours(statut) && mesure.estIndispensable())
        ? 1
        : 0;
      stats[categorie].indispensablesNonFaites += (nonFait(statut) && mesure.estIndispensable())
        ? 1
        : 0;

      stats[categorie].recommandeesFaites += (fait(statut) && mesure.estRecommandee()) ? 1 : 0;
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
