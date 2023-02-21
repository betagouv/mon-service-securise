const { ErreurDonneesReferentielIncorrectes } = require('./erreurs');
const donneesParDefaut = require('../donneesReferentiel');

const donneesReferentielVide = {
  actionsSaisie: {},
  categoriesMesures: {},
  indiceCyber: {},
  delaisAvantImpactCritique: {},
  documentsHomologation: {},
  donneesCaracterePersonnel: {},
  echeancesRenouvellement: {},
  etapesParcoursHomologation: [],
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
};

const creeReferentiel = (donneesReferentiel = donneesParDefaut) => {
  let donnees = donneesReferentiel;

  const actionsSaisie = () => donnees.actionsSaisie || {};
  const identifiantsActionsSaisie = () => Object.keys(actionsSaisie());
  const actionSaisie = (id) => actionsSaisie()[id] || {};
  const positionActionSaisie = (id) => actionSaisie(id).position;
  const categoriesMesures = () => donnees.categoriesMesures;
  const descriptionCategorie = (idCategorie) => categoriesMesures()[idCategorie];
  const identifiantsCategoriesMesures = () => Object.keys(categoriesMesures());
  const descriptionActionSaisie = (id) => actionSaisie(id).description;
  const echeancesRenouvellement = () => donnees.echeancesRenouvellement || [];
  const estDocumentHomologation = (idDocument) => (
    donnees.documentsHomologation[idDocument] !== undefined
  );
  const tousDocumentsHomologation = () => Object
    .entries(donnees.documentsHomologation || {})
    .map(([id, document]) => ({ id, ...document }));
  const descriptionEcheanceRenouvellement = (id) => echeancesRenouvellement()[id]?.description;
  const delaisAvantImpactCritique = () => donnees.delaisAvantImpactCritique;
  const descriptionDelaiAvantImpactCritique = (id) => delaisAvantImpactCritique()[id]?.description;
  const donneesCaracterePersonnel = () => donnees.donneesCaracterePersonnel;
  const descriptionDonneesCaracterePersonnel = (id) => donneesCaracterePersonnel()[id]?.description;
  const descriptionsDonneesCaracterePersonnel = (ids) => ids
    ?.map((id) => descriptionDonneesCaracterePersonnel(id))
    .filter((id) => id !== undefined);
  const etapesParcoursHomologation = () => donnees.etapesParcoursHomologation || [];
  const identifiantsEcheancesRenouvellement = () => Object.keys(echeancesRenouvellement());
  const fonctionnalites = () => donnees.fonctionnalites;
  const descriptionFonctionnalite = (id) => fonctionnalites()[id]?.description;
  const descriptionsFonctionnalites = (ids) => ids
    ?.map((id) => descriptionFonctionnalite(id))
    .filter((id) => id !== undefined);
  const localisationsDonnees = () => donnees.localisationsDonnees;
  const identifiantsLocalisationsDonnees = () => Object.keys(localisationsDonnees());
  const mesureIndispensable = (idMesure) => !!donnees.mesures[idMesure].indispensable;
  const mesures = () => JSON.parse(JSON.stringify(donnees.mesures));
  const identifiantsMesures = () => Object.keys(mesures());
  const mesure = (id) => mesures()[id];
  const typesService = () => donnees.typesService;
  const nbMoisDecalage = (idEcheance) => echeancesRenouvellement()[idEcheance]?.nbMoisDecalage;
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
  const sousTitreActionSaisie = (id) => actionSaisie(id)?.sousTitre;
  const statutsDeploiement = () => donnees.statutsDeploiement;
  const descriptionStatutDeploiement = (idStatut) => statutsDeploiement()[idStatut]?.description;
  const statutDeploiementValide = (id) => Object.keys(statutsDeploiement()).includes(id);
  const statutsMesures = () => donnees.statutsMesures;
  const descriptionStatutMesure = (idStatut) => statutsMesures()[idStatut];
  const departements = () => donneesReferentiel.departements || [];
  const codeDepartements = () => donneesReferentiel
    .departements?.map((departement) => departement.code);
  const departement = (code) => donneesReferentiel
    .departements?.find((unDepartement) => unDepartement.code === code)?.nom;

  const coefficientIndiceCyberMesuresIndispensables = () => (
    donnees.indiceCyber?.coefficientIndispensables || 0.5
  );

  const coefficientIndiceCyberMesuresRecommandees = () => (
    donnees.indiceCyber?.coefficientRecommandees || 0.5
  );

  const indiceCyberNoteMax = () => donnees.indiceCyber?.noteMax || 10;

  const actionSuivante = (id) => {
    const position = positionActionSaisie(id);
    return Object.keys(actionsSaisie())
      .find((a) => positionActionSaisie(a) === position + 1);
  };

  const infosNiveauxGravite = (ordreInverse = false) => {
    const niveaux = Object.keys(niveauxGravite())
      .map((clef) => ({ identifiant: clef, ...niveauGravite(clef) }));
    return ordreInverse ? niveaux.reverse() : niveaux;
  };

  const infosNiveauxGraviteConcernes = (ordreInverse) => (
    infosNiveauxGravite(ordreInverse).filter((niveau) => !niveau.nonConcerne)
  );

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

  const etapeExiste = (numero) => etapesParcoursHomologation()
    .map((e) => e.numero)
    .includes(numero);

  const valideDonnees = () => {
    const sommeCoefficients = coefficientIndiceCyberMesuresIndispensables()
      + coefficientIndiceCyberMesuresRecommandees();

    if (sommeCoefficients !== 1) {
      throw new ErreurDonneesReferentielIncorrectes(
        `La somme des coefficients pour le calcul de l'indice cyber vaut ${sommeCoefficients}, alors qu'elle aurait dû valoir 1.`
      );
    }
  };

  const recharge = (nouvellesDonnees) => {
    donnees = { ...donneesReferentielVide, ...nouvellesDonnees };
    valideDonnees();
  };

  valideDonnees();

  return {
    actionsSaisie,
    actionSuivante,
    categoriesMesures,
    codeDepartements,
    coefficientIndiceCyberMesuresIndispensables,
    coefficientIndiceCyberMesuresRecommandees,
    criticite,
    criticiteDelai,
    criticiteDonnees,
    criticiteFonctionnalite,
    criticiteMax,
    indiceCyberNoteMax,
    delaisAvantImpactCritique,
    departement,
    departements,
    descriptionActionSaisie,
    descriptionCategorie,
    descriptionDelaiAvantImpactCritique,
    descriptionDonneesCaracterePersonnel,
    descriptionEcheanceRenouvellement,
    descriptionExpiration,
    descriptionFonctionnalite,
    descriptionRisque,
    descriptionStatutMesure,
    descriptionsDonneesCaracterePersonnel,
    descriptionsFonctionnalites,
    donneesCaracterePersonnel,
    echeancesRenouvellement,
    estDocumentHomologation,
    tousDocumentsHomologation,
    etapeExiste,
    etapesParcoursHomologation,
    fonctionnalites,
    identifiantsActionsSaisie,
    identifiantsCategoriesMesures,
    identifiantsEcheancesRenouvellement,
    identifiantsLocalisationsDonnees,
    identifiantsMesures,
    identifiantsNiveauxGravite,
    identifiantsRisques,
    infosNiveauxGravite,
    infosNiveauxGraviteConcernes,
    localisationDonnees,
    localisationsDonnees,
    mesure,
    mesureIndispensable,
    mesures,
    nbMoisDecalage,
    niveauGravite,
    niveauxGravite,
    positionActionSaisie,
    provenancesService,
    recharge,
    reglesPersonnalisation,
    risques,
    seuilCriticiteMin,
    seuilsCriticites,
    descriptionStatutDeploiement,
    sousTitreActionSaisie,
    statutsDeploiement,
    statutDeploiementValide,
    statutsMesures,
    typeService,
    typesService,
  };
};

const creeReferentielVide = () => creeReferentiel(donneesReferentielVide);

module.exports = { creeReferentiel, creeReferentielVide };
