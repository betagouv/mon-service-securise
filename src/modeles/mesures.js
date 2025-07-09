const InformationsService = require('./informationsService');
const MesuresGenerales = require('./mesuresGenerales');
const MesuresSpecifiques = require('./mesuresSpecifiques');
const Referentiel = require('../referentiel');
const { StatistiquesMesures } = require('./statistiquesMesures');
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
      },
    });
    this.renseigneProprietes(donnees, referentiel);
    this.referentiel = referentiel;
    this.mesuresPersonnalisees = mesuresPersonnalisees;

    this.mesuresSpecifiques = new MesuresSpecifiques(
      { mesuresSpecifiques: donnees.mesuresSpecifiques || [] },
      referentiel
    );
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

  indiceCyberPersonnalise() {
    const statistiquesSansLesNonPrisesEnCompte =
      this.statistiquesMesuresGeneralesEtSpecifiques(true);

    return new IndiceCyber(
      statistiquesSansLesNonPrisesEnCompte.totauxParTypeEtParCategorie(),
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

  nombreTotalNonFait() {
    const statistiquesAvecNonFait = new StatistiquesMesures(
      {
        mesuresGenerales: this.mesuresGenerales,
        mesuresPersonnalisees: this.mesuresPersonnalisees,
        mesuresSpecifiques: this.mesuresSpecifiques.items,
      },
      this.referentiel,
      false
    );
    return (
      statistiquesAvecNonFait.indispensables().nonFait +
      statistiquesAvecNonFait.recommandees().nonFait
    );
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
    return new StatistiquesMesures(
      {
        mesuresGenerales: this.mesuresGenerales,
        mesuresPersonnalisees: this.mesuresPersonnalisees,
      },
      this.referentiel,
      false
    );
  }

  statistiquesMesuresGeneralesEtSpecifiques(exclueMesuresNonPrisesEnCompte) {
    return new StatistiquesMesures(
      {
        mesuresGenerales: this.mesuresGenerales,
        mesuresPersonnalisees: this.mesuresPersonnalisees,
        mesuresSpecifiques: this.mesuresSpecifiques.items,
      },
      this.referentiel,
      exclueMesuresNonPrisesEnCompte
    );
  }

  supprimeResponsable(idUtilisateur) {
    this.mesuresGenerales.supprimeResponsable(idUtilisateur);
    this.mesuresSpecifiques.supprimeResponsable(idUtilisateur);
  }
}

module.exports = Mesures;
