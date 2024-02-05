const { STATUT_FAIT } = require('./mesure');

const statutsMesuresAZero = (referentiel, statutsComplementaires) =>
  Object.keys(referentiel.statutsMesures()).reduce(
    (acc, statut) => ({ ...acc, [statut]: 0 }),
    statutsComplementaires
  );

const initialiseStatsParCategorie = (referentiel) =>
  referentiel.identifiantsCategoriesMesures().reduce(
    (acc, categorie) => ({
      ...acc,
      [categorie]: statutsMesuresAZero(referentiel, { sansStatut: 0 }),
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
    };

    Object.entries(mesuresPersonnalisees).forEach(([id, mesurePerso]) => {
      const generale = mesuresGenerales.avecId(id);

      const { categorie } = mesurePerso;
      const avecStatut = generale?.statut;
      if (avecStatut) this.parCategorie[categorie][generale.statut] += 1;
      else this.parCategorie[categorie].sansStatut += 1;

      const { indispensable } = mesurePerso;
      if (indispensable) {
        this.parType.indispensables.total += 1;

        if (avecStatut) this.parType.indispensables[generale.statut] += 1;

        const seulementMesurePerso = !generale; // Seulement une mesure perso : signifie "sans statut"

        const nonFaite = generale?.statut !== STATUT_FAIT;
        const compteCommeRestante = nonFaite || seulementMesurePerso;
        if (compteCommeRestante) this.parType.indispensables.restant += 1;

        const generaleSansStatut = generale && !generale.statut;
        const aRemplir = generaleSansStatut || seulementMesurePerso;
        if (aRemplir) this.parType.indispensables.aRemplir += 1;
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

  indispensables() {
    return this.parType.indispensables;
  }
}

module.exports = { StatistiquesMesuresGenerales };
