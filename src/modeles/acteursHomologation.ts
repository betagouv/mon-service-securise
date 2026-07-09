import ElementsConstructibles from './elementsConstructibles.js';
import ActeurHomologation, {
  DonneesActeurHomologation,
} from './acteurHomologation.js';
import { TousReferentiels } from '../referentiel.interface.js';
import { creeReferentielVide } from '../referentiel.js';

type DonneesActeursHomologation = {
  acteursHomologation: DonneesActeurHomologation[];
};

class ActeursHomologation extends ElementsConstructibles<ActeurHomologation> {
  constructor(
    donnees: Partial<DonneesActeursHomologation> = {},
    referentiel: TousReferentiels = creeReferentielVide()
  ) {
    super(
      ActeurHomologation,
      { items: donnees.acteursHomologation ?? [] },
      referentiel
    );
  }

  static proprietesItem() {
    return ActeurHomologation.proprietes();
  }
}

export default ActeursHomologation;
