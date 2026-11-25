import ItemsAvecDescription from './itemsAvecDescription.js';
import { DonneesItemAvecDescription } from './itemAvecDescription.js';
import { TousReferentiels } from '../referentiel.interface.js';

export type DonneesFonctionnalitesSpecifiques = {
  fonctionnalitesSpecifiques: Array<Partial<DonneesItemAvecDescription>>;
};

class FonctionnalitesSpecifiques extends ItemsAvecDescription {
  constructor(
    donnees: Partial<DonneesFonctionnalitesSpecifiques> = {},
    referentiel?: TousReferentiels
  ) {
    const { fonctionnalitesSpecifiques = [] } = donnees;
    super({ items: fonctionnalitesSpecifiques }, referentiel);
  }
}

export default FonctionnalitesSpecifiques;
