const creeDepot = (config = {}) => {
  const { adaptateurPersistance } = config;

  const ajouteActiviteMesure = (activite) =>
    adaptateurPersistance.ajouteActiviteMesure(
      activite.idActeur,
      activite.idService,
      activite.idMesure,
      activite.type,
      activite.details
    );

  const lisActivitesMesure = async (idService, idMesure) => {
    const activitesMesure = await adaptateurPersistance.activitesMesure(
      idService,
      idMesure
    );
    return activitesMesure.map((a) => ({ ...a, date: new Date(a.date) }));
  };

  return {
    ajouteActiviteMesure,
    lisActivitesMesure,
  };
};
module.exports = { creeDepot };
