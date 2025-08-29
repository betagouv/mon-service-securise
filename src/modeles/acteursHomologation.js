import ElementsConstructibles from './elementsConstructibles.js';
import ActeurHomologation from './acteurHomologation.js';

class ActeursHomologation extends ElementsConstructibles {
  constructor(donnees) {
    super(ActeurHomologation, { items: donnees.acteursHomologation });
  }

  static proprietesItem() {
    return ActeurHomologation.proprietes();
  }
}

export default ActeursHomologation;
