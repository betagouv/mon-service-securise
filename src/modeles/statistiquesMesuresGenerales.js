const initialiseStatsParCategorie = (referentiel) => {
  const statutsMesuresAZero = () =>
    Object.keys(referentiel.statutsMesures()).reduce(
      (acc, statut) => ({ ...acc, [statut]: 0 }),
      { sansStatut: 0 }
    );
  return referentiel
    .identifiantsCategoriesMesures()
    .reduce(
      (acc, categorie) => ({ ...acc, [categorie]: statutsMesuresAZero() }),
      {}
    );
};

class StatistiquesMesuresGenerales {
  static valide({ mesuresPersonnalisees }, referentiel) {
    referentiel.verifieCategoriesMesuresSontRepertoriees(
      Object.values(mesuresPersonnalisees).map((m) => m.categorie)
    );
  }

  constructor({ mesuresGenerales, mesuresPersonnalisees }, referentiel) {
    StatistiquesMesuresGenerales.valide({ mesuresPersonnalisees }, referentiel);

    this.parCategorie = initialiseStatsParCategorie(referentiel);

    Object.entries(mesuresPersonnalisees).forEach(([id, mesurePerso]) => {
      const { categorie } = mesurePerso;
      const existante = mesuresGenerales.avecId(id);
      const avecStatut = existante && existante.statut;
      if (avecStatut) this.parCategorie[categorie][existante.statut] += 1;
      else this.parCategorie[categorie].sansStatut += 1;
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
}

module.exports = { StatistiquesMesuresGenerales };
