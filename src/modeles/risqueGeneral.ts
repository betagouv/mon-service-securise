import Risque, { DonneesRisque } from './risque.js';
import { ErreurRisqueInconnu } from '../erreurs.js';
import { Referentiel } from '../referentiel.interface.js';
import { creeReferentielVide } from '../referentiel.js';

export type DonneesRisqueGeneral = DonneesRisque & {
  desactive?: boolean;
};

type CategorieRisque =
  | 'disponibilite'
  | 'integrite'
  | 'confidentialite'
  | 'tracabilite';

class RisqueGeneral extends Risque {
  readonly desactive?: boolean;

  constructor(
    donneesRisque: Partial<DonneesRisqueGeneral> = {},
    referentiel: Referentiel = creeReferentielVide()
  ) {
    super(donneesRisque, referentiel);
    this.proprietesAtomiquesFacultatives.push('desactive');

    RisqueGeneral.valide(donneesRisque, referentiel);
    this.renseigneProprietes(donneesRisque);
  }

  categoriesRisque(): CategorieRisque {
    return this.referentiel.categoriesRisque(this.id);
  }

  intituleRisque(): string {
    return this.referentiel.descriptionRisque(this.id);
  }

  identifiantNumeriqueRisque(): string {
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

  static valide(
    donnees: Partial<DonneesRisqueGeneral>,
    referentiel: Referentiel
  ) {
    super.valide(donnees, referentiel);
    const { id } = donnees;
    const identifiantsRisquesRepertories = referentiel.identifiantsRisques();
    if (!id || !identifiantsRisquesRepertories.includes(id)) {
      throw new ErreurRisqueInconnu(`Le risque "${id}" n'est pas répertorié`);
    }
  }
}

export default RisqueGeneral;
