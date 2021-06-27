const creeReferentiel = (donnees) => {
  const natureService = (identifiants) => {
    if (identifiants.length === 0) return 'Nature du service non renseignée';
    return identifiants
      .map((identifiant) => donnees.naturesService[identifiant])
      .join(', ');
  };

  const naturesService = () => donnees.naturesService;

  return { natureService, naturesService };
};

module.exports = { creeReferentiel };
