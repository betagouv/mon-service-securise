import ElementsConstructibles from './elementsConstructibles.js';
import ActeurHomologation, {
  DonneesActeurHomologation,
} from './acteurHomologation.js';

export type DonneesActeursHomologation = {
  acteursHomologation: Array<DonneesActeurHomologation>;
};

class ActeursHomologation extends ElementsConstructibles<ActeurHomologation> {
  constructor(donnees: DonneesActeursHomologation) {
    super(ActeurHomologation, { items: donnees.acteursHomologation });
  }

  static proprietesItem() {
    return ActeurHomologation.proprietes();
  }
}

export default ActeursHomologation;
