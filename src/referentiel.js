const creeReferentiel = (donneesReferentiel) => {
  let donnees = donneesReferentiel;

  const natureService = (identifiants) => {
    if (identifiants.length === 0) return 'Nature du service non renseignée';
    return identifiants
      .map((identifiant) => donnees.naturesService[identifiant].description)
      .join(', ');
  };

  const recharge = (nouvellesDonnees) => (donnees = nouvellesDonnees);

  const delaisAvantImpactCritique = () => donnees.delaisAvantImpactCritique;
  const donneesCaracterePersonnel = () => donnees.donneesCaracterePersonnel;
  const fonctionnalites = () => donnees.fonctionnalites;
  const localisationsDonnees = () => donnees.localisationsDonnees;
  const identifiantsLocalisationsDonnees = () => Object.keys(localisationsDonnees());
  const mesures = () => donnees.mesures;
  const identifiantsMesures = () => Object.keys(mesures());
  const naturesService = () => donnees.naturesService;
  const provenancesService = () => donnees.provenancesService;

  return {
    delaisAvantImpactCritique,
    donneesCaracterePersonnel,
    fonctionnalites,
    localisationsDonnees,
    identifiantsLocalisationsDonnees,
    identifiantsMesures,
    mesures,
    natureService,
    naturesService,
    provenancesService,
    recharge,
  };
};

const creeReferentielVide = () => creeReferentiel({
  delaisAvantImpactCritique: {},
  donneesCaracterePersonnel: {},
  fonctionnalites: {},
  localisationsDonnees: {},
  mesures: {},
  naturesService: {},
  provenancesService: {},
});

module.exports = { creeReferentiel, creeReferentielVide };
