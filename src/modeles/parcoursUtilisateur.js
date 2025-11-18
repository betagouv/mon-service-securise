import Base from './base.js';
import * as Referentiel from '../referentiel.js';
import EtatVisiteGuidee from './etatVisiteGuidee.js';
import { fabriqueAdaptateurHorloge } from '../adaptateurs/adaptateurHorloge.js';
import { ExplicationNouveauReferentiel } from './explicationNouveauReferentiel.js';

class ParcoursUtilisateur extends Base {
  constructor(
    donnees = {},
    referentiel = Referentiel.creeReferentielVide(),
    adaptateurHorloge = fabriqueAdaptateurHorloge()
  ) {
    super({
      proprietesAtomiquesRequises: ['idUtilisateur', 'dateDerniereConnexion'],
    });
    this.renseigneProprietes(donnees);
    this.etatVisiteGuidee = new EtatVisiteGuidee(
      donnees.etatVisiteGuidee,
      referentiel
    );
    this.explicationNouveauReferentiel = new ExplicationNouveauReferentiel({
      ...donnees.explicationNouveauReferentiel,
      versionsService: donnees.versionsService,
    });
    this.adaptateurHorloge = adaptateurHorloge;
    this.referentiel = referentiel;
  }

  enregistreDerniereConnexionMaintenant() {
    this.dateDerniereConnexion = this.adaptateurHorloge
      .maintenant()
      .toISOString();
    this.explicationNouveauReferentiel.aVuTableauDeBordDepuisConnexion = false;
  }

  finaliseExplicationNouveauReferentiel() {
    this.explicationNouveauReferentiel.finalise();
  }

  marqueTableauDeBordVu() {
    this.explicationNouveauReferentiel.aVuTableauDeBordDepuisConnexion = true;
  }

  aVuTableauDeBord() {
    return this.explicationNouveauReferentiel.aVuTableauDeBordDepuisConnexion;
  }

  doitAfficherExplicationNouveauReferentiel() {
    return this.explicationNouveauReferentiel.doitEtreAffichee();
  }

  static pourUtilisateur(idUtilisateur, referentiel, versionsService = []) {
    return new ParcoursUtilisateur(
      {
        idUtilisateur,
        etatVisiteGuidee: { dejaTerminee: false, enPause: false },
        explicationNouveauReferentiel: {
          dejaTermine: false,
          aVuTableauDeBordDepuisConnexion: false,
        },
        versionsService,
      },
      referentiel
    );
  }

  toJSON() {
    return {
      ...super.toJSON(),
      etatVisiteGuidee: this.etatVisiteGuidee.toJSON(),
      explicationNouveauReferentiel:
        this.explicationNouveauReferentiel.toJSON(),
    };
  }
}

export default ParcoursUtilisateur;
