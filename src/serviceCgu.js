const fabriqueServiceCgu = ({ referentiel }) => ({
  versionActuelle: () => referentiel.versionActuelleCgu(),
});

module.exports = {
  fabriqueServiceCgu,
};
