class ActiviteMesure {
  constructor(donnees) {
    this.service = donnees.service;
    this.acteur = donnees.acteur;
    this.type = donnees.type;
    this.details = donnees.details;
    this.mesure = donnees.mesure;
  }

  idActeur = () => this.acteur.id;

  idService = () => this.service.id;
}

module.exports = ActiviteMesure;
