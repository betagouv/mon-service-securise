const ListeItems = require('./listeItems');
const FonctionnaliteSupplementaire = require('./fonctionnaliteSupplementaire');

class FonctionnalitesSupplementaires extends ListeItems {
  constructor(donnees) {
    super(FonctionnaliteSupplementaire, { items: donnees.fonctionnalitesSupplementaires });
  }
}

module.exports = FonctionnalitesSupplementaires;
