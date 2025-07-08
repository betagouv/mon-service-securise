const ElementsConstructibles = require('./elementsConstructibles');
const MesureSpecifique = require('./mesureSpecifique');
const Referentiel = require('../referentiel');
const {
  ErreurMesureInconnue,
  ErreurModeleDeMesureSpecifiqueIntrouvable,
} = require('../erreurs');

class MesuresSpecifiques extends ElementsConstructibles {
  constructor(
    donnees = {},
    referentiel = Referentiel.creeReferentielVide(),
    modelesDeMesureSpecifique = {}
  ) {
    const { mesuresSpecifiques = [] } = donnees;

    const mesuresCompletees = mesuresSpecifiques.map((m) => {
      const lieeAUnModele = m.idModele;
      if (!lieeAUnModele) return m;

      const modele = modelesDeMesureSpecifique[m.idModele];
      if (!modele)
        throw new ErreurModeleDeMesureSpecifiqueIntrouvable(m.idModele);

      const { description, descriptionLongue, categorie } = modele;

      return { ...m, description, descriptionLongue, categorie };
    });

    super(MesureSpecifique, { items: mesuresCompletees }, referentiel);
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

  ajouteMesure(mesure) {
    this.items.push(mesure);
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
