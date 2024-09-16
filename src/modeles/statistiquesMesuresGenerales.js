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

  constructor(
    { mesuresGenerales, mesuresPersonnalisees, mesuresSpecifiques = [] },
    referentiel,
    ignoreMesuresNonPrisesEnCompte = false
  ) {
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

    const filtreMesuresNonPriseEnCompte = (mesure) => {
      if (ignoreMesuresNonPrisesEnCompte) {
        return mesure.statut !== 'nonFait';
      }
      return true;
    };

    const mesuresGeneralesATraiter = Object.entries(mesuresPersonnalisees)
      .map(([id, mesurePerso]) => ({
        ...mesurePerso,
        ...mesuresGenerales.avecId(id),
        type: mesurePerso.indispensable ? 'indispensables' : 'recommandees',
      }))
      .filter(filtreMesuresNonPriseEnCompte);
    const mesuresSpecifiquesATraiter = mesuresSpecifiques
      .map((m) => ({
        ...m,
        type: 'recommandees', // Car les mesures "spécifiques" sont comptées au même titre que les mesures "recommandées"
      }))
      .filter(filtreMesuresNonPriseEnCompte);

    const mesuresATraiter = [
      ...mesuresGeneralesATraiter,
      ...mesuresSpecifiquesATraiter,
    ];
    mesuresATraiter.forEach((mesure) => {
      const { categorie, type } = mesure;
      const avecStatut = statutRenseigne(mesure?.statut);
      if (avecStatut) {
        this.parCategorie[categorie][mesure.statut] += 1;
        this.toutesCategories[mesure.statut] += 1;
      } else {
        this.parCategorie[categorie].sansStatut += 1;
        this.toutesCategories.sansStatut += 1;
      }

      this.parType[type].total += 1;
      this.parTypeEtParCategorie[type][categorie].total += 1;

      if (avecStatut) {
        this.parType[type][mesure.statut] += 1;
        this.parTypeEtParCategorie[type][categorie][mesure.statut] += 1;
      }

      const nonFaite = mesure?.statut !== STATUT_FAIT;
      const compteCommeRestante = nonFaite || !mesure.statut;
      if (compteCommeRestante) this.parType[type].restant += 1;

      const generaleSansStatut = mesure && !mesure.statut;
      const aRemplir = generaleSansStatut || !mesure.statut;
      if (aRemplir) {
        this.parType[type].aRemplir += 1;
        this.parTypeEtParCategorie[type][categorie].sansStatut += 1;
      }
    });
  }

  aLancer(idCategorie) {
    return this.parCategorie[idCategorie].aLancer;
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

  totauxParCategorie() {
    return this.toutesCategories;
  }
}

module.exports = { StatistiquesMesuresGenerales };
