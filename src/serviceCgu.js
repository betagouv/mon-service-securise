const fabriqueServiceCgu = ({ referentiel }) => ({
  versionActuelle: () => referentiel.versionActuelleCgu(),
});

export default {
  fabriqueServiceCgu,
};
