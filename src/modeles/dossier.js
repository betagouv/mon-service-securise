const adaptateurHorlogeParDefaut = require('../adaptateurs/adaptateurHorloge');
const Autorite = require('./etapes/autorite');
const DateTelechargement = require('./etapes/dateTelechargement');
const Decision = require('./etapes/decision');
const Documents = require('./etapes/documents');
const EtapeAvis = require('./etapes/etapeAvis');
const InformationsHomologation = require('./informationsHomologation');
const Referentiel = require('../referentiel');
const { ErreurDossierDejaFinalise, ErreurDossierNonFinalisable, ErreurDossierEtapeInconnue } = require('../erreurs');

class Dossier extends InformationsHomologation {
  constructor(
    donneesDossier = {},
    referentiel = Referentiel.creeReferentielVide(),
    adaptateurHorloge = adaptateurHorlogeParDefaut
  ) {
    donneesDossier.finalise = !!donneesDossier.finalise;

    super({
      proprietesAtomiquesFacultatives: ['id', 'finalise'],
    });
    this.renseigneProprietes(donneesDossier, referentiel);
    this.referentiel = referentiel;

    this.decision = new Decision(
      donneesDossier.decision,
      referentiel,
      adaptateurHorloge
    );
    this.autorite = new Autorite(donneesDossier.autorite);
    this.dateTelechargement = new DateTelechargement(donneesDossier.dateTelechargement);
    this.avis = new EtapeAvis({
      avis: donneesDossier.avis,
      avecAvis: donneesDossier.avecAvis,
    }, referentiel);
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

  enregistreFinalisation() {
    if (!this.estComplet()) {
      const etapesIncompletes = Dossier
        .etapesObligatoires()
        .filter((etape) => !this[etape].estComplete());
      throw new ErreurDossierNonFinalisable('Ce dossier comporte des étapes incomplètes.', etapesIncompletes);
    }

    this.finalise = true;
  }

  estComplet() {
    return Dossier.etapesObligatoires().every((etape) => this[etape].estComplete());
  }

  estActif() {
    return this.finalise && this.decision.periodeHomologationEstEnCours();
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
