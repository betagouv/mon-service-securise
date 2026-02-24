import {
  ErreurDateHomologationInvalide,
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
import { Referentiel } from '../../referentiel.interface.js';
import { creeReferentielVide } from '../../referentiel.js';

export type DonneesDecision = {
  dateHomologation?: string;
  dureeValidite?: string;
};

export type DureeValidite = 'sixMois' | 'unAn' | 'deuxAns' | 'troisAns';

class Decision extends Etape {
  dateHomologation!: string;
  dureeValidite!: DureeValidite;
  private readonly adaptateurHorloge: AdaptateurHorloge;
  private readonly referentiel!: Referentiel;

  constructor(
    { dateHomologation, dureeValidite }: Partial<DonneesDecision> = {},
    referentiel: Referentiel = creeReferentielVide(),
    adaptateurHorloge: AdaptateurHorloge = fabriqueAdaptateurHorloge()
  ) {
    super(
      {
        proprietesAtomiquesFacultatives: ['dateHomologation', 'dureeValidite'],
      },
      referentiel
    );
    this.referentiel = referentiel;
    Decision.valide({ dateHomologation, dureeValidite }, referentiel);
    this.renseigneProprietes({ dateHomologation, dureeValidite });
    this.adaptateurHorloge = adaptateurHorloge;
  }

  descriptionDateHomologation() {
    if (!this.dateHomologation) {
      return '';
    }

    return dateEnFrancais(this.dateHomologation);
  }

  descriptionDureeValidite() {
    if (!this.dureeValidite) {
      return '';
    }

    return this.referentiel.descriptionEcheanceRenouvellement(
      this.dureeValidite
    );
  }

  dateProchaineHomologation() {
    const date = new Date(this.dateHomologation);
    const nbMois = this.referentiel.nbMoisDecalage(this.dureeValidite);

    return ajouteMoisADate(nbMois, date);
  }

  descriptionProchaineDateHomologation() {
    if (!this.dateHomologation || !this.dureeValidite) {
      return '';
    }

    return dateEnFrancais(this.dateProchaineHomologation());
  }

  enregistre(dateHomologation: string, dureeValidite: DureeValidite) {
    this.dateHomologation = dateHomologation;
    this.dureeValidite = dureeValidite;
  }

  estComplete() {
    return !!this.dateHomologation && !!this.dureeValidite;
  }

  periodeHomologationEstEnCours() {
    const maintenant = this.adaptateurHorloge.maintenant();
    return (
      new Date(this.dateHomologation) <= maintenant &&
      maintenant <= this.dateProchaineHomologation()
    );
  }

  static valide(
    { dateHomologation, dureeValidite }: Partial<DonneesDecision>,
    referentiel: Referentiel
  ) {
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
