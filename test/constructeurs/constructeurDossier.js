const adaptateurHorlogeParDefaut = require('../../src/adaptateurs/adaptateurHorloge');
const Dossier = require('../../src/modeles/dossier');
const Referentiel = require('../../src/referentiel');

class ConstructeurDossierFantaisie {
  constructor(
    id = '1',
    referentiel = Referentiel.creeReferentielVide(),
    adaptateurHorloge = adaptateurHorlogeParDefaut
  ) {
    this.donnees = { id };
    this.referentiel = referentiel;
    this.adaptateurHorloge = adaptateurHorloge;
  }

  sansDecision() {
    this.donnees.decision = {};
    return this;
  }

  avecDateHomologation(date) {
    this.donnees.decision.dateHomologation = date.toISOString();
    return this;
  }

  avecDateTelechargement(date) {
    this.donnees.dateTelechargement.date = new Date(date).toISOString();
    return this;
  }

  avecAutorite(nom, fonction) {
    this.donnees.autorite = { nom, fonction };
    return this;
  }

  avecAvis(avis) {
    this.donnees.avis = avis;
    return this;
  }

  avecDecision(dateHomologation, dureeValidite) {
    this.donnees.decision = {
      dateHomologation,
      dureeValidite,
    };
    return this;
  }

  avecDocuments(documents) {
    this.donnees.documents = documents;
    return this;
  }

  quiEstComplet() {
    this.donnees.finalise = true;
    this.donnees.avecAvis = true;
    this.donnees.avis = [
      {
        collaborateurs: ['Jean Dupond'],
        dureeValidite: 'unAn',
        statut: 'favorable',
      },
    ];
    this.donnees.avecDocuments = true;
    this.donnees.documents = ['unDocument'];
    this.donnees.decision = {
      dateHomologation: '2023-01-01',
      dureeValidite: 'unAn',
    };
    this.donnees.dateTelechargement = { date: new Date() };
    this.donnees.autorite = { nom: 'Jean Dupond', fonction: 'RSSI' };
    return this;
  }

  quiEstActif(depuis = 1) {
    const debutActif = new Date();
    debutActif.setDate(debutActif.getDate() - depuis);
    this.donnees.decision = {
      dateHomologation: debutActif.toISOString(),
      dureeValidite: 'unAn',
    };
    return this;
  }

  quiEstArchive() {
    this.donnees.archive = true;
    return this;
  }

  nonArchive() {
    this.donnees.archive = false;
    return this;
  }

  quiEstExpire() {
    const tresVieux = new Date();
    tresVieux.setDate(tresVieux.getDate() - 400);
    this.donnees.decision = {
      dateHomologation: tresVieux.toISOString(),
      dureeValidite: 'unAn',
    };
    return this;
  }

  quiVaExpirer(dansNJours, dureeValidite) {
    // Aujourd'hui - (nb de mois de validité) + rajouter nb jours d'expiration
    // Expire dans 3 jours, valide 1 an : je veux un début à 362 jours dans le passé.
    const aujourdhui = new Date();
    const debutActif = new Date(
      aujourdhui.setMonth(
        aujourdhui.getMonth() -
          this.referentiel.echeancesRenouvellement()[dureeValidite]
            .nbMoisDecalage
      )
    );
    debutActif.setDate(debutActif.getDate() + dansNJours);
    this.donnees.decision = {
      dateHomologation: debutActif.toISOString(),
      dureeValidite,
    };
    this.donnees.avis = this.donnees.avis.map((avis) => ({
      ...avis,
      dureeValidite,
    }));
    return this;
  }

  quiEstNonFinalise() {
    this.donnees.finalise = false;
    return this;
  }

  construit() {
    return new Dossier(this.donnees, this.referentiel, this.adaptateurHorloge);
  }
}

const unDossier = (referentiel, adaptateurHorloge) =>
  new ConstructeurDossierFantaisie('1', referentiel, adaptateurHorloge);

module.exports = { ConstructeurDossierFantaisie, unDossier };
