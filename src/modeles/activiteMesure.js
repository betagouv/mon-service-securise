class ActiviteMesure {
  constructor(donnees) {
    this.service = donnees.service;
    this.acteur = donnees.acteur;
    this.type = donnees.type;
    this.details = donnees.details;
  }

  acteurId = () => this.acteur.id;

  serviceId = () => this.service.id;
}

module.exports = ActiviteMesure;
