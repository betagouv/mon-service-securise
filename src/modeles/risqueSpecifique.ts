import Risque, { CategorieRisque, DonneesRisque } from './risque.js';

import {
  ErreurIntituleRisqueManquant,
  ErreurCategoriesRisqueManquantes,
  ErreurCategorieRisqueInconnue,
} from '../erreurs.js';
import { Referentiel, ReferentielV2 } from '../referentiel.interface.js';
import { UUID } from '../typesBasiques.js';

export type DonneesRisqueSpecifique = DonneesRisque & {
  id: UUID;
  intitule: string;
  identifiantNumerique: string;
  categories: CategorieRisque[];
  description?: string;
};

class RisqueSpecifique extends Risque {
  declare readonly id: UUID;
  readonly intitule!: string;
  identifiantNumerique!: string;
  private readonly categories!: CategorieRisque[];
  readonly description?: string;

  constructor(
    donneesRisque: Partial<DonneesRisqueSpecifique>,
    referentiel: Referentiel | ReferentielV2
  ) {
    super(donneesRisque, referentiel);

    this.proprietesAtomiquesRequises.push('intitule', 'identifiantNumerique');
    this.proprietesListes.push('categories');
    this.proprietesAtomiquesFacultatives.push('description');
    this.renseigneProprietes(donneesRisque);
  }

  identifiantNumeriqueRisque() {
    return this.identifiantNumerique;
  }

  categoriesRisque() {
    return this.categories;
  }

  intituleRisque() {
    return this.intitule;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      identifiantNumerique: this.identifiantNumeriqueRisque(),
      niveauRisque: this.niveauRisque(),
    };
  }

  donneesSerialisees() {
    return super.toJSON();
  }

  static valide(
    donneesRisque: Partial<DonneesRisqueSpecifique>,
    referentiel: Referentiel | ReferentielV2
  ) {
    super.valide(donneesRisque, referentiel);
    const { intitule, categories } = donneesRisque;
    if (!intitule) {
      throw new ErreurIntituleRisqueManquant(
        "L'intitulé du risque est obligatoire."
      );
    }
    if (!categories || categories.length === 0) {
      throw new ErreurCategoriesRisqueManquantes(
        'Les catégories de risque sont obligatoires.'
      );
    }
    const categoriesInconnues = categories.filter(
      (c) => !referentiel.identifiantsCategoriesRisque().includes(c)
    );
    if (categoriesInconnues.length > 0) {
      throw new ErreurCategorieRisqueInconnue(
        `La catégorie "${categoriesInconnues[0]}" n'est pas répertoriée`
      );
    }
  }
}

export default RisqueSpecifique;
