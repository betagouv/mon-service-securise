const fusionneGeneraleEtPersonnalisee = (
  mesureGenerale,
  mesurePersonnalisee
) => {
  const [id, donnees] = mesurePersonnalisee;
  delete mesureGenerale?.id;
  return {
    [id]: { ...donnees, ...(mesureGenerale && { ...mesureGenerale }) },
  };
};

const donnees = (service, moteurRegles) => {
  const { mesuresGenerales, mesuresSpecifiques } = service.mesures.toJSON();

  const mesuresPersonnalisees = Object.entries(
    moteurRegles.mesures(service.descriptionService)
  ).reduce(
    (acc, mesurePersonnalisee) => ({
      ...acc,
      ...fusionneGeneraleEtPersonnalisee(
        mesuresGenerales.find((m) => m.id === mesurePersonnalisee[0]),
        mesurePersonnalisee
      ),
    }),
    {}
  );

  return {
    mesuresGenerales: mesuresPersonnalisees,
    mesuresSpecifiques,
  };
};

module.exports = { donnees };
