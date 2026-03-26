import ListeItems from './listeItems.js';
import InformationsService from './informationsService.js';
import { TousReferentiels } from '../referentiel.interface.js';

type Constructible<T> = new (
  data: Record<string, unknown>,
  referentiel: TousReferentiels
) => T;

class ElementsConstructibles<
  T extends InformationsService,
> extends ListeItems<T> {
  constructor(
    ClasseItem: Constructible<T>,
    donnees: { items: Array<Record<string, unknown>> },
    referentiel: TousReferentiels
  ) {
    super(
      (donneesItem) => new ClasseItem(donneesItem, referentiel),
      donnees,
      referentiel
    );
  }
}

export default ElementsConstructibles;
