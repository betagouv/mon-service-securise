class BusEvenements {
  constructor({ adaptateurGestionErreur }) {
    this.handlers = {};
    this.adaptateurGestionErreur = adaptateurGestionErreur;
  }

  abonne(classeEvenement, handler) {
    this.handlers[classeEvenement.name] ??= [];
    this.handlers[classeEvenement.name].push(handler);
  }

  abonnePlusieurs(classeEvenement, handlers) {
    handlers.forEach((h) => this.abonne(classeEvenement, h));
  }

  async publie(evenement) {
    // eslint-disable-next-line no-restricted-syntax
    for (const handler of this.handlers[evenement.constructor.name]) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await handler(evenement);
      } catch (e) {
        this.adaptateurGestionErreur.logueErreur(e);
      }
    }
  }
}

module.exports = BusEvenements;
