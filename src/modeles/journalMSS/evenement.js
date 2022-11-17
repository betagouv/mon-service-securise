class Evenement {
  constructor(type, date = Date.now()) {
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

module.exports = Evenement;
