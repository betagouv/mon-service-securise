import ItemsAvecDescription from './itemsAvecDescription.js';
import { DonneesItemAvecDescription } from './itemAvecDescription.js';
import { TousReferentiels } from '../referentiel.interface.js';

export type DonneesDonneesSensiblesSpecifiques = {
  donneesSensiblesSpecifiques: Array<Partial<DonneesItemAvecDescription>>;
};

class DonneesSensiblesSpecifiques extends ItemsAvecDescription {
  constructor(
    donnees: Partial<DonneesDonneesSensiblesSpecifiques> = {},
    referentiel?: TousReferentiels
  ) {
    const { donneesSensiblesSpecifiques = [] } = donnees;
    super({ items: donneesSensiblesSpecifiques }, referentiel);
  }
}

export default DonneesSensiblesSpecifiques;
