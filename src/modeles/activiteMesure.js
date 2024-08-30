class ActiviteMesure {
  constructor(donnees) {
    this.idService = donnees.idService;
    this.idActeur = donnees.idActeur;
    this.type = donnees.type;
    this.details = donnees.details;
    this.idMesure = donnees.idMesure;
    this.date = donnees.date;
  }
}

module.exports = ActiviteMesure;
