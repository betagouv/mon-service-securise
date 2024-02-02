const initialiseStatsParCategorie = (referentiel) => {
  const statutsMesuresAZero = () =>
    Object.keys(referentiel.statutsMesures()).reduce(
      (acc, statut) => ({ ...acc, [statut]: 0 }),
      {}
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
    mesuresGenerales.toutes().forEach((mesure) => {
      const { categorie } = mesuresPersonnalisees[mesure.id];
      this.parCategorie[categorie][mesure.statut] += 1;
    });
  }

  faites(idCategorie) {
    return this.parCategorie[idCategorie].fait;
  }
}

module.exports = { StatistiquesMesuresGenerales };
