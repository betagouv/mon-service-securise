class Evenement {
  constructor(type) {
    this.type = type;
  }

  toJSON() {
    return { type: this.type };
  }
}

module.exports = Evenement;
