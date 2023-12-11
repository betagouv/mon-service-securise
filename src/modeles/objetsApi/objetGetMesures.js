const donnees = (service, moteurRegles) => {
  const { mesuresGenerales, mesuresSpecifiques } = service.mesures.toJSON();

  const mesuresPersonnalisees = Object.entries(
    moteurRegles.mesures(service.descriptionService)
  ).reduce((acc, [idMesure, donneesMesure]) => {
    const mesure = mesuresGenerales.find((m) => m.id === idMesure);
    if (mesure) delete mesure.id;
    return {
      ...acc,
      [idMesure]: {
        ...donneesMesure,
        ...(mesure && { ...mesure }),
      },
    };
  }, {});

  return {
    mesuresGenerales: mesuresPersonnalisees,
    mesuresSpecifiques,
  };
};

module.exports = { donnees };
