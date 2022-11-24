class Evenements {
  constructor(type, date) {
    this.type = type;
    this.date = date;
  }

  toJSON() {
    return {
      type: this.type,
      date: this.date,
    };
  }
}

class EvenementNouvelleHomologationCreee extends Evenements {
  constructor(date = Date.now()) {
    super('NOUVELLE_HOMOLOGATION_CREEE', date);
  }
}

module.exports = { EvenementNouvelleHomologationCreee };
