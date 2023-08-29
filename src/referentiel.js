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
  nouvellesFonctionnalites: [],
  provenancesService: {},
  statutsDeploiement: {},
  statutsMesures: {},
  tranchesIndicesCybers: [],
};

const creeReferentiel = (donneesReferentiel = donneesParDefaut) => {
  let donnees = donneesReferentiel;

  const actionsSaisie = () => donnees.actionsSaisie || {};
  const identifiantsActionsSaisie = () => Object.keys(actionsSaisie());
  const actionSaisie = (id) => actionsSaisie()[id] || {};
  const premiereActionSaisie = () => {
    const [id, champs] = Object.entries(actionsSaisie()).find(
      ([_id, { position }]) => position === 0
    );

    return { id, ...champs };
  };
  const statutsAvisDossierHomologation = () =>
    donnees.statutsAvisDossierHomologation || {};
  const statutHomologation = (idStatut) =>
    donnees.statutsHomologation[idStatut];
  const positionActionSaisie = (id) => actionSaisie(id).position;
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
  const etapesParcoursHomologation = () =>
    donnees.etapesParcoursHomologation || [];
  const identifiantsEcheancesRenouvellement = () =>
    Object.keys(echeancesRenouvellement());
  const estIdentifiantEcheanceRenouvellementConnu = (idEcheance) =>
    identifiantsEcheancesRenouvellement().includes(idEcheance);
  const identifiantsStatutAvisDossierHomologation = () =>
    Object.keys(statutsAvisDossierHomologation());
  const estIdentifiantStatutAvisDossierHomologationConnu = (idStatut) =>
    identifiantsStatutAvisDossierHomologation().includes(idStatut);
  const fonctionnalites = () => donnees.fonctionnalites;
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
  const mesure = (id) => mesures()[id];
  const typesService = () => donnees.typesService;
  const nbMoisDecalage = (idEcheance) =>
    echeancesRenouvellement()[idEcheance]?.nbMoisDecalage;
  const nbMoisBientotExpire = (idEcheance) =>
    echeancesRenouvellement()[idEcheance]?.nbMoisBientotExpire;
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
  const nouvelleFonctionnalite = (id) =>
    donnees.nouvellesFonctionnalites.find(
      (fonctionnalite) => fonctionnalite.id === id
    );

  const coefficientIndiceCyberMesuresIndispensables = () =>
    donnees.indiceCyber?.coefficientIndispensables || 0.5;

  const coefficientIndiceCyberMesuresRecommandees = () =>
    donnees.indiceCyber?.coefficientRecommandees || 0.5;

  const indiceCyberNoteMax = () => donnees.indiceCyber?.noteMax || 10;

  const trancheIndiceCyber = (indiceCyber) =>
    donnees.tranchesIndicesCybers.find(
      (tranche) =>
        indiceCyber >= tranche.borneInferieure &&
        (tranche.borneSuperieureIncluse
          ? indiceCyber <= tranche.borneSuperieure
          : indiceCyber < tranche.borneSuperieure)
    ) || {};

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

  const premiereEtapeParcours = () =>
    etapesParcoursHomologation().find((e) => e.numero === 1);

  const derniereEtapeParcours = () =>
    etapesParcoursHomologation().find(
      (e) =>
        e.numero ===
        Math.max(...etapesParcoursHomologation().map(({ numero }) => numero))
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

  const derniereNouvelleFonctionnalite = (dateDeReference) => {
    const fonctionnalitesDechronologique = donnees.nouvellesFonctionnalites
      .filter(
        (fonctionnalite) =>
          new Date(fonctionnalite.dateDeDeploiement) < dateDeReference
      )
      .sort(
        (a, b) => new Date(b.dateDeDeploiement) - new Date(a.dateDeDeploiement)
      );
    return fonctionnalitesDechronologique[0];
  };

  const recharge = (nouvellesDonnees) => {
    donnees = { ...donneesReferentielVide, ...nouvellesDonnees };
    valideDonnees();
  };

  const enrichis = (nouvellesDonnees) => {
    donnees = { ...donnees, ...nouvellesDonnees };
    valideDonnees();
  };

  valideDonnees();

  return {
    actionsSaisie,
    actionSaisie,
    categoriesMesures,
    codeDepartements,
    coefficientIndiceCyberMesuresIndispensables,
    coefficientIndiceCyberMesuresRecommandees,
    indiceCyberNoteMax,
    definitionRisque,
    delaisAvantImpactCritique,
    departement,
    departements,
    derniereNouvelleFonctionnalite,
    derniereEtapeParcours,
    descriptionCategorie,
    descriptionDelaiAvantImpactCritique,
    descriptionDonneesCaracterePersonnel,
    descriptionEcheanceRenouvellement,
    descriptionFonctionnalite,
    descriptionRisque,
    descriptionStatutMesure,
    descriptionsDonneesCaracterePersonnel,
    descriptionsFonctionnalites,
    donneesCaracterePersonnel,
    echeancesRenouvellement,
    enrichis,
    estCodeDepartement,
    estDocumentHomologation,
    estIdentifiantEcheanceRenouvellementConnu,
    estIdentifiantStatutAvisDossierHomologationConnu,
    etapeExiste,
    etapesParcoursHomologation,
    etapeSuffisantePourDossierDecision,
    fonctionnalites,
    identifiantsActionsSaisie,
    identifiantsCategoriesMesures,
    identifiantsEcheancesRenouvellement,
    identifiantsLocalisationsDonnees,
    identifiantsMesures,
    identifiantsNiveauxGravite,
    identifiantsRisques,
    idEtapeSuivante,
    infosNiveauxGravite,
    infosNiveauxGraviteConcernes,
    localisationDonnees,
    localisationsDonnees,
    mesure,
    mesureIndispensable,
    mesures,
    nbMoisDecalage,
    nbMoisBientotExpire,
    niveauGravite,
    niveauxGravite,
    nouvelleFonctionnalite,
    numeroEtape,
    positionActionSaisie,
    premiereActionSaisie,
    premiereEtapeParcours,
    provenancesService,
    recharge,
    reglesPersonnalisation,
    risques,
    descriptionStatutDeploiement,
    statutsAvisDossierHomologation,
    statutsDeploiement,
    statutDeploiementValide,
    statutHomologation,
    statutsMesures,
    trancheIndiceCyber,
    typeService,
    typesService,
  };
};
const creeReferentielVide = () => creeReferentiel(donneesReferentielVide);

module.exports = { creeReferentiel, creeReferentielVide };
