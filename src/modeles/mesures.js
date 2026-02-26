import InformationsService from './informationsService.js';
import MesuresGenerales from './mesuresGenerales.js';
import MesuresSpecifiques from './mesuresSpecifiques.js';
import * as Referentiel from '../referentiel.js';
import { StatistiquesMesures } from './statistiquesMesures.js';
import { IndiceCyber } from './indiceCyber.js';
import { CompletudeMesures } from './completudeMesures.js';

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
    mesuresPersonnalisees = {},
    modelesDisponiblesDeMesureSpecifique = {}
  ) {
    super();

    this.mesuresGenerales = new MesuresGenerales(
      { mesuresGenerales: donnees.mesuresGenerales || [] },
      referentiel
    );

    this.mesuresSpecifiques = new MesuresSpecifiques(
      { mesuresSpecifiques: donnees.mesuresSpecifiques || [] },
      referentiel,
      modelesDisponiblesDeMesureSpecifique
    );

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

        const porteursSinguliers =
          this.referentiel.porteursSinguliersDeMesure(id);
        const thematique = this.referentiel.thematiqueDeMesure(id);

        return {
          ...acc,
          [id]: {
            ...donnees,
            ...(generale && { ...generale }),
            ...(porteursSinguliers && { porteursSinguliers }),
            ...(thematique && { thematique }),
          },
        };
      },
      {}
    );

    return {
      mesuresGenerales: mesuresEnrichies,
      mesuresSpecifiques: this.mesuresSpecifiques.toJSON(),
    };
  }

  personnaliseesAvecStatutSeul() {
    return Object.fromEntries(
      Object.keys(this.mesuresPersonnalisees).map((id) => {
        const statut = this.mesuresGenerales.avecId(id)?.statut;
        return [id, { statut }];
      })
    );
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

export default Mesures;
