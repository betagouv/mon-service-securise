import EtatVisiteGuidee from './etatVisiteGuidee.js';
import {
  AdaptateurHorloge,
  fabriqueAdaptateurHorloge,
} from '../adaptateurs/adaptateurHorloge.js';
import { ExplicationNouveauReferentiel } from './explicationNouveauReferentiel.js';
import { UUID } from '../typesBasiques.js';
import { VersionService } from './versionService.js';
import { creeReferentielVide } from '../referentiel.js';
import { Referentiel } from '../referentiel.interface.js';

type DonneesEtatVisiteGuidee = {
  dejaTerminee: boolean;
  enPause: boolean;
  etapesVues?: string[];
};

export type DonneesParcoursUtilisateur = {
  aVuTableauDeBordDepuisConnexion: boolean;
  dateDerniereConnexion?: string;
  etatVisiteGuidee: DonneesEtatVisiteGuidee;
  explicationNouveauReferentiel?: { dejaTermine: boolean };
  idUtilisateur: UUID;
  versionsService?: VersionService[];
  aVuExplicationRisquesV2?: boolean;
};

class ParcoursUtilisateur {
  private readonly adaptateurHorloge: AdaptateurHorloge;
  private aVuTableauDeBordDepuisConnexion: boolean;
  readonly idUtilisateur: UUID;
  readonly etatVisiteGuidee: EtatVisiteGuidee;
  readonly explicationNouveauReferentiel: ExplicationNouveauReferentiel;
  dateDerniereConnexion?: string;
  aVuExplicationRisquesV2: boolean;

  constructor(
    donnees: DonneesParcoursUtilisateur,
    referentiel = creeReferentielVide(),
    adaptateurHorloge = fabriqueAdaptateurHorloge()
  ) {
    this.aVuTableauDeBordDepuisConnexion =
      donnees.aVuTableauDeBordDepuisConnexion;
    this.idUtilisateur = donnees.idUtilisateur;
    this.dateDerniereConnexion = donnees.dateDerniereConnexion;
    this.etatVisiteGuidee = new EtatVisiteGuidee(
      donnees.etatVisiteGuidee,
      referentiel
    );
    this.explicationNouveauReferentiel = new ExplicationNouveauReferentiel({
      dejaTermine: donnees.explicationNouveauReferentiel?.dejaTermine || false,
      aVuTableauDeBordDepuisConnexion: this.aVuTableauDeBordDepuisConnexion,
      versionsService: donnees.versionsService,
    });
    this.adaptateurHorloge = adaptateurHorloge;
    this.aVuExplicationRisquesV2 = donnees.aVuExplicationRisquesV2 || false;
  }

  enregistreDerniereConnexionMaintenant() {
    this.dateDerniereConnexion = this.adaptateurHorloge
      .maintenant()
      .toISOString();
    this.aVuTableauDeBordDepuisConnexion = false;
  }

  marqueExplicationsRisquesV2Vues() {
    this.aVuExplicationRisquesV2 = true;
  }

  finaliseExplicationNouveauReferentiel() {
    this.explicationNouveauReferentiel.finalise();
  }

  marqueTableauDeBordVu() {
    this.aVuTableauDeBordDepuisConnexion = true;
  }

  aVuTableauDeBord() {
    return this.aVuTableauDeBordDepuisConnexion;
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
        aVuTableauDeBordDepuisConnexion: false,
        idUtilisateur,
        etatVisiteGuidee: { dejaTerminee: false, enPause: false },
        explicationNouveauReferentiel: {
          dejaTermine: false,
        },
        versionsService,
      },
      referentiel
    );
  }

  toJSON(): DonneesParcoursUtilisateur {
    return {
      aVuTableauDeBordDepuisConnexion: this.aVuTableauDeBordDepuisConnexion,
      idUtilisateur: this.idUtilisateur,
      dateDerniereConnexion: this.dateDerniereConnexion,
      etatVisiteGuidee:
        this.etatVisiteGuidee.toJSON() as DonneesEtatVisiteGuidee,
      explicationNouveauReferentiel:
        this.explicationNouveauReferentiel.toJSON(),
      aVuExplicationRisquesV2: this.aVuExplicationRisquesV2,
    };
  }

  donneesSerialisees() {
    return this.toJSON();
  }
}

export default ParcoursUtilisateur;
