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

  avecDateTelechargement(idDocument, date) {
    this.donnees.datesTelechargements[idDocument] = date.toISOString();
    return this;
  }

  avecAutorite(nom, fonction) {
    this.donnees.autorite = { nom, fonction };
    return this;
  }

  quiEstComplet() {
    this.donnees.finalise = true;
    this.donnees.avis = [{ collaborateurs: ['Jean Dupond'], dureeValidite: 'unAn', statut: 'favorable' }];
    this.donnees.decision = { dateHomologation: '2023-01-01', dureeValidite: 'unAn' };
    this.donnees.datesTelechargements = this.referentiel
      .tousDocumentsHomologation()
      .reduce((acc, { id }) => ({ ...acc, [id]: new Date() }), {});
    this.donnees.autorite = { nom: 'Jean Dupond', fonction: 'RSSI' };
    return this;
  }

  quiEstActif(depuis = 1) {
    const debutActif = new Date();
    debutActif.setDate(debutActif.getDate() - depuis);
    this.donnees.decision = { dateHomologation: debutActif.toISOString(), dureeValidite: 'unAn' };
    return this;
  }

  quiEstExpire() {
    const tresVieux = new Date();
    tresVieux.setDate(tresVieux.getDate() - 400);
    this.donnees.decision = { dateHomologation: tresVieux.toISOString(), dureeValidite: 'unAn' };
    return this;
  }

  construit() {
    return new Dossier(this.donnees, this.referentiel, this.adaptateurHorloge);
  }
}

const unDossier = (referentiel, adaptateurHorloge) => new ConstructeurDossierFantaisie('1', referentiel, adaptateurHorloge);

module.exports = { ConstructeurDossierFantaisie, unDossier };
