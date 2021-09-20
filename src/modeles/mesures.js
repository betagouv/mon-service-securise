const ListeItems = require('./listeItems');
const Mesure = require('./mesure');
const StatistiquesMesures = require('./statistiquesMesures');

class Mesures extends ListeItems {
  constructor(donnees, referentiel) {
    super(Mesure, { items: donnees.mesures }, referentiel);
    this.referentiel = referentiel;
  }

  nbIndispensablesMisesEnOeuvre() {
    return this.items.filter((m) => m.miseEnOeuvre() && m.estIndispensable()).length;
  }

  nbRecommandeesMisesEnOeuvre() {
    return this.items.filter((m) => m.miseEnOeuvre() && m.estRecommandee()).length;
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

    this.items.forEach(({ id, statut }) => {
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
    if (this.nonSaisies()) return Mesures.A_SAISIR;
    if (this.items.length === this.referentiel.identifiantsMesures().length) {
      return Mesures.COMPLETES;
    }
    return Mesures.A_COMPLETER;
  }
}

module.exports = Mesures;
