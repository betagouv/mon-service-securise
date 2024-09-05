const ElementsConstructibles = require('./elementsConstructibles');
const MesureSpecifique = require('./mesureSpecifique');
const Referentiel = require('../referentiel');
const { ErreurMesureInconnue } = require('../erreurs');

class MesuresSpecifiques extends ElementsConstructibles {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    const { mesuresSpecifiques = [] } = donnees;
    super(MesureSpecifique, { items: mesuresSpecifiques }, referentiel);
  }

  metsAJourMesure(mesure) {
    const index = this.items.findIndex((m) => m.id === mesure.id);
    if (index === -1) throw new ErreurMesureInconnue();
    this.items[index] = mesure;
  }

  parStatutEtCategorie(
    accumulateur = MesureSpecifique.accumulateurInitialStatuts(true)
  ) {
    return this.toutes().reduce((acc, mesure) => {
      if (!mesure.statut || !mesure.categorie) return acc;
      acc[mesure.statut][mesure.categorie] ||= [];
      acc[mesure.statut][mesure.categorie].push({
        description: mesure.descriptionMesure(),
        modalites: mesure.modalites,
      });
      return acc;
    }, accumulateur);
  }

  supprimeMesure(idMesure) {
    this.items = this.items.filter((m) => m.id !== idMesure);
  }

  supprimeResponsable(idUtilisateur) {
    this.toutes().forEach((m) => m.supprimeResponsable(idUtilisateur));
  }

  nombreDeSansStatut() {
    return this.toutes().filter((ms) => !ms.statutRenseigne()).length;
  }

  avecId(idMesure) {
    return this.toutes().find((m) => m.id === idMesure);
  }
}

module.exports = MesuresSpecifiques;
