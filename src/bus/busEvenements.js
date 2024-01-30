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
    // On fonctionne exprès en `fire & forget` pour les handlers.
    // Dans un souci de performance : on ne veut pas attendre les exécutions.
    this.handlers[evenement.constructor.name].forEach((handler) => {
      handler(evenement).catch((e) => {
        this.adaptateurGestionErreur.logueErreur(e);
      });
    });
  }
}

module.exports = BusEvenements;
