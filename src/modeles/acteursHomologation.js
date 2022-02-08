const ElementsConstructibles = require('./elementsConstructibles');
const ActeurHomologation = require('./acteurHomologation');

class ActeursHomologation extends ElementsConstructibles {
  constructor(donnees) {
    super(ActeurHomologation, { items: donnees.acteursHomologation });
  }

  static proprietesItem() {
    return ActeurHomologation.proprietes();
  }
}

module.exports = ActeursHomologation;
