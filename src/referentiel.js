const creeReferentiel = (donneesReferentiel) => {
  let donnees = donneesReferentiel;

  const categoriesMesures = () => donnees.categoriesMesures;
  const descriptionCategorie = (idCategorie) => categoriesMesures()[idCategorie];
  const identifiantsCategoriesMesures = () => Object.keys(categoriesMesures());
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
  const naturesService = () => donnees.naturesService;
  const provenancesService = () => donnees.provenancesService;
  const risques = () => donnees.risques;
  const identifiantsRisques = () => Object.keys(donnees.risques);
  const seuilsCriticites = () => donnees.seuilsCriticites;
  const statutsMesures = () => donnees.statutsMesures;
  const descriptionStatutMesure = (idStatut) => statutsMesures()[idStatut];

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

  const seuilCriticiteMin = () => {
    const seuils = seuilsCriticites();
    return seuils[seuils.length - 1];
  };

  const criticiteElement = (nomElement, idElement) => (
    idElement ? donnees[nomElement][idElement].seuilCriticite : seuilCriticiteMin()
  );

  const criticiteDelai = (...params) => criticiteElement('delaisAvantImpactCritique', ...params);
  const criticiteDonnees = (...params) => criticiteElement('donneesCaracterePersonnel', ...params);
  const criticiteFonctionnalite = (...params) => criticiteElement('fonctionnalites', ...params);

  const criticiteMax = (...criticites) => {
    const seuils = seuilsCriticites();
    const positionMin = Math.min(...(criticites.map((c) => seuils.indexOf(c))));
    return seuils[positionMin];
  };

  const criticite = (idsFonctionnalites, idsDonnees, idDelai) => {
    const seuils = seuilsCriticites();
    const seuilMin = seuilCriticiteMin();

    const criticiteMaxFonctionnalites = idsFonctionnalites.length
      ? seuils.find((s) => idsFonctionnalites.find((id) => criticiteFonctionnalite(id) === s))
      : seuilMin;

    const criticiteMaxDonnees = idsDonnees.length
      ? seuils.find((s) => idsDonnees.find((d) => criticiteDonnees(d) === s))
      : seuilMin;

    return criticiteMax(criticiteMaxFonctionnalites, criticiteMaxDonnees, criticiteDelai(idDelai));
  };

  const recharge = (nouvellesDonnees) => (donnees = nouvellesDonnees);

  return {
    categoriesMesures,
    criticite,
    criticiteDelai,
    criticiteDonnees,
    criticiteFonctionnalite,
    criticiteMax,
    delaisAvantImpactCritique,
    descriptionCategorie,
    descriptionExpiration,
    descriptionStatutMesure,
    donneesCaracterePersonnel,
    echeancesRenouvellement,
    fonctionnalites,
    identifiantsCategoriesMesures,
    identifiantsEcheancesRenouvellement,
    identifiantsLocalisationsDonnees,
    identifiantsMesures,
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
    seuilCriticiteMin,
    seuilsCriticites,
    statutsMesures,
  };
};

const creeReferentielVide = () => creeReferentiel({
  categoriesMesures: {},
  delaisAvantImpactCritique: {},
  donneesCaracterePersonnel: {},
  echeancesRenouvellement: {},
  fonctionnalites: {},
  localisationsDonnees: {},
  mesures: {},
  risques: {},
  naturesService: {},
  provenancesService: {},
  seuilsCriticites: [],
  statutsMesures: {},
});

module.exports = { creeReferentiel, creeReferentielVide };
