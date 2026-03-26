import {
  ErreurDateHomologationInvalide,
  ErreurDecisionInvalide,
  ErreurDureeValiditeInvalide,
} from '../../erreurs.js';
import {
  AdaptateurHorloge,
  fabriqueAdaptateurHorloge,
} from '../../adaptateurs/adaptateurHorloge.js';
import Etape from './etape.js';
import {
  ajouteMoisADate,
  dateEnFrancais,
  dateInvalide,
} from '../../utilitaires/date.js';
import { TousReferentiels } from '../../referentiel.interface.js';
import { creeReferentielVide } from '../../referentiel.js';

export type DonneesDecision = {
  dateHomologation?: string;
  dureeValidite?: string;
  refusee?: boolean;
};

export type DureeValidite = 'sixMois' | 'unAn' | 'deuxAns' | 'troisAns';

class Decision extends Etape {
  dateHomologation!: string;
  dureeValidite?: DureeValidite;
  refusee?: boolean;
  private readonly adaptateurHorloge: AdaptateurHorloge;
  private readonly referentiel!: TousReferentiels;

  constructor(
    { dateHomologation, dureeValidite, refusee }: Partial<DonneesDecision> = {},
    referentiel: TousReferentiels = creeReferentielVide(),
    adaptateurHorloge: AdaptateurHorloge = fabriqueAdaptateurHorloge()
  ) {
    super(
      {
        proprietesAtomiquesFacultatives: [
          'dateHomologation',
          'dureeValidite',
          'refusee',
        ],
      },
      referentiel
    );
    this.referentiel = referentiel;
    Decision.valide({ dateHomologation, dureeValidite, refusee }, referentiel);
    this.renseigneProprietes({ dateHomologation, dureeValidite, refusee });
    this.adaptateurHorloge = adaptateurHorloge;
  }

  descriptionDateHomologation() {
    if (!this.dateHomologation) {
      return '';
    }

    return dateEnFrancais(this.dateHomologation);
  }

  descriptionDureeValidite() {
    if (this.refusee || !this.dureeValidite) {
      return '';
    }

    return this.referentiel.descriptionEcheanceRenouvellement(
      this.dureeValidite
    );
  }

  dateProchaineHomologation() {
    const date = new Date(this.dateHomologation);
    if (this.refusee && this.dateHomologation) {
      return date;
    }
    const nbMois = this.referentiel.nbMoisDecalage(this.dureeValidite!);

    return ajouteMoisADate(nbMois, date);
  }

  descriptionProchaineDateHomologation() {
    if (this.refusee && this.dateHomologation) {
      return this.descriptionDateHomologation();
    }

    if (!this.dateHomologation || !this.dureeValidite) {
      return '';
    }

    return dateEnFrancais(this.dateProchaineHomologation());
  }

  enregistreDecisionValidee(
    dateHomologation: string,
    dureeValidite: DureeValidite
  ) {
    this.dateHomologation = dateHomologation;
    this.dureeValidite = dureeValidite;
    this.refusee = undefined;
  }

  enregistreDecisionRefusee(dateHomologation: string) {
    this.dateHomologation = dateHomologation;
    this.refusee = true;
    this.dureeValidite = undefined;
  }

  estComplete() {
    return !!this.dateHomologation && (this.refusee || !!this.dureeValidite);
  }

  periodeHomologationEstEnCours() {
    const maintenant = this.adaptateurHorloge.maintenant();
    return (
      new Date(this.dateHomologation) <= maintenant &&
      maintenant <= this.dateProchaineHomologation()
    );
  }

  static valide(
    { dateHomologation, dureeValidite, refusee }: Partial<DonneesDecision>,
    referentiel: TousReferentiels
  ) {
    if (refusee && dureeValidite) {
      throw new ErreurDecisionInvalide(
        'Un dossier refusé ne peut pas avoir de durée de validité.'
      );
    }

    const identifiantsDureesHomologation =
      referentiel.identifiantsEcheancesRenouvellement();
    if (
      dureeValidite &&
      !identifiantsDureesHomologation.includes(dureeValidite)
    ) {
      throw new ErreurDureeValiditeInvalide(
        `La durée de validité "${dureeValidite}" est invalide`
      );
    }

    if (dateHomologation && dateInvalide(dateHomologation)) {
      throw new ErreurDateHomologationInvalide(
        `La date "${dateHomologation}" est invalide`
      );
    }
  }
}

export default Decision;
