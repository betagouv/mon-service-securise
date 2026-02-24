import InformationsService from './informationsService.js';
import { Referentiel } from '../referentiel.interface.js';

class ListeItems<
  TItem extends InformationsService,
> extends InformationsService {
  items: TItem[];
  readonly referentiel: Referentiel;

  constructor(
    fonctionCreation: (donnees: Record<string, unknown>) => TItem,
    donnees: { items: Array<Record<string, unknown>> },
    referentiel: Referentiel
  ) {
    super();
    const { items } = donnees;
    this.items = items.map(fonctionCreation);
    this.referentiel = referentiel;
  }

  item(index: number) {
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

export default ListeItems;
