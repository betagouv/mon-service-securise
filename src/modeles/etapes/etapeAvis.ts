import Etape from './etape.js';
import Avis, { DonneesAvis } from '../avis.js';
import InformationsService from '../informationsService.js';
import { Referentiel } from '../../referentiel.interface.js';
import { creeReferentielVide } from '../../referentiel.js';

export type DonneesEtapeAvis = {
  avecAvis?: boolean | null;
  avis?: Array<Partial<DonneesAvis>>;
};

class EtapeAvis extends Etape {
  avecAvis!: boolean | null;
  avis!: Avis[];
  private readonly referentiel!: Referentiel;

  constructor(
    { avis = [], avecAvis = null }: Partial<DonneesEtapeAvis> = {},
    referentiel: Referentiel = creeReferentielVide()
  ) {
    super({ proprietesAtomiquesRequises: ['avecAvis'] }, referentiel);

    this.renseigneProprietes({ avecAvis });
    this.referentiel = referentiel;
    this.avis = avis.map((a) => new Avis(a, this.referentiel));
  }

  enregistreAvis(avis: Array<Partial<DonneesAvis>>) {
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
