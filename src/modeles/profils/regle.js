class Regle {
  constructor({ presence, absence } = {}) {
    this.presence = presence || [];
    this.absence = absence || [];
  }
}

export default Regle;
