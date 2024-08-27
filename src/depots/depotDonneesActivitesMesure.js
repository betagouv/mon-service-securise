const creeDepot = (config = {}) => {
  const { adaptateurPersistance } = config;

  const ajouteActiviteMesure = (activite) =>
    adaptateurPersistance.ajouteActiviteMesure(
      activite.idActeur(),
      activite.idService(),
      activite.type,
      activite.details
    );

  return {
    ajouteActiviteMesure,
  };
};
module.exports = { creeDepot };
