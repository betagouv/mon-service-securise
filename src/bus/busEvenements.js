class BusEvenements {
  constructor({ adaptateurGestionErreur }) {
    this.handlers = {};
    this.adaptateurGestionErreur = adaptateurGestionErreur;
  }

  abonne(classeEvenement, handler) {
    this.handlers[classeEvenement.name] ??= [];
    this.handlers[classeEvenement.name].push(handler);
  }

  publie(evenement) {
    this.handlers[evenement.constructor.name].forEach((handler) => {
      try {
        handler(evenement);
      } catch (e) {
        this.adaptateurGestionErreur.logueErreur(e);
      }
    });
  }
}

module.exports = BusEvenements;
