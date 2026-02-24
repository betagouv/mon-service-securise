import {
  AdaptateurHorloge,
  fabriqueAdaptateurHorloge,
} from '../adaptateurs/adaptateurHorloge.js';
import Autorite, { DonneeEtapeAutorite } from './etapes/autorite.js';
import DateTelechargement, {
  DonneeEtapeDateTelechargement,
} from './etapes/dateTelechargement.js';
import Decision, { DonneesDecision, DureeValidite } from './etapes/decision.js';
import Documents, { DonneesDocuments } from './etapes/documents.js';
import EtapeAvis, { DonneesEtapeAvis } from './etapes/etapeAvis.js';
import InformationsService from './informationsService.js';
import {
  ErreurDossierDejaFinalise,
  ErreurDossierEtapeInconnue,
  ErreurDossierNonFinalisable,
  ErreurDossierNonFinalise,
} from '../erreurs.js';
import { Referentiel } from '../referentiel.interface.js';
import { UUID } from '../typesBasiques.js';
import { creeReferentielVide } from '../referentiel.js';
import { DonneesAvis } from './avis.js';

type DonneesDossier = {
  id?: UUID;
  finalise?: boolean;
  archive?: boolean;
  indiceCyber?: number;
  indiceCyberPersonnalise?: number;
  importe?: boolean;
  decision?: DonneesDecision;
  autorite?: DonneeEtapeAutorite;
  dateTelechargement?: DonneeEtapeDateTelechargement;
  avis?: DonneesEtapeAvis['avis'];
  avecAvis?: DonneesEtapeAvis['avecAvis'];
  documents?: DonneesDocuments['documents'];
  avecDocuments?: DonneesDocuments['avecDocuments'];
};

type IdentifiantEtape =
  | 'decision'
  | 'dateTelechargement'
  | 'autorite'
  | 'avis'
  | 'documents';

class Dossier extends InformationsService {
  readonly id!: UUID;
  finalise?: boolean;
  archive?: boolean;
  indiceCyber?: number;
  indiceCyberPersonnalise?: number;
  importe?: boolean;
  readonly decision: Decision;
  readonly autorite: Autorite;
  readonly dateTelechargement: DateTelechargement;
  readonly avis: EtapeAvis;
  readonly documents: Documents;
  private readonly referentiel: Referentiel;
  private readonly adaptateurHorloge: AdaptateurHorloge;

  constructor(
    donneesDossier: Partial<DonneesDossier> = {},
    referentiel: Referentiel = creeReferentielVide(),
    adaptateurHorloge: AdaptateurHorloge = fabriqueAdaptateurHorloge()
  ) {
    // eslint-disable-next-line no-param-reassign
    donneesDossier.finalise = !!donneesDossier.finalise;

    super({
      proprietesAtomiquesFacultatives: [
        'id',
        'finalise',
        'archive',
        'indiceCyber',
        'indiceCyberPersonnalise',
        'importe',
      ],
    });
    this.renseigneProprietes(donneesDossier, referentiel);
    this.referentiel = referentiel;
    this.adaptateurHorloge = adaptateurHorloge;

    this.decision = new Decision(
      donneesDossier.decision,
      referentiel,
      adaptateurHorloge
    );
    this.autorite = new Autorite(donneesDossier.autorite);
    this.dateTelechargement = new DateTelechargement(
      donneesDossier.dateTelechargement
    );
    this.avis = new EtapeAvis(
      {
        avis: donneesDossier.avis,
        avecAvis: donneesDossier.avecAvis,
      },
      referentiel
    );
    this.documents = new Documents({
      documents: donneesDossier.documents,
      avecDocuments: donneesDossier.avecDocuments,
    });
  }

  descriptionDateHomologation() {
    return this.decision.descriptionDateHomologation();
  }

  descriptionDureeValidite() {
    return this.decision.descriptionDureeValidite();
  }

  dateProchaineHomologation() {
    return this.decision.dateProchaineHomologation();
  }

  descriptionProchaineDateHomologation() {
    return this.decision.descriptionProchaineDateHomologation();
  }

  enregistreAutoriteHomologation(nom: string, fonction: string) {
    if (this.finalise) throw new ErreurDossierDejaFinalise();

    this.autorite.enregistreAutoriteHomologation(nom, fonction);
  }

  estExpire() {
    const dateLimite = new Date(this.dateProchaineHomologation());
    return this.adaptateurHorloge.maintenant() > dateLimite;
  }

