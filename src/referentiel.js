const creeReferentiel = (donnees) => {
  const natureService = (identifiants) => {
    if (identifiants.length === 0) return 'Nature du service non renseignée';
    return identifiants
      .map((identifiant) => donnees.naturesService[identifiant].description)
      .join(', ');
  };

  const delaisAvantImpactCritique = () => donnees.delaisAvantImpactCritique;
  const donneesCaracterePersonnel = () => donnees.donneesCaracterePersonnel;
  const fonctionnalites = () => donnees.fonctionnalites;
  const naturesService = () => donnees.naturesService;
  const provenancesService = () => donnees.provenancesService;

  return {
    delaisAvantImpactCritique,
    donneesCaracterePersonnel,
    fonctionnalites,
    natureService,
    naturesService,
    provenancesService,
  };
};

const creeReferentielVide = () => creeReferentiel({
  naturesService: {},
  provenancesService: {},
  fonctionnalites: {},
  donneesCaracterePersonnel: {},
  delaisAvantImpactCritique: {},
});

module.exports = { creeReferentiel, creeReferentielVide };
