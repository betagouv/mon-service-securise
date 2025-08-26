import {
  ErreurDateHomologationInvalide,
  ErreurDureeValiditeInvalide,
} from '../../erreurs.js';
import * as adaptateurHorlogeParDefaut from '../../adaptateurs/adaptateurHorloge.js';
import Etape from './etape.js';
import {
  ajouteMoisADate,
  dateEnFrancais,
  dateInvalide,
} from '../../utilitaires/date.js';
import * as Referentiel from '../../referentiel.js';

class Decision extends Etape {
  constructor(
    { dateHomologation, dureeValidite } = {},
    referentiel = Referentiel.creeReferentielVide(),
    adaptateurHorloge = adaptateurHorlogeParDefaut
  ) {
    super(
      {
        proprietesAtomiquesFacultatives: ['dateHomologation', 'dureeValidite'],
      },
      referentiel
    );
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

  enregistre(dateHomologation, dureeValidite) {
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

  static valide({ dateHomologation, dureeValidite }, referentiel) {
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
