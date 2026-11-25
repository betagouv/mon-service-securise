import ItemsAvecDescription from './itemsAvecDescription.js';
import { DonneesItemAvecDescription } from './itemAvecDescription.js';
import { TousReferentiels } from '../referentiel.interface.js';

export type DonneesPointsAcces = {
  pointsAcces: Array<Partial<DonneesItemAvecDescription>>;
};

class PointsAcces extends ItemsAvecDescription {
  constructor(
    donnees: Partial<DonneesPointsAcces> = {},
    referentiel?: TousReferentiels
  ) {
    const { pointsAcces = [] } = donnees;
    super({ items: pointsAcces }, referentiel);
  }
}

export default PointsAcces;
