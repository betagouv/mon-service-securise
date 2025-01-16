const Etape = require('./etape');

class DateTelechargement extends Etape {
  constructor(donnees = {}) {
    super({ proprietesAtomiquesRequises: ['date'] });
    this.renseigneProprietes(donnees);
  }

  estComplete() {
    return this.date !== undefined;
  }

  enregistreDateTelechargement(date) {
    this.date = date;
  }

  toJSON() {
    return { date: this.date };
  }
}

module.exports = DateTelechargement;
