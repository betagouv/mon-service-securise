import * as adaptateurHorlogeParDefaut from '../adaptateurs/adaptateurHorloge.js';
import Base from './base.js';
import * as Referentiel from '../referentiel.js';
import EtatVisiteGuidee from './etatVisiteGuidee.js';

class ParcoursUtilisateur extends Base {
  constructor(
    donnees = {},
    referentiel = Referentiel.creeReferentielVide(),
    adaptateurHorloge = adaptateurHorlogeParDefaut
  ) {
    super({
      proprietesAtomiquesRequises: ['idUtilisateur', 'dateDerniereConnexion'],
    });
    this.renseigneProprietes(donnees);
    this.etatVisiteGuidee = new EtatVisiteGuidee(
      donnees.etatVisiteGuidee,
      referentiel
    );
    this.adaptateurHorloge = adaptateurHorloge;
    this.referentiel = referentiel;
  }

  enregistreDerniereConnexionMaintenant() {
    this.dateDerniereConnexion = this.adaptateurHorloge
      .maintenant()
      .toISOString();
  }

  static pourUtilisateur(idUtilisateur, referentiel) {
    return new ParcoursUtilisateur(
      {
        idUtilisateur,
        etatVisiteGuidee: { dejaTerminee: false, enPause: false },
      },
      referentiel
    );
  }

  toJSON() {
    return {
      ...super.toJSON(),
      etatVisiteGuidee: this.etatVisiteGuidee.toJSON(),
    };
  }
}

export default ParcoursUtilisateur;
