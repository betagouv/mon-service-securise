const InformationsService = require('./informationsService');
const MesuresGenerales = require('./mesuresGenerales');
const MesuresSpecifiques = require('./mesuresSpecifiques');
const Referentiel = require('../referentiel');
const {
  StatistiquesMesuresGenerales,
} = require('./statistiquesMesuresGenerales');
const { IndiceCyber } = require('./indiceCyber');
const { CompletudeMesures } = require('./completudeMesures');

function mesuresGeneralesApplicables(
  mesuresPersonnalisees,
  mesuresGenerales,
  referentiel
) {
  const idMesuresPersonnalisees = Object.keys(mesuresPersonnalisees);
  const donneesMesuresGeneralesApplicables = idMesuresPersonnalisees.map(
    (id) => ({ id, ...mesuresGenerales.avecId(id) })
  );
  return new MesuresGenerales(
    { mesuresGenerales: donneesMesuresGeneralesApplicables },
    referentiel
  );
}

class Mesures extends InformationsService {
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

  completude() {
    return new CompletudeMesures({
      statistiquesMesuresGenerales: this.statistiquesMesuresGenerales(),
      mesuresSpecifiques: this.mesuresSpecifiques,
    });
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

  metsAJourMesuresSpecifiques(mesures) {
    this.mesuresSpecifiques = mesures;
  }

  parStatutEtCategorie() {
    const applicables = mesuresGeneralesApplicables(
      this.mesuresPersonnalisees,
      this.mesuresGenerales,
      this.referentiel
    );

    const mesuresGeneralesParStatut = applicables.parStatutEtCategorie();
    return this.mesuresSpecifiques.parStatutEtCategorie(
      mesuresGeneralesParStatut
    );
  }

  statutSaisie() {
    const applicables = mesuresGeneralesApplicables(
      this.mesuresPersonnalisees,
      this.mesuresGenerales,
      this.referentiel
    );

    const generalesSontCompletes =
      applicables.statutSaisie() === Mesures.COMPLETES;
    const specifiquesCompletes =
      this.mesuresSpecifiques.statutSaisie() === Mesures.COMPLETES ||
      this.mesuresSpecifiques.nombre() === 0;

    return generalesSontCompletes && specifiquesCompletes
      ? Mesures.COMPLETES
      : Mesures.A_COMPLETER;
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
