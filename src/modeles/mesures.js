const InformationsHomologation = require('./informationsGenerales');
const Mesure = require('./mesure');
const StatistiquesMesures = require('./statistiquesMesures');

class Mesures {
  constructor(donnees, referentiel) {
    const { mesures } = donnees;
    this.mesures = mesures.map((donneesMesure) => new Mesure(donneesMesure, referentiel));
    this.referentiel = referentiel;
  }

  mesure(index) {
    return this.mesures[index];
  }

  nbIndispensablesMisesEnOeuvre() {
    return this.mesures.filter((m) => m.miseEnOeuvre() && m.estIndispensable()).length;
  }

  nbRecommandeesMisesEnOeuvre() {
    return this.mesures.filter((m) => m.miseEnOeuvre() && m.estRecommandee()).length;
  }

  nombre() {
    return this.mesures.length;
  }

  nonSaisies() {
    return this.nombre() === 0;
  }

  proportion(nbMisesEnOeuvre, idsMesures) {
    const identifiantsMesuresNonRetenues = () => this.mesures
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

  proportionIndispensablesMisesEnOeuvre() {
    return this.proportion(
      this.nbIndispensablesMisesEnOeuvre(),
      this.referentiel.identifiantsMesuresIndispensables()
    );
  }

  proportionRecommandeesMisesEnOeuvre() {
    return this.proportion(
      this.nbRecommandeesMisesEnOeuvre(),
      this.referentiel.identifiantsMesuresRecommandees()
    );
  }

  statistiques() {
    const stats = {};

    this.mesures.forEach(({ id, statut }) => {
      const { categorie } = this.referentiel.mesures()[id];

      if (statut === Mesure.STATUT_FAIT || statut === Mesure.STATUT_PLANIFIE) {
        stats[categorie] ||= { retenues: 0, misesEnOeuvre: 0 };
        stats[categorie].retenues += 1;

        if (statut === Mesure.STATUT_FAIT) {
          stats[categorie].misesEnOeuvre += 1;
        }
      }
    });

    return new StatistiquesMesures(stats, this.referentiel);
  }

  statutSaisie() {
    if (this.nonSaisies()) return InformationsHomologation.A_SAISIR;
    if (this.mesures.length === this.referentiel.identifiantsMesures().length) {
      return InformationsHomologation.COMPLETES;
    }
    return InformationsHomologation.A_COMPLETER;
  }

  toJSON() {
    return this.mesures.map((m) => m.toJSON());
  }
}

module.exports = Mesures;
