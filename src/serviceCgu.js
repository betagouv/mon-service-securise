const fabriqueServiceCgu = ({ referentiel }) => ({
  versionActuelle: () => referentiel.versionActuelleCgu(),
});

export { fabriqueServiceCgu };
