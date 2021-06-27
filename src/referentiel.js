const creeReferentiel = (donnees) => {
  const natureService = (identifiants) => {
    if (identifiants.length === 0) return 'Nature du service non renseignée';
    return identifiants
      .map((identifiant) => donnees.naturesService[identifiant])
      .join(', ');
  };

  const naturesService = () => donnees.naturesService;
  const provenancesService = () => donnees.provenancesService;

  return { natureService, naturesService, provenancesService };
};

module.exports = { creeReferentiel };
