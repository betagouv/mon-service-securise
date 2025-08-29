import Risque from './risque.js';
import { ErreurRisqueInconnu } from '../erreurs.js';
import * as Referentiel from '../referentiel.js';

class RisqueGeneral extends Risque {
  constructor(
    donneesRisque = {},
    referentiel = Referentiel.creeReferentielVide()
  ) {
    super(donneesRisque, referentiel);
    this.proprietesAtomiquesFacultatives.push('desactive');

    RisqueGeneral.valide(donneesRisque, referentiel);
    this.renseigneProprietes(donneesRisque);
    this.referentiel = referentiel;
  }

  categoriesRisque() {
    return this.referentiel.categoriesRisque(this.id);
  }

  intituleRisque() {
    return this.referentiel.descriptionRisque(this.id);
  }

  identifiantNumeriqueRisque() {
    return this.referentiel.identifiantNumeriqueRisque(this.id);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      intitule: this.intituleRisque(),
      categories: this.categoriesRisque(),
      identifiantNumerique: this.identifiantNumeriqueRisque(),
      niveauRisque: this.niveauRisque(),
    };
  }

  donneesSerialisees() {
    return super.toJSON();
  }

  static valide(donnees, referentiel) {
    super.valide(donnees, referentiel);
    const { id } = donnees;
    const identifiantsRisquesRepertories = referentiel.identifiantsRisques();
    if (!identifiantsRisquesRepertories.includes(id)) {
      throw new ErreurRisqueInconnu(`Le risque "${id}" n'est pas répertorié`);
    }
  }
}

export default RisqueGeneral;
