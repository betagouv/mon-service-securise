const InformationsHomologation = require('./informationsHomologation');
const MesuresGenerales = require('./mesuresGenerales');
const MesuresSpecifiques = require('./mesuresSpecifiques');
const Referentiel = require('../referentiel');
const {
  StatistiquesMesuresGenerales,
} = require('./statistiquesMesuresGenerales');
const { IndiceCyber } = require('./indiceCyber');

class Mesures extends InformationsHomologation {
  constructor(
    donnees = {},
    referentiel = Referentiel.creeReferentielVide(),
    mesuresPersonnalisees = {}
  ) {
    super({
      listesAgregats: {
        mesuresGenerales: MesuresGenerales,
        mesuresSpecifiques: MesuresSpecifiques,
      },
    });
    this.renseigneProprietes(donnees, referentiel);
    this.referentiel = referentiel;
    this.mesuresPersonnalisees = mesuresPersonnalisees;
  }

  indiceCyber() {
    return new IndiceCyber(
      this.statistiquesMesuresGenerales().totauxParTypeEtParCategorie(),
      this.referentiel
    ).indiceCyber();
  }

  nombreMesuresPersonnalisees() {
    return Object.keys(this.mesuresPersonnalisees).length;
  }

  nombreMesuresSpecifiques() {
    return this.mesuresSpecifiques.nombre();
  }

  nombreTotalMesuresGenerales() {
    return this.nombreMesuresPersonnalisees();
  }

  parStatutEtCategorie() {
    const mesuresGeneralesParStatut =
      this.mesuresGenerales.parStatutEtCategorie();
    return this.mesuresSpecifiques.parStatutEtCategorie(
      mesuresGeneralesParStatut
    );
  }

  statistiques() {
    return this.mesuresGenerales.statistiques(
      this.mesuresPersonnalisees,
      this.mesuresSpecifiques
    );
  }

  statutSaisie() {
    const statutSaisieMesures = super.statutSaisie();
    if (
      statutSaisieMesures === Mesures.COMPLETES &&
      this.nombreMesuresPersonnalisees() !== this.mesuresGenerales.nombre()
    ) {
      return Mesures.A_COMPLETER;
    }

    return statutSaisieMesures;
  }

  statutsMesuresPersonnalisees() {
    const personnalisees = ({ id: idMesure }) =>
      Object.keys(this.mesuresPersonnalisees).includes(idMesure);

    return this.mesuresGenerales
      .toutes()
      .filter(personnalisees)
      .filter((m) => m.statut !== '')
      .map((m) => ({ idMesure: m.id, statut: m.statut }));
  }

  enrichiesAvecDonneesPersonnalisees() {
    const mesuresEnrichies = Object.entries(this.mesuresPersonnalisees).reduce(
      (acc, mesurePersonnalisee) => {
        const [id, donnees] = mesurePersonnalisee;
        let generale = this.mesuresGenerales.avecId(id);
        if (generale) {
          generale = generale.toJSON();
          delete generale.id;
        }

        return {
          ...acc,
          [id]: { ...donnees, ...(generale && { ...generale }) },
        };
      },
      {}
    );

    return {
      mesuresGenerales: mesuresEnrichies,
      mesuresSpecifiques: this.mesuresSpecifiques.toJSON(),
    };
  }

  statistiquesMesuresGenerales() {
    return new StatistiquesMesuresGenerales(
      {
        mesuresGenerales: this.mesuresGenerales,
        mesuresPersonnalisees: this.mesuresPersonnalisees,
      },
      this.referentiel
    );
  }
}

module.exports = Mesures;
