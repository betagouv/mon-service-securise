const creeReferentiel = (donneesReferentiel) => {
  let donnees = donneesReferentiel;

  const delaisAvantImpactCritique = () => donnees.delaisAvantImpactCritique;
  const donneesCaracterePersonnel = () => donnees.donneesCaracterePersonnel;
  const fonctionnalites = () => donnees.fonctionnalites;
  const localisationsDonnees = () => donnees.localisationsDonnees;
  const identifiantsLocalisationsDonnees = () => Object.keys(localisationsDonnees());
  const mesures = () => donnees.mesures;
  const identifiantsMesures = () => Object.keys(mesures());
  const naturesService = () => donnees.naturesService;
  const provenancesService = () => donnees.provenancesService;
  const risques = () => donnees.risques;
  const identifiantsRisques = () => Object.keys(donnees.risques);

  const natureService = (identifiants) => {
    if (identifiants.length === 0) return 'Nature du service non renseignée';
    return identifiants
      .map((identifiant) => naturesService()[identifiant].description)
      .join(', ');
  };

  const localisationDonnees = (identifiant) => {
    if (!identifiant) return 'Localisation des données non renseignée';
    return localisationsDonnees()[identifiant].description;
  };

  const recharge = (nouvellesDonnees) => (donnees = nouvellesDonnees);

  return {
    delaisAvantImpactCritique,
    donneesCaracterePersonnel,
    fonctionnalites,
    identifiantsLocalisationsDonnees,
    identifiantsMesures,
    identifiantsRisques,
    localisationDonnees,
    localisationsDonnees,
    mesures,
    natureService,
    naturesService,
    provenancesService,
    recharge,
    risques,
  };
};

const creeReferentielVide = () => creeReferentiel({
  delaisAvantImpactCritique: {},
  donneesCaracterePersonnel: {},
  fonctionnalites: {},
  localisationsDonnees: {},
  mesures: {},
  risques: {},
  naturesService: {},
  provenancesService: {},
});

module.exports = { creeReferentiel, creeReferentielVide };
