import Etape from './etape.js';
import Avis from '../avis.js';
import InformationsService from '../informationsService.js';
import { creeReferentielVide } from '../../referentiel.js';

class EtapeAvis extends Etape {
  constructor(
    { avis = [], avecAvis = null } = {},
    referentiel = creeReferentielVide()
  ) {
    super({ proprietesAtomiquesRequises: ['avecAvis'] }, referentiel);

    this.renseigneProprietes({ avecAvis });
    this.avis = avis.map((a) => new Avis(a, this.referentiel));
  }

  enregistreAvis(avis) {
    this.avecAvis = true;
    this.avis = avis.map((a) => new Avis(a, this.referentiel));
  }

  declareSansAvis() {
    this.avecAvis = false;
    this.avis = [];
  }

  estComplete() {
    if (this.avecAvis === null) return false;
    return this.avecAvis
      ? this.avis.every(
          (a) => a.statutSaisie() === InformationsService.COMPLETES
        )
      : true;
  }

  toJSON() {
    return {
      avis: this.avis.map((a) => a.toJSON()),
      avecAvis: this.avecAvis,
    };
  }
}

export default EtapeAvis;
