const creeDepot = (config = {}) => {
  const { adaptateurPersistance } = config;

  const ajouteActiviteMesure = (activite) => {
    adaptateurPersistance.ajouteActiviteMesure(
      activite.acteurId(),
      activite.serviceId(),
      activite.type,
      activite.details
    );
  };

  return {
    ajouteActiviteMesure,
  };
};
module.exports = { creeDepot };
