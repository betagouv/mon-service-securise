const ElementsConstructibles = require('./elementsConstructibles');
const MesureSpecifique = require('./mesureSpecifique');
const Referentiel = require('../referentiel');
const {
  ErreurMesureInconnue,
  ErreurModeleDeMesureSpecifiqueIntrouvable,
  ErreurModeleDeMesureSpecifiqueDejaAssociee,
} = require('../erreurs');
const Mesure = require('./mesure');

class MesuresSpecifiques extends ElementsConstructibles {
  constructor(
    donnees = {},
    referentiel = Referentiel.creeReferentielVide(),
    modelesDisponiblesDeMesureSpecifique = {}
  ) {
    const { mesuresSpecifiques = [] } = donnees;

    const mesuresCompletees = MesuresSpecifiques.completeMesuresSpecifiques(
      mesuresSpecifiques,
      modelesDisponiblesDeMesureSpecifique
    );

    super(MesureSpecifique, { items: mesuresCompletees }, referentiel);
    this.modelesDisponiblesDeMesureSpecifique =
      modelesDisponiblesDeMesureSpecifique;
  }

  static completeMesuresSpecifiques(
    mesuresSpecifiques,
    modelesDisponiblesDeMesureSpecifique
  ) {
    return mesuresSpecifiques.map((m) => {
      const lieeAUnModele = m.idModele;
      if (!lieeAUnModele) return m;

      const modele = modelesDisponiblesDeMesureSpecifique[m.idModele];
      if (!modele)
        throw new ErreurModeleDeMesureSpecifiqueIntrouvable(m.idModele);

      const { description, descriptionLongue, categorie } = modele;

      return { ...m, description, descriptionLongue, categorie };
    });
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

  avecIdModele(idModele) {
    return this.toutes().find((m) => m.idModele === idModele);
  }

  detacheMesureDuModele(idModele) {
    this.items.forEach((m) => {
      if (m.idModele === idModele) {
        m.detacheDeSonModele();
      }
    });
  }

  supprimeMesureAssocieeAuModele(idModele) {
    this.items = this.items.filter((m) => m.idModele !== idModele);
  }

  associeAuModele(idModele, idNouvelleMesure) {
    const modele = this.modelesDisponiblesDeMesureSpecifique[idModele];

    const modeleInconnu = !modele;
    if (modeleInconnu)
      throw new ErreurModeleDeMesureSpecifiqueIntrouvable(idModele);

    const dejaAssociee = this.items.find((m) => m.idModele === idModele);
    if (dejaAssociee)
      throw new ErreurModeleDeMesureSpecifiqueDejaAssociee(
        idModele,
        dejaAssociee.id
      );

    const { description, descriptionLongue, categorie } = modele;
    this.items.push(
      new MesureSpecifique(
        {
          idModele,
          id: idNouvelleMesure,
          description,
          descriptionLongue,
          categorie,
          statut: Mesure.STATUT_A_LANCER,
        },
        this.referentiel
      )
    );
  }
}

module.exports = MesuresSpecifiques;
