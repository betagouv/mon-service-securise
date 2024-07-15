const {
  ErreurDonneesReferentielIncorrectes,
  ErreurCategorieInconnue,
} = require('./erreurs');
const donneesParDefaut = require('../donneesReferentiel');

const donneesReferentielVide = {
  articlesDefinisReferentielsMesure: {},
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
  nouvellesFonctionnalites: [],
  provenancesService: {},
  statutsDeploiement: {},
  statutsMesures: {},
  tranchesIndicesCybers: [],
  nombreOrganisationsUtilisatrices: [],
  estimationNombreServices: [],
  etapesVisiteGuidee: [],
};

const creeReferentiel = (donneesReferentiel = donneesParDefaut) => {
  let donnees = donneesReferentiel;

  const statutsAvisDossierHomologation = () =>
    donnees.statutsAvisDossierHomologation || {};
  const statutHomologation = (idStatut) =>
    donnees.statutsHomologation[idStatut];
  const categoriesMesures = () => donnees.categoriesMesures;
  const descriptionCategorie = (idCategorie) =>
    categoriesMesures()[idCategorie];
  const identifiantsCategoriesMesures = () => Object.keys(categoriesMesures());
  const echeancesRenouvellement = () => donnees.echeancesRenouvellement || [];
  const estDocumentHomologation = (idDocument) =>
    donnees.documentsHomologation[idDocument] !== undefined;
  const descriptionEcheanceRenouvellement = (id) =>
    echeancesRenouvellement()[id]?.description;
  const delaisAvantImpactCritique = () => donnees.delaisAvantImpactCritique;
  const descriptionDelaiAvantImpactCritique = (id) =>
    delaisAvantImpactCritique()[id]?.description;
  const donneesCaracterePersonnel = () => donnees.donneesCaracterePersonnel;
  const descriptionDonneesCaracterePersonnel = (id) =>
    donneesCaracterePersonnel()[id]?.description;
  const descriptionsDonneesCaracterePersonnel = (ids) =>
    ids
      ?.map((id) => descriptionDonneesCaracterePersonnel(id))
      .filter((id) => id !== undefined);
  const etapesParcoursHomologation = (peutHomologuer = true) => {
    const etapes = donnees.etapesParcoursHomologation || [];
    if (peutHomologuer) return etapes;
    return etapes.filter((etape) => !etape.reserveePeutHomologuer);
  };
  const identifiantsEcheancesRenouvellement = () =>
    Object.keys(echeancesRenouvellement());
  const estIdentifiantEcheanceRenouvellementConnu = (idEcheance) =>
    identifiantsEcheancesRenouvellement().includes(idEcheance);
  const identifiantsStatutAvisDossierHomologation = () =>
    Object.keys(statutsAvisDossierHomologation());
  const estIdentifiantStatutAvisDossierHomologationConnu = (idStatut) =>
    identifiantsStatutAvisDossierHomologation().includes(idStatut);
  const fonctionnalites = () => donnees.fonctionnalites;
  const formatteListeDeReferentiels = (referentiels) => {
    const formatte = new Intl.ListFormat('fr', {
      type: 'conjunction',
    });
    const referentielsSansDoublon = new Set(
      referentiels.map(
        (r) => `${donnees.articlesDefinisReferentielsMesure[r] ?? ''}${r}`
      )
    );
    return formatte.format(referentielsSansDoublon);
  };
  const descriptionFonctionnalite = (id) => fonctionnalites()[id]?.description;
  const descriptionsFonctionnalites = (ids) =>
    ids
      ?.map((id) => descriptionFonctionnalite(id))
      .filter((id) => id !== undefined);
  const localisationsDonnees = () => donnees.localisationsDonnees;
  const identifiantsLocalisationsDonnees = () =>
    Object.keys(localisationsDonnees());
  const mesureIndispensable = (idMesure) =>
    !!donnees.mesures[idMesure].indispensable;
  const mesures = () => JSON.parse(JSON.stringify(donnees.mesures));
  const identifiantsMesures = () => Object.keys(mesures());
  const estIdentifiantMesureConnu = (id) => identifiantsMesures().includes(id);
  const mesure = (id) => mesures()[id];
  const typesService = () => donnees.typesService;
  const nbMoisDecalage = (idEcheance) =>
    echeancesRenouvellement()[idEcheance]?.nbMoisDecalage;
  const nbMoisBientotExpire = (idEcheance) =>
    echeancesRenouvellement()[idEcheance]?.nbMoisBientotExpire;
  const nbMoisRappelsExpiration = (idEcheance) =>
    echeancesRenouvellement()[idEcheance]?.rappelsExpirationMois;
  const niveauxGravite = () => donnees.niveauxGravite || {};
  const niveauGravite = (idNiveau) => niveauxGravite()[idNiveau] || {};
  const identifiantsNiveauxGravite = () => Object.keys(niveauxGravite() || {});
  const provenancesService = () => donnees.provenancesService;
  const reglesPersonnalisation = () => donnees.reglesPersonnalisation || {};
  const risques = () => donnees.risques;
  const identifiantsRisques = () => Object.keys(donnees.risques);
  const risque = (id) => risques()[id] || {};
  const definitionRisque = (idRisque) => risque(idRisque).definition;
  const descriptionRisque = (idRisque) => risque(idRisque).description;
  const statutsDeploiement = () => donnees.statutsDeploiement;
  const descriptionStatutDeploiement = (idStatut) =>
    statutsDeploiement()[idStatut]?.description;
  const statutDeploiementValide = (id) =>
    Object.keys(statutsDeploiement()).includes(id);
  const statutsMesures = () => donnees.statutsMesures;
  const descriptionStatutMesure = (idStatut) => statutsMesures()[idStatut];
  const departements = () => donneesReferentiel.departements || [];
  const codeDepartements = () =>
    donneesReferentiel.departements?.map((departement) => departement.code);
  const estCodeDepartement = (code) => codeDepartements().includes(code);
  const departement = (code) =>
    donneesReferentiel.departements?.find(
      (unDepartement) => unDepartement.code === code
    )?.nom;
  const nombreOrganisationsUtilisatrices = () =>
    donnees.nombreOrganisationsUtilisatrices || [];
  const estimationNombreServices = () => donnees.estimationNombreServices || [];

  const coefficientIndiceCyberMesuresIndispensables = () =>
    donnees.indiceCyber?.coefficientIndispensables || 0.5;

  const coefficientIndiceCyberMesuresRecommandees = () =>
    donnees.indiceCyber?.coefficientRecommandees || 0.5;

  const coefficientIndiceCyberStatutPartiel = () =>
    donnees.indiceCyber?.coefficientStatutPartiel || 0.5;

  const indiceCyberNoteMax = () => donnees.indiceCyber?.noteMax || 10;

  const verifieIndiceEstDansTranche = (indiceCyber, tranche) =>
    indiceCyber >= tranche.borneInferieure &&
    (tranche.borneSuperieureIncluse
      ? indiceCyber <= tranche.borneSuperieure
      : indiceCyber < tranche.borneSuperieure);

  const trancheIndiceCyber = (indiceCyber) =>
    donnees.tranchesIndicesCybers.find((tranche) =>
      verifieIndiceEstDansTranche(indiceCyber, tranche)
    ) || {};

  const descriptionsTranchesIndiceCyber = (indiceCyber) =>
    donnees.tranchesIndicesCybers
      .sort((a, b) => a.borneInferieure - b.borneInferieure)
      .map((tranche) => ({
        description: tranche.description,
        trancheCourante: verifieIndiceEstDansTranche(indiceCyber, tranche),
      }));

  const infosNiveauxGravite = (ordreInverse = false) => {
    const niveaux = Object.keys(niveauxGravite()).map((clef) => ({
      identifiant: clef,
      ...niveauGravite(clef),
    }));
    return ordreInverse ? niveaux.reverse() : niveaux;
  };

  const infosNiveauxGraviteConcernes = (ordreInverse) =>
    infosNiveauxGravite(ordreInverse).filter((niveau) => !niveau.nonConcerne);

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

  const numeroEtape = (idEtape) =>
    etapesParcoursHomologation().find((e) => e.id === idEtape)?.numero;

  const libelleEtape = (idEtape) =>
    etapesParcoursHomologation().find((e) => e.id === idEtape)?.libelle;

  const premiereEtapeParcours = () =>
    etapesParcoursHomologation().find((e) => e.numero === 1);

  const derniereEtapeParcours = (peutHomologuer = true) =>
    etapesParcoursHomologation(peutHomologuer).find(
      (e) =>
        e.numero ===
        Math.max(
          ...etapesParcoursHomologation(peutHomologuer).map(
            ({ numero }) => numero
          )
        )
    );

  const etapeExiste = (idEtape) =>
    etapesParcoursHomologation()
      .map((e) => e.id)
      .includes(idEtape);

  const idEtapeSuivante = (idEtape) => {
    const numeroSuivant = numeroEtape(idEtape) + 1;
    return etapesParcoursHomologation().find((e) => e.numero === numeroSuivant)
      .id;
  };

  const etapeSuffisantePourDossierDecision = (idEtape) => {
    const numeroEtapeSuffisante = numeroEtape(
      donnees.etapeNecessairePourDossierDecision
    );
    const numeroEtapeCourante = numeroEtape(idEtape);
    return numeroEtapeCourante >= numeroEtapeSuffisante;
  };

  const etapeDossierAutorisee = (idEtape, peutHomologuer) => {
    if (peutHomologuer) return idEtape;
    const etapesDisponibles = etapesParcoursHomologation(peutHomologuer);
    const numeroMaxDisponible = Math.max(
      ...etapesDisponibles.map((e) => e.numero)
    );
    const numeroEtapeAutorisee = Math.min(
      numeroEtape(idEtape),
      numeroMaxDisponible
    );
    return etapesDisponibles.find((e) => e.numero === numeroEtapeAutorisee)?.id;
  };

  const valideDonnees = () => {
    const sommeCoefficients =
      coefficientIndiceCyberMesuresIndispensables() +
      coefficientIndiceCyberMesuresRecommandees();

    if (sommeCoefficients !== 1) {
      throw new ErreurDonneesReferentielIncorrectes(
        `La somme des coefficients pour le calcul de l'indice cyber vaut ${sommeCoefficients}, alors qu'elle aurait dû valoir 1.`
      );
    }
  };

  const nouvellesFonctionnalites = () => donnees.nouvellesFonctionnalites || [];

  const tacheCompletudeProfil = (id) =>
    donnees.tachesCompletudeProfil.find((t) => t.id === id);

  const retoursUtilisateurMesure = () => donnees.retoursUtilisateurMesure || {};
  const retourUtilisateurMesureAvecId = (idRetour) =>
    retoursUtilisateurMesure()[idRetour] ?? null;

  const verifieCategoriesMesuresSontRepertoriees = (categories) => {
    const distinctes = [...new Set(categories)];
    const repertoriees = identifiantsCategoriesMesures();
    const categorieInconnue = distinctes.find((c) => !repertoriees.includes(c));

    if (categorieInconnue)
      throw new ErreurCategorieInconnue(
        `La catégorie "${categorieInconnue}" n'est pas répertoriée`
      );
  };

  const recharge = (nouvellesDonnees) => {
    donnees = { ...donneesReferentielVide, ...nouvellesDonnees };
    valideDonnees();
  };

  const enrichis = (nouvellesDonnees) => {
    donnees = { ...donnees, ...nouvellesDonnees };
    valideDonnees();
  };

  const etapeVisiteGuidee = (idEtape) => donnees.etapesVisiteGuidee[idEtape];
  const etapeVisiteGuideeExiste = (idEtape) =>
    Object.keys(donnees.etapesVisiteGuidee).includes(idEtape);
  const etapeSuivanteVisiteGuidee = (idEtapeCourante) =>
    donnees.etapesVisiteGuidee[idEtapeCourante]?.idEtapeSuivante ?? null;
  const etapePrecedenteVisiteGuidee = (idEtapeCourante) =>
    donnees.etapesVisiteGuidee[idEtapeCourante]?.idEtapePrecedente ?? null;
  const nbEtapesVisiteGuidee = () =>
    Object.keys(donnees.etapesVisiteGuidee || {}).length;
  const natureTachesService = (nature) =>
    (donnees.naturesTachesService || {})[nature];
  const natureSuggestionAction = (nature) =>
    (donnees.naturesSuggestionsActions || {})[nature];

  valideDonnees();

  return {
    categoriesMesures,
    codeDepartements,
    coefficientIndiceCyberMesuresIndispensables,
    coefficientIndiceCyberMesuresRecommandees,
    coefficientIndiceCyberStatutPartiel,
    indiceCyberNoteMax,
    definitionRisque,
    delaisAvantImpactCritique,
    departement,
    departements,
    derniereEtapeParcours,
    descriptionCategorie,
    descriptionDelaiAvantImpactCritique,
    descriptionDonneesCaracterePersonnel,
    descriptionEcheanceRenouvellement,
    descriptionFonctionnalite,
    descriptionRisque,
    descriptionStatutMesure,
    descriptionsTranchesIndiceCyber,
    descriptionsDonneesCaracterePersonnel,
    descriptionsFonctionnalites,
    donneesCaracterePersonnel,
    echeancesRenouvellement,
    enrichis,
    estCodeDepartement,
    estDocumentHomologation,
    estIdentifiantEcheanceRenouvellementConnu,
    estIdentifiantMesureConnu,
    estIdentifiantStatutAvisDossierHomologationConnu,
    estimationNombreServices,
    etapeDossierAutorisee,
    etapeExiste,
    etapesParcoursHomologation,
    etapeSuffisantePourDossierDecision,
    fonctionnalites,
    formatteListeDeReferentiels,
    identifiantsCategoriesMesures,
    identifiantsEcheancesRenouvellement,
    identifiantsLocalisationsDonnees,
    identifiantsMesures,
    identifiantsNiveauxGravite,
    identifiantsRisques,
    idEtapeSuivante,
    infosNiveauxGravite,
    infosNiveauxGraviteConcernes,
    libelleEtape,
    localisationDonnees,
    localisationsDonnees,
    mesure,
    mesureIndispensable,
    mesures,
    nbMoisDecalage,
    nbMoisBientotExpire,
    nbMoisRappelsExpiration,
    niveauGravite,
    niveauxGravite,
    nombreOrganisationsUtilisatrices,
    nouvellesFonctionnalites,
    numeroEtape,
    premiereEtapeParcours,
    provenancesService,
    recharge,
    reglesPersonnalisation,
    retoursUtilisateurMesure,
    retourUtilisateurMesureAvecId,
    risques,
    descriptionStatutDeploiement,
    statutsAvisDossierHomologation,
    statutsDeploiement,
    statutDeploiementValide,
    statutHomologation,
    statutsMesures,
    tacheCompletudeProfil,
    trancheIndiceCyber,
    typeService,
    typesService,
    verifieCategoriesMesuresSontRepertoriees,
    etapePrecedenteVisiteGuidee,
    etapeSuivanteVisiteGuidee,
    etapeVisiteGuidee,
    etapeVisiteGuideeExiste,
    nbEtapesVisiteGuidee,
    natureTachesService,
    natureSuggestionAction,
  };
};
const creeReferentielVide = () => creeReferentiel(donneesReferentielVide);

module.exports = { creeReferentiel, creeReferentielVide };
