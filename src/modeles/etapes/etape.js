import InformationsService from '../informationsService.js';

class Etape extends InformationsService {
  constructor(donnees, referentiel) {
    super(donnees);
    this.referentiel = referentiel;
  }

  // eslint-disable-next-line class-methods-use-this
  estComplete() {
    throw Error(
      'Méthode non implémentée. Elle devrait être redéfinie par héritage.'
    );
  }
}

export default Etape;
