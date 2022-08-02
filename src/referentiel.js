const { ErreurDonneesReferentielIncorrectes } = require('./erreurs');
const donneesParDefaut = require('../donneesReferentiel');

const creeReferentiel = (donneesReferentiel = donneesParDefaut) => {
  let donnees = donneesReferentiel;

  const actionsSaisie = () => donnees.actionsSaisie;
  const identifiantsActionsSaisie = () => Object.keys(actionsSaisie());
  const actionSaisie = (id) => actionsSaisie()[id] || {};
  const positionActionSaisie = (id) => actionSaisie(id).position;
  const categoriesMesures = () => donnees.categoriesMesures;
  const descriptionCategorie = (idCategorie) => categoriesMesures()[idCategorie];
  const identifiantsCategoriesMesures = () => Object.keys(categoriesMesures());
  const descriptionActionSaisie = (id) => actionSaisie(id).description;
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
  const mesure = (id) => mesures()[id];
  const typesService = () => donnees.typesService;
  const niveauxGravite = () => donnees.niveauxGravite || {};
  const niveauGravite = (idNiveau) => niveauxGravite()[idNiveau] || {};
  const identifiantsNiveauxGravite = () => Object.keys(niveauxGravite() || {});
  const provenancesService = () => donnees.provenancesService;
  const reglesPersonnalisation = () => donnees.reglesPersonnalisation || {};
  const risques = () => donnees.risques;
  const identifiantsRisques = () => Object.keys(donnees.risques);
  const risque = (id) => risques()[id] || {};
  const descriptionRisque = (idRisque) => risque(idRisque).description;
  const seuilsCriticites = () => donnees.seuilsCriticites;
  const statutsDeploiement = () => donnees.statutsDeploiement;
  const statutDeploiementValide = (id) => Object.keys(statutsDeploiement()).includes(id);
  const statutsMesures = () => donnees.statutsMesures;
  const descriptionStatutMesure = (idStatut) => statutsMesures()[idStatut];
  const departements = () => donneesReferentiel.departements || [];
  const codeDepartements = () => donneesReferentiel
    .departements?.map((departement) => departement.code);
  const departement = (code) => donneesReferentiel
    .departements?.find((unDepartement) => unDepartement.code === code)?.nom;

  const coefficientCyberscoreMesuresIndispensables = () => (
    donnees.cyberscore?.coefficientIndispensables || 0.5
  );

  const coefficientCyberscoreMesuresRecommandees = () => (
    donnees.cyberscore?.coefficientRecommandees || 0.5
  );

  const cyberscoreMax = () => donnees.cyberscore?.noteMax || 10;

  const actionSuivante = (id) => {
    const position = positionActionSaisie(id);
    return Object.keys(actionsSaisie()).find((a) => positionActionSaisie(a) === position + 1);
  };

  const infosNiveauxGravite = (ordreInverse = false) => {
    const niveaux = Object.values(niveauxGravite());
    return ordreInverse ? niveaux.reverse() : niveaux;
  };

  const descriptionExpiration = (identifiant) => {
    if (!identifiant) return 'Information non renseignée';

    return donnees.echeancesRenouvellement[identifiant].expiration;
  };

  const localisationDonnees = (identifiant) => {
    if (!identifiant) return 'Localisation des données non renseignée';
    return localisationsDonnees()[identifiant].description;
  };

  const typeService = (identifiants) => {
    if (identifiants.length === 0) return 'Type de service non renseignée';
    return identifiants
      .map((identifiant) => typesService()[identifiant].description)
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

  const valideDonnees = () => {
    const sommeCoefficients = coefficientCyberscoreMesuresIndispensables()
      + coefficientCyberscoreMesuresRecommandees();

    if (sommeCoefficients !== 1) {
      throw new ErreurDonneesReferentielIncorrectes(
        `La somme des coefficients pour le calcul du cyberscore vaut ${sommeCoefficients}, alors qu'elle aurait dû valoir 1.`
      );
    }
  };

  const recharge = (nouvellesDonnees) => {
    donnees = nouvellesDonnees;
    valideDonnees();
  };

  valideDonnees();

  return {
    actionsSaisie,
    actionSuivante,
    categoriesMesures,
    codeDepartements,
    coefficientCyberscoreMesuresIndispensables,
    coefficientCyberscoreMesuresRecommandees,
    criticite,
    criticiteDelai,
    criticiteDonnees,
    criticiteFonctionnalite,
    criticiteMax,
    cyberscoreMax,
    delaisAvantImpactCritique,
    departement,
    departements,
    descriptionActionSaisie,
    descriptionCategorie,
    descriptionExpiration,
    descriptionRisque,
    descriptionStatutMesure,
    donneesCaracterePersonnel,
    echeancesRenouvellement,
    fonctionnalites,
    identifiantsActionsSaisie,
    identifiantsCategoriesMesures,
    identifiantsEcheancesRenouvellement,
    identifiantsLocalisationsDonnees,
    identifiantsMesures,
    identifiantsNiveauxGravite,
    identifiantsRisques,
    infosNiveauxGravite,
    localisationDonnees,
    localisationsDonnees,
    mesure,
    mesureIndispensable,
    mesures,
    niveauGravite,
    niveauxGravite,
    positionActionSaisie,
    provenancesService,
    recharge,
    reglesPersonnalisation,
    risques,
    seuilCriticiteMin,
    seuilsCriticites,
    statutsDeploiement,
    statutDeploiementValide,
    statutsMesures,
    typeService,
    typesService,
  };
};

const creeReferentielVide = () => creeReferentiel({
  actionsSaisie: {},
  categoriesMesures: {},
  cyberscore: {},
  delaisAvantImpactCritique: {},
  donneesCaracterePersonnel: {},
  echeancesRenouvellement: {},
  fonctionnalites: {},
  localisationsDonnees: {},
  mesures: {},
  risques: {},
  typesService: {},
  niveauxGravite: {},
  provenancesService: {},
  seuilsCriticites: [],
  statutsDeploiement: {},
  statutsMesures: {},
});

module.exports = { creeReferentiel, creeReferentielVide };
