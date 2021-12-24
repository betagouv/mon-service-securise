const ListeItems = require('./listeItems');
const FonctionnaliteSpecifique = require('./fonctionnaliteSpecifique');

class FonctionnalitesSpecifiques extends ListeItems {
  constructor(donnees) {
    super(FonctionnaliteSpecifique, { items: donnees.fonctionnalitesSpecifiques });
  }
}

module.exports = FonctionnalitesSpecifiques;
