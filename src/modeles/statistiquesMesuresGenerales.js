const { STATUT_FAIT, statutRenseigne } = require('./mesure');

const statutsMesuresAZero = (referentiel, statutsComplementaires) =>
  Object.keys(referentiel.statutsMesures()).reduce(
    (acc, statut) => ({ ...acc, [statut]: 0 }),
    statutsComplementaires
  );

const initialiseStatsParCategorie = (referentiel, complementaire) =>
  referentiel.identifiantsCategoriesMesures().reduce(
    (acc, categorie) => ({
      ...acc,
      [categorie]: statutsMesuresAZero(referentiel, {
        sansStatut: 0,
        ...complementaire,
      }),
    }),
    {}
  );

class StatistiquesMesuresGenerales {
  static valide({ mesuresPersonnalisees }, referentiel) {
    referentiel.verifieCategoriesMesuresSontRepertoriees(
      Object.values(mesuresPersonnalisees).map((m) => m.categorie)
    );
  }

  constructor({ mesuresGenerales, mesuresPersonnalisees }, referentiel) {
    StatistiquesMesuresGenerales.valide({ mesuresPersonnalisees }, referentiel);

    this.parCategorie = initialiseStatsParCategorie(referentiel);
    const complementaires = () => ({ total: 0, restant: 0, aRemplir: 0 });
    this.parType = {
      indispensables: statutsMesuresAZero(referentiel, complementaires()),
      recommandees: statutsMesuresAZero(referentiel, complementaires()),
    };
    this.toutesCategories = statutsMesuresAZero(referentiel, { sansStatut: 0 });
    this.parTypeEtParCategorie = {
      indispensables: initialiseStatsParCategorie(referentiel, { total: 0 }),
      recommandees: initialiseStatsParCategorie(referentiel, { total: 0 }),
    };

    Object.entries(mesuresPersonnalisees).forEach(([id, mesurePerso]) => {
      const generale = mesuresGenerales.avecId(id);

      const { categorie } = mesurePerso;
      const avecStatut = statutRenseigne(generale?.statut);
      if (avecStatut) {
        this.parCategorie[categorie][generale.statut] += 1;
        this.toutesCategories[generale.statut] += 1;
      } else {
        this.parCategorie[categorie].sansStatut += 1;
        this.toutesCategories.sansStatut += 1;
      }

      const { indispensable } = mesurePerso;
      const type = indispensable ? 'indispensables' : 'recommandees';

      this.parType[type].total += 1;
      this.parTypeEtParCategorie[type][categorie].total += 1;

      if (avecStatut) {
        this.parType[type][generale.statut] += 1;
        this.parTypeEtParCategorie[type][categorie][generale.statut] += 1;
      }

      const seulementMesurePerso = !generale; // Seulement une mesure perso : signifie "sans statut"

      const nonFaite = generale?.statut !== STATUT_FAIT;
      const compteCommeRestante = nonFaite || seulementMesurePerso;
      if (compteCommeRestante) this.parType[type].restant += 1;

      const generaleSansStatut = generale && !generale.statut;
      const aRemplir = generaleSansStatut || seulementMesurePerso;
      if (aRemplir) {
        this.parType[type].aRemplir += 1;
        this.parTypeEtParCategorie[type][categorie].sansStatut += 1;
      }
    });
  }

  faites(idCategorie) {
    return this.parCategorie[idCategorie].fait;
  }

  enCours(idCategorie) {
    return this.parCategorie[idCategorie].enCours;
  }

  nonFaites(idCategorie) {
    return this.parCategorie[idCategorie].nonFait;
  }

  sansStatut(idCategorie) {
    return this.parCategorie[idCategorie].sansStatut;
  }

  sansStatutToutesCategories() {
    return this.toutesCategories.sansStatut;
  }

  indispensables() {
    return this.parType.indispensables;
  }

  recommandees() {
    return this.parType.recommandees;
  }

  totauxParTypeEtParCategorie() {
    return this.parTypeEtParCategorie;
  }
}

module.exports = { StatistiquesMesuresGenerales };
