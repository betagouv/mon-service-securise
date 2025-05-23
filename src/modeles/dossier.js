const adaptateurHorlogeParDefaut = require('../adaptateurs/adaptateurHorloge');
const Autorite = require('./etapes/autorite');
const DateTelechargement = require('./etapes/dateTelechargement');
const Decision = require('./etapes/decision');
const Documents = require('./etapes/documents');
const EtapeAvis = require('./etapes/etapeAvis');
const InformationsService = require('./informationsService');
const Referentiel = require('../referentiel');
const {
  ErreurDossierDejaFinalise,
  ErreurDossierNonFinalisable,
  ErreurDossierEtapeInconnue,
  ErreurDossierNonFinalise,
} = require('../erreurs');

class Dossier extends InformationsService {
  constructor(
    donneesDossier = {},
    referentiel = Referentiel.creeReferentielVide(),
    adaptateurHorloge = adaptateurHorlogeParDefaut
  ) {
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

  enregistreAutoriteHomologation(nom, fonction) {
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

  enregistreAvis(avis) {
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

  enregistreDocuments(documents) {
    if (this.finalise) throw new ErreurDossierDejaFinalise();

    this.documents.enregistreDocuments(documents);
  }

  enregistreDateTelechargement(date) {
    if (this.finalise) throw new ErreurDossierDejaFinalise();

    this.dateTelechargement.enregistreDateTelechargement(date);
  }

  enregistreDecision(dateHomologation, dureeHomologation) {
    if (this.finalise) throw new ErreurDossierDejaFinalise();

    this.decision.enregistre(dateHomologation, dureeHomologation);
  }

  enregistreFinalisation(indiceCyber, indiceCyberPersonnalise) {
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
    if (this.estComplet()) return this.referentiel.derniereEtapeParcours().id;

    const etapesOrdonnees = this.referentiel
      .etapesParcoursHomologation()
      .sort((e1, e2) => e1.numero - e2.numero);

    const premiereNonComplete = etapesOrdonnees.find((e) => {
      try {
        return !this[e.id].estComplete();
      } catch {
        throw new ErreurDossierEtapeInconnue(e.id);
      }
    });

    return premiereNonComplete.id;
  }

  static etapesObligatoires() {
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

module.exports = Dossier;