  estBientotExpire() {
    if (this.estExpire()) return false;

    const moisBientotExpire = this.referentiel.nbMoisBientotExpire(
      this.decision.dureeValidite
    );
    const dateLimite = new Date(this.dateProchaineHomologation());
    const premierJourDuBientotExpire =
      dateLimite.getDate() - moisBientotExpire * 30;
    dateLimite.setDate(premierJourDuBientotExpire);

    return this.adaptateurHorloge.maintenant() > dateLimite;
  }

  declareSansAvis() {
    if (this.finalise) throw new ErreurDossierDejaFinalise();

    this.avis.declareSansAvis();
  }

  enregistreAvis(avis: Partial<DonneesAvis>[]) {
    if (this.finalise) throw new ErreurDossierDejaFinalise();

    this.avis.enregistreAvis(avis);
  }

  declareSansDocument() {
    if (this.finalise) throw new ErreurDossierDejaFinalise();

    this.documents.declareSansDocument();
  }

  enregistreArchivage() {
    if (!this.finalise) throw new ErreurDossierNonFinalise();

    this.archive = true;
  }

  enregistreDocuments(documents: string[]) {
    if (this.finalise) throw new ErreurDossierDejaFinalise();

    this.documents.enregistreDocuments(documents);
  }

  enregistreDateTelechargement(date: string) {
    if (this.finalise) throw new ErreurDossierDejaFinalise();

    this.dateTelechargement.enregistreDateTelechargement(date);
  }

  enregistreDecision(
    dateHomologation: string,
    dureeHomologation: DureeValidite
  ) {
    if (this.finalise) throw new ErreurDossierDejaFinalise();

    this.decision.enregistre(dateHomologation, dureeHomologation);
  }

  enregistreFinalisation(
    indiceCyber?: number,
    indiceCyberPersonnalise?: number
  ) {
    // Les paramètres sont optionnels, car une finalisation déclenchée par téléversement n'a pas d'indice cyber.
    if (!this.estComplet()) {
      const etapesIncompletes = Dossier.etapesObligatoires().filter(
        (etape) => !this[etape].estComplete()
      );
      throw new ErreurDossierNonFinalisable(
        'Ce dossier comporte des étapes incomplètes.',
        etapesIncompletes
      );
    }

    this.finalise = true;
    this.indiceCyber = indiceCyber;
    this.indiceCyberPersonnalise = indiceCyberPersonnalise;
  }

  declareImporte() {
    if (this.finalise) throw new ErreurDossierDejaFinalise();

    this.importe = true;
  }

  estComplet() {
    return Dossier.etapesObligatoires().every((etape) =>
      this[etape].estComplete()
    );
  }

  estActif() {
    return this.finalise && !this.archive;
  }

  etapeCourante() {
    if (this.estComplet()) return this.referentiel.derniereEtapeParcours()!.id;

    const etapesOrdonnees = this.referentiel
      .etapesParcoursHomologation()
      .sort((e1, e2) => e1.numero - e2.numero) as unknown as Array<{
      id: IdentifiantEtape;
    }>;

    const premiereNonComplete = etapesOrdonnees.find((e) => {
      try {
        return !this[e.id].estComplete();
      } catch {
        throw new ErreurDossierEtapeInconnue(e.id);
      }
    });

    return premiereNonComplete!.id;
  }

  static etapesObligatoires(): Array<IdentifiantEtape> {
    return ['decision', 'dateTelechargement', 'autorite', 'avis', 'documents'];
  }

  statutHomologation() {
    if (!this.finalise) return 'nonRealisee';

    if (this.estBientotExpire()) return 'bientotExpiree';

    const activeDansLeFutur =
      new Date(this.decision.dateHomologation) >
      this.adaptateurHorloge.maintenant();

    if (activeDansLeFutur || this.decision.periodeHomologationEstEnCours())
      return 'activee';

    if (this.estExpire()) return 'expiree';

    throw new Error(
      "Impossible de déterminer le statut d'homologation du dossier"
    );
  }

  toJSON() {
    return {
      ...super.toJSON(),
      decision: this.decision.toJSON(),
      autorite: this.autorite.toJSON(),
      dateTelechargement: this.dateTelechargement.toJSON(),
      ...this.avis.toJSON(),
      ...this.documents.toJSON(),
    };
  }
}

export default Dossier;
