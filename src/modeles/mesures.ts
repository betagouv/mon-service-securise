import InformationsService from './informationsService.js';
import MesuresGenerales from './mesuresGenerales.js';
import MesuresSpecifiques, {
  ModelesDisponiblesMesureSpecifique,
} from './mesuresSpecifiques.js';
import { creeReferentielVide } from '../referentiel.js';
import { TousReferentiels } from '../referentiel.interface.js';
import {
  MesurePersonnalisee,
  StatistiquesMesures,
} from './statistiquesMesures.js';
import { IndiceCyber } from './indiceCyber.js';
import { CompletudeMesures } from './completudeMesures.js';
import { DonneesMesureGenerale } from './mesureGenerale.type.js';
import { DonneesMesureSpecifique } from './mesureSpecifique.js';
import { IdMesureV1 } from '../../donneesConversionReferentielMesures.js';
import { IdMesureV2 } from '../../donneesReferentielMesuresV2.js';
import { DonneesIndiceCyber } from './indiceCyber.type.js';
import { UUID } from '../typesBasiques.js';

type IdMesure = IdMesureV1 | IdMesureV2;

export type DonneesMesures = {
  mesuresGenerales: Array<Partial<DonneesMesureGenerale<IdMesure>>>;
  mesuresSpecifiques: DonneesMesureSpecifique[];
};

export type MesuresPersonnalisees = Record<string, MesurePersonnalisee>;

class Mesures extends InformationsService {
  mesuresGenerales: MesuresGenerales<IdMesure>;
  readonly mesuresSpecifiques: MesuresSpecifiques;
  readonly mesuresPersonnalisees: MesuresPersonnalisees;
  private readonly referentiel: TousReferentiels;

  constructor(
    donnees: Partial<DonneesMesures> = {},
    referentiel: TousReferentiels = creeReferentielVide(),
    mesuresPersonnalisees: MesuresPersonnalisees = {},
    modelesDisponiblesDeMesureSpecifique: ModelesDisponiblesMesureSpecifique = {}
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

  private idsMesuresPersonnalisees() {
    return Object.keys(this.mesuresPersonnalisees) as IdMesure[];
  }

  private mesuresGeneralesApplicables() {
    const donneesMesuresGeneralesApplicables =
      this.idsMesuresPersonnalisees().map((id) => {
        const generale = this.mesuresGenerales.avecId(id);
        return {
          id,
          ...generale?.donneesSerialisees(),
          rendueIndispensable: generale?.rendueIndispensable,
        };
      });
    return new MesuresGenerales(
      { mesuresGenerales: donneesMesuresGeneralesApplicables },
      this.referentiel
    );
  }

  completude() {
    return new CompletudeMesures({
      statistiquesMesuresGenerales: this.statistiquesMesuresGenerales(),
      mesuresSpecifiques: this.mesuresSpecifiques,
    });
  }

  tauxCompletudeMesures(): number {
    const { nombreTotalMesures, nombreMesuresCompletes } = this.completude();

    return nombreMesuresCompletes / nombreTotalMesures;
  }

  indiceCyber(): DonneesIndiceCyber {
    return new IndiceCyber(
      this.statistiquesMesuresGenerales().totauxParTypeEtParCategorie(),
      this.referentiel
    ).indiceCyber();
  }

  indiceCyberPersonnalise(): DonneesIndiceCyber {
    const statistiquesSansLesNonPrisesEnCompte =
      this.statistiquesMesuresGeneralesEtSpecifiques(true);

    return new IndiceCyber(
      statistiquesSansLesNonPrisesEnCompte.totauxParTypeEtParCategorie(),
      this.referentiel
    ).indiceCyber();
  }

  nombreMesuresPersonnalisees(): number {
    return this.idsMesuresPersonnalisees().length;
  }

  nombreMesuresSpecifiques(): number {
    return this.mesuresSpecifiques.nombre();
  }

  nombreTotalMesuresGenerales(): number {
    return this.nombreMesuresPersonnalisees();
  }

  nombreTotalNonFait(): number {
    const statistiquesAvecNonFait =
      this.statistiquesMesuresGeneralesEtSpecifiques(false);
    return (
      statistiquesAvecNonFait.indispensables().nonFait +
      statistiquesAvecNonFait.recommandees().nonFait
    );
  }

  parStatutEtCategorie() {
    const mesuresGeneralesParStatut =
      this.mesuresGeneralesApplicables().parStatutEtCategorie();
    return this.mesuresSpecifiques.parStatutEtCategorie(
      mesuresGeneralesParStatut
    );
  }

  statutSaisie() {
    const generalesSontCompletes =
      this.mesuresGeneralesApplicables().statutSaisie() === Mesures.COMPLETES;
    const specifiquesCompletes =
      this.mesuresSpecifiques.statutSaisie() === Mesures.COMPLETES ||
      this.mesuresSpecifiques.nombre() === 0;

    return generalesSontCompletes && specifiquesCompletes
      ? Mesures.COMPLETES
      : Mesures.A_COMPLETER;
  }

  enrichiesAvecDonneesPersonnalisees() {
    const mesuresEnrichies = Object.fromEntries(
      this.idsMesuresPersonnalisees().map((id) => {
        const donneesGenerale: Partial<DonneesMesureGenerale<IdMesure>> = {
          ...this.mesuresGenerales.avecId(id)?.toJSON(),
        };
        delete donneesGenerale.id;

        const idV2 = id as IdMesureV2;
        const porteursSinguliers =
          this.referentiel.porteursSinguliersDeMesure(idV2);
        const thematique = this.referentiel.thematiqueDeMesure(idV2);
        const mesuresReferentielsExternes =
          this.referentiel.referentielsExternesDeMesure(idV2);

        return [
          id,
          {
            ...this.mesuresPersonnalisees[id],
            ...donneesGenerale,
            ...(porteursSinguliers && { porteursSinguliers }),
            ...(thematique && { thematique }),
            ...(mesuresReferentielsExternes && { mesuresReferentielsExternes }),
          },
        ];
      })
    );

    return {
      mesuresGenerales: mesuresEnrichies,
      mesuresSpecifiques: this.mesuresSpecifiques.toJSON(),
    };
  }

  personnaliseesAvecStatutSeul() {
    return Object.fromEntries(
      this.idsMesuresPersonnalisees().map((id) => {
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

  statistiquesMesuresGeneralesEtSpecifiques(
    exclueMesuresNonPrisesEnCompte: boolean
  ) {
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

  supprimeResponsable(idUtilisateur: UUID) {
    this.mesuresGenerales.supprimeResponsable(idUtilisateur);
    this.mesuresSpecifiques.supprimeResponsable(idUtilisateur);
  }
}

export default Mesures;
