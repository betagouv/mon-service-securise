const ListeItems = require('./listeItems');
const ActeurHomologation = require('./acteurHomologation');

class ActeursHomologation extends ListeItems {
  constructor(donnees) {
    super(ActeurHomologation, { items: donnees.acteursHomologation });
  }

  static proprietesItem() {
    return ActeurHomologation.proprietes();
  }
}

module.exports = ActeursHomologation;
