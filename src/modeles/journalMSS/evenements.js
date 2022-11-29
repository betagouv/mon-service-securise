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

class EvenementNouveauServiceCree extends Evenements {
  constructor(date = Date.now()) {
    super('NOUVEAU_SERVICE_CREE', date);
  }
}

module.exports = { EvenementNouveauServiceCree };
