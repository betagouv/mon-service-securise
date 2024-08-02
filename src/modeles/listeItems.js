const InformationsService = require('./informationsService');

class ListeItems extends InformationsService {
  constructor(fonctionCreation, donnees, referentiel) {
    super();
    const { items } = donnees;
    this.items = items.map(fonctionCreation);
    this.referentiel = referentiel;
  }

  item(index) {
    return this.items[index];
  }

  nombre() {
    return this.items.length;
  }

  statutSaisie() {
    if (this.nombre() === 0) return InformationsService.A_SAISIR;

    return this.items.every(
      (i) => i.statutSaisie() === InformationsService.COMPLETES
    )
      ? InformationsService.COMPLETES
      : InformationsService.A_COMPLETER;
  }

  toJSON() {
    return this.items.map((i) => i.toJSON());
  }

  donneesSerialisees() {
    return this.items.map((i) => i.donneesSerialisees());
  }

  tous() {
    return this.items;
  }

  toutes() {
    return this.tous();
  }
}

module.exports = ListeItems;
