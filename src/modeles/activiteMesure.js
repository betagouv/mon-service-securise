class ActiviteMesure {
  constructor(donnees) {
    this.service = donnees.service;
    this.acteur = donnees.acteur;
    this.type = donnees.type;
    this.details = donnees.details;
    this.mesure = donnees.mesure;
    this.date = donnees.date;
  }

  idActeur = () => this.acteur.id;

  idService = () => this.service.id;

  idMesure = () => this.mesure.id;
}

module.exports = ActiviteMesure;
