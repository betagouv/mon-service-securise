const { neg } = require('./utils');

const creeReferentiel = (donneesReferentiel) => {
  let donnees = donneesReferentiel;

  const categoriesMesures = () => donnees.categoriesMesures;
  const identifiantsCategoriesMesures = () => Object.keys(categoriesMesures());
  const descriptionCategorie = (idCategorie) => donnees.categoriesMesures[idCategorie];
  const delaisAvantImpactCritique = () => donnees.delaisAvantImpactCritique;
  const donneesCaracterePersonnel = () => donnees.donneesCaracterePersonnel;
  const echeancesRenouvellement = () => donnees.echeancesRenouvellement;
  const identifiantsEcheancesRenouvellement = () => Object.keys(echeancesRenouvellement());
  const fonctionnalites = () => donnees.fonctionnalites;
  const localisationsDonnees = () => donnees.localisationsDonnees;
  const identifiantsLocalisationsDonnees = () => Object.keys(localisationsDonnees());
  const mesureIndispensable = (idMesure) => !!donnees.mesures[idMesure].indispensable;
  const mesures = () => donnees.mesures;
  const identifiantsMesures = () => Object.keys(mesures());
  const identifiantsMesuresIndispensables = () => identifiantsMesures().filter(mesureIndispensable);
  const identifiantsMesuresRecommandees = () => identifiantsMesures()
    .filter(neg(mesureIndispensable));
  const naturesService = () => donnees.naturesService;
  const provenancesService = () => donnees.provenancesService;
  const risques = () => donnees.risques;
  const identifiantsRisques = () => Object.keys(donnees.risques);

  const descriptionExpiration = (identifiant) => {
    if (!identifiant) return 'Information non renseignée';

    return donnees.echeancesRenouvellement[identifiant].expiration;
  };

  const localisationDonnees = (identifiant) => {
    if (!identifiant) return 'Localisation des données non renseignée';
    return localisationsDonnees()[identifiant].description;
  };

  const natureService = (identifiants) => {
    if (identifiants.length === 0) return 'Nature du service non renseignée';
    return identifiants
      .map((identifiant) => naturesService()[identifiant].description)
      .join(', ');
  };

  const recharge = (nouvellesDonnees) => (donnees = nouvellesDonnees);

  return {
    categoriesMesures,
    delaisAvantImpactCritique,
    descriptionCategorie,
    descriptionExpiration,
    donneesCaracterePersonnel,
    echeancesRenouvellement,
    fonctionnalites,
    identifiantsCategoriesMesures,
    identifiantsEcheancesRenouvellement,
    identifiantsLocalisationsDonnees,
    identifiantsMesures,
    identifiantsMesuresIndispensables,
    identifiantsMesuresRecommandees,
    identifiantsRisques,
    localisationDonnees,
    localisationsDonnees,
    mesureIndispensable,
    mesures,
    natureService,
    naturesService,
    provenancesService,
    recharge,
    risques,
  };
};

const creeReferentielVide = () => creeReferentiel({
  categoriesMesures: {},
  delaisAvantImpactCritique: {},
  documentsComplementaires: {},
  donneesCaracterePersonnel: {},
  echeancesRenouvellement: {},
  fonctionnalites: {},
  localisationsDonnees: {},
  mesures: {},
  risques: {},
  naturesService: {},
  provenancesService: {},
  seuilsCriticites: [],
});

module.exports = { creeReferentiel, creeReferentielVide };
