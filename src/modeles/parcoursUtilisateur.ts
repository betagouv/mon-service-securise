import EtatVisiteGuidee from './etatVisiteGuidee.js';
import {
  AdaptateurHorloge,
  fabriqueAdaptateurHorloge,
} from '../adaptateurs/adaptateurHorloge.js';
import {
  DonneesExplicationNouveauReferentiel,
  ExplicationNouveauReferentiel,
} from './explicationNouveauReferentiel.js';
import { UUID } from '../typesBasiques.js';
import { VersionService } from './versionService.js';
import { creeReferentielVide } from '../referentiel.js';
import { Referentiel } from '../referentiel.interface.js';

type DonneesEtatVisiteGuidee = {
  dejaTerminee: boolean;
  enPause: boolean;
  etapesVues?: string[];
};

type DonneesParcoursUtilisateur = {
  dateDerniereConnexion?: string;
  etatVisiteGuidee: DonneesEtatVisiteGuidee;
  explicationNouveauReferentiel: DonneesExplicationNouveauReferentiel;
  idUtilisateur: UUID;
  versionsService?: VersionService[];
};

class ParcoursUtilisateur {
  private readonly adaptateurHorloge: AdaptateurHorloge;
  readonly idUtilisateur: UUID;
  readonly etatVisiteGuidee: EtatVisiteGuidee;
  readonly explicationNouveauReferentiel: ExplicationNouveauReferentiel;
  dateDerniereConnexion?: string;

  constructor(
    donnees: DonneesParcoursUtilisateur,
    referentiel = creeReferentielVide(),
    adaptateurHorloge = fabriqueAdaptateurHorloge()
  ) {
    this.idUtilisateur = donnees.idUtilisateur;
    this.dateDerniereConnexion = donnees.dateDerniereConnexion;
    this.etatVisiteGuidee = new EtatVisiteGuidee(
      donnees.etatVisiteGuidee,
      referentiel
    );
    this.explicationNouveauReferentiel = new ExplicationNouveauReferentiel({
      ...donnees.explicationNouveauReferentiel,
      versionsService: donnees.versionsService,
    });
    this.adaptateurHorloge = adaptateurHorloge;
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

  static pourUtilisateur(
    idUtilisateur: UUID,
    referentiel: Referentiel,
    versionsService: VersionService[] = []
  ) {
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

  toJSON(): DonneesParcoursUtilisateur {
    return {
      idUtilisateur: this.idUtilisateur,
      dateDerniereConnexion: this.dateDerniereConnexion,
      etatVisiteGuidee:
        this.etatVisiteGuidee.toJSON() as DonneesEtatVisiteGuidee,
      explicationNouveauReferentiel:
        this.explicationNouveauReferentiel.toJSON(),
    };
  }
}

export default ParcoursUtilisateur;
