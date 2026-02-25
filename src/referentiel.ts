import {
  ErreurDonneesReferentielIncorrectes,
  ErreurCategorieInconnue,
} from './erreurs.js';
import donneesParDefaut from '../donneesReferentiel.js';
import {
  DonneesReferentiel,
  IdCategorieMesure,
  IdDelaiAvantImpactCritique,
  IdDonneeCaracterePersonnel,
  IdEcheanceRenouvellement,
  IdEtapeHomologation,
  IdEtapeVisiteGuidee,
  IdFonctionnalite,
  IdLocalisationDonnees,
  IdMesure,
  IdNatureSuggestionAction,
  IdNatureTacheService,
  IdNiveauGravite,
  IdNiveauRisque,
  IdNiveauSecurite,
  IdReferentielMesure,
  IdRisque,
  IdStatutDeploiement,
  IdStatutHomologation,
  IdStatutMesure,
  IdTacheCompletudeProfil,
  IdTypeService,
  IdVraisemblanceRisque,
} from './referentiel.types.js';

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
  modelesMesureSpecifique: {},
  mesures: {},
  risques: {},
  typesService: {},
  niveauxGravite: {},
  niveauxRisques: {},
  nouvellesFonctionnalites: [],
  provenancesService: {},
  statutsDeploiement: {},
  statutsMesures: {},
  prioritesMesures: {},
  tranchesIndicesCybers: [],
  nombreOrganisationsUtilisatrices: [],
  estimationNombreServices: [],
  etapesVisiteGuidee: [],
  naturesSuggestionsActions: {},
  niveauxDeSecurite: [],
};

const creeReferentiel = (
  donneesReferentiel: DonneesReferentiel = donneesParDefaut
) => {
  let donnees: DonneesReferentiel = donneesReferentiel;

  const versionActuelleCgu = () => donnees.versionActuelleCgu || true;
  const statutsAvisDossierHomologation = () =>
    donnees.statutsAvisDossierHomologation || {};
  const statutHomologation = (idStatut: IdStatutHomologation) =>
    donnees.statutsHomologation[idStatut];
  const categoriesMesures = () => donnees.categoriesMesures;
  const descriptionCategorie = (idCategorie: IdCategorieMesure) =>
    categoriesMesures()[idCategorie];
  const identifiantsCategoriesMesures = () => Object.keys(categoriesMesures());
  const echeancesRenouvellement = () => donnees.echeancesRenouvellement || [];
  const descriptionEcheanceRenouvellement = (id: IdEcheanceRenouvellement) =>
    echeancesRenouvellement()[id]?.description;
  const delaisAvantImpactCritique = () => donnees.delaisAvantImpactCritique;
  const descriptionDelaiAvantImpactCritique = (
    id: IdDelaiAvantImpactCritique
  ) => delaisAvantImpactCritique()[id]?.description;
  const donneesCaracterePersonnel = () => donnees.donneesCaracterePersonnel;
  const descriptionDonneesCaracterePersonnel = (
    id: IdDonneeCaracterePersonnel
  ) => donneesCaracterePersonnel()[id]?.description;
  const descriptionsDonneesCaracterePersonnel = (
    ids: Array<IdDonneeCaracterePersonnel>
  ) =>
    ids
      ?.map((id) => descriptionDonneesCaracterePersonnel(id))
      .filter((id) => id !== undefined);
  const etapesParcoursHomologation = (peutHomologuer = true) => {
    const etapes = donnees.etapesParcoursHomologation || [];
    if (peutHomologuer) return etapes;
    return etapes.filter(
      (etape) =>
        !('reserveePeutHomologuer' in etape && etape.reserveePeutHomologuer)
    );
  };
  const identifiantsEcheancesRenouvellement = () =>
    Object.keys(echeancesRenouvellement());
  const estIdentifiantEcheanceRenouvellementConnu = (
    idEcheance: IdEcheanceRenouvellement
  ) => identifiantsEcheancesRenouvellement().includes(idEcheance);
  const identifiantsStatutAvisDossierHomologation = () =>
    Object.keys(statutsAvisDossierHomologation());
  const estIdentifiantStatutAvisDossierHomologationConnu = (
    idStatut: IdStatutHomologation
  ) => identifiantsStatutAvisDossierHomologation().includes(idStatut);
  const fonctionnalites = () => donnees.fonctionnalites;
  const formatteListeDeReferentiels = (referentiels: IdReferentielMesure[]) => {
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
  const descriptionFonctionnalite = (id: IdFonctionnalite) =>
    fonctionnalites()[id]?.description;
  const descriptionsFonctionnalites = (ids: Array<IdFonctionnalite>) =>
    ids
      ?.map((id) => descriptionFonctionnalite(id))
      .filter((id) => id !== undefined);
  const localisationsDonnees = () => donnees.localisationsDonnees;
  const identifiantsLocalisationsDonnees = () =>
    Object.keys(localisationsDonnees());
  const mesureIndispensable = (idMesure: IdMesure) => {
    const mesure = donnees.mesures[idMesure];
    return 'indispensable' in mesure && mesure.indispensable;
  };
  const mesures = () => structuredClone(donnees.mesures);
  const estIdentifiantMesureConnu = (id: IdMesure) =>
    Object.keys(donnees.mesures).includes(id);
  const mesure = (id: IdMesure) => structuredClone(donnees.mesures[id]);
  const typesService = () => donnees.typesService;
  const nbMoisDecalage = (idEcheance: IdEcheanceRenouvellement) =>
    echeancesRenouvellement()[idEcheance]?.nbMoisDecalage;
  const nbMoisBientotExpire = (idEcheance: IdEcheanceRenouvellement) =>
    echeancesRenouvellement()[idEcheance]?.nbMoisBientotExpire;
  const nbMoisRappelsExpiration = (idEcheance: IdEcheanceRenouvellement) =>
    echeancesRenouvellement()[idEcheance]?.rappelsExpirationMois;
  const niveauxGravite = () => donnees.niveauxGravite || {};
  const niveauGravite = (idNiveau: IdNiveauGravite) =>
    niveauxGravite()[idNiveau] || {};
  const niveauxVraisemblance = () => donnees.vraisemblancesRisques || {};
  const niveauVraisemblance = (idNiveau: IdVraisemblanceRisque) =>
    niveauxVraisemblance()[idNiveau] || {};
  const niveauxRisque = () => donnees.niveauxRisques || {};
  const optionsFiltrageDate = () => donnees.optionsFiltrageDate || {};
  const identifiantsNiveauxGravite = () => Object.keys(niveauxGravite() || {});
  const identifiantsNiveauxVraisemblance = () =>
    Object.keys(niveauxVraisemblance() || {});
  const provenancesService = () => donnees.provenancesService;
  const reglesPersonnalisation = () => donnees.reglesPersonnalisation || {};
  const risques = () => donnees.risques;
  const identifiantsRisques = () => Object.keys(donnees.risques);
  const risque = (id: IdRisque) => risques()[id] || {};
  const definitionRisque = (idRisque: IdRisque) => risque(idRisque).definition;
  const categoriesRisque = (idRisque: IdRisque) => risque(idRisque).categories;
  const identifiantNumeriqueRisque = (idRisque: IdRisque) =>
    risque(idRisque).identifiantNumerique;
  const identifiantsCategoriesRisque = () =>
    Object.keys(donnees.categoriesRisques);
  const detailCategoriesRisque = () => donnees.categoriesRisques;
  const descriptionRisque = (idRisque: IdRisque) =>
    risque(idRisque).description;
  const statutsDeploiement = () => donnees.statutsDeploiement;
  const descriptionStatutDeploiement = (idStatut: IdStatutDeploiement) =>
    statutsDeploiement()[idStatut]?.description;
  const statutDeploiementValide = (id: IdStatutDeploiement) =>
    Object.keys(statutsDeploiement()).includes(id);
  const statutsMesures = () => donnees.statutsMesures;
  const descriptionStatutMesure = (idStatut: IdStatutMesure) =>
    statutsMesures()[idStatut];
  const prioritesMesures = () => donnees.prioritesMesures;
  const departements = () => donneesReferentiel.departements || [];
  const codeDepartements = () =>
    donneesReferentiel.departements?.map((departement) => departement.code);
  const estCodeDepartement = (code: string) =>
    codeDepartements()?.includes(code);
  const departement = (code: string) =>
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

  const verifieIndiceEstDansTranche = (
    indiceCyber: number,
    tranche: {
      borneInferieure: number;
      borneSuperieure: number;
      borneSuperieureIncluse?: boolean;
    }
  ) =>
    indiceCyber >= tranche.borneInferieure &&
    (tranche.borneSuperieureIncluse
      ? indiceCyber <= tranche.borneSuperieure
      : indiceCyber < tranche.borneSuperieure);

  const trancheIndiceCyber = (indiceCyber: number) =>
    donnees.tranchesIndicesCybers.find((tranche) =>
      verifieIndiceEstDansTranche(indiceCyber, tranche)
    ) || {};

  const descriptionsTranchesIndiceCyber = (indiceCyber: number) =>
    (
      donnees.tranchesIndicesCybers as unknown as Array<{
        borneInferieure: number;
        borneSuperieure: number;
        borneSuperieureIncluse?: boolean;
        description: string;
      }>
    )
      .sort((a, b) => a.borneInferieure - b.borneInferieure)
      .map((tranche) => ({
        description: tranche.description,
        trancheCourante: verifieIndiceEstDansTranche(indiceCyber, tranche),
      }));

  const infosNiveauxGravite = (ordreInverse = false) => {
    const niveaux = Object.keys(niveauxGravite()).map((clef) => ({
      identifiant: clef,
      ...niveauGravite(clef as IdNiveauGravite),
    }));
    return ordreInverse ? niveaux.reverse() : niveaux;
  };

  const infosNiveauxGraviteConcernes = (ordreInverse: boolean) =>
    infosNiveauxGravite(ordreInverse).filter(
      (niveau) => !('nonConcerne' in niveau && niveau.nonConcerne)
    );

  const localisationDonnees = (identifiant?: IdLocalisationDonnees) => {
    if (!identifiant) return 'Localisation des données non renseignée';
    return localisationsDonnees()[identifiant].description;
  };

  const typeService = (identifiants: Array<IdTypeService>) => {
    if (identifiants.length === 0) return 'Type de service non renseignée';
    return identifiants
      .map((identifiant) => typesService()[identifiant].description)
      .join(', ');
  };

  const numeroEtape = (idEtape: IdEtapeHomologation) =>
    etapesParcoursHomologation().find((e) => e.id === idEtape)?.numero;

  const libelleEtape = (idEtape: IdEtapeHomologation) =>
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

  const etapeExiste = (idEtape: IdEtapeHomologation) =>
    etapesParcoursHomologation()
      .map((e) => e.id)
      .includes(idEtape);

  const idEtapeSuivante = (idEtape: IdEtapeHomologation) => {
    const actuel = numeroEtape(idEtape);
    if (!actuel) return undefined;
    const numeroSuivant = actuel + 1;
    return etapesParcoursHomologation().find((e) => e.numero === numeroSuivant)
      ?.id;
  };

  const etapeSuffisantePourDossierDecision = (idEtape: IdEtapeHomologation) => {
    const numeroEtapeSuffisante = numeroEtape(
      donnees.etapeNecessairePourDossierDecision
    );
    const numeroEtapeCourante = numeroEtape(idEtape);
    if (!numeroEtapeSuffisante || !numeroEtapeCourante) return undefined;
    return numeroEtapeCourante >= numeroEtapeSuffisante;
  };

  const etapeDossierAutorisee = (
    idEtape: IdEtapeHomologation,
    peutHomologuer: boolean
  ) => {
    if (peutHomologuer) return idEtape;
    const etapesDisponibles = etapesParcoursHomologation(peutHomologuer);
    const numeroMaxDisponible = Math.max(
      ...etapesDisponibles.map((e) => e.numero)
    );
    const numeroEtapeAutorisee = Math.min(
      numeroEtape(idEtape) as number,
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

  const tacheCompletudeProfil = (id: IdTacheCompletudeProfil) =>
    donnees.tachesCompletudeProfil.find((t) => t.id === id);

  const retoursUtilisateurMesure = () => donnees.retoursUtilisateurMesure || {};

  const verifieCategoriesMesuresSontRepertoriees = (
    categories: Array<IdCategorieMesure>
  ) => {
    const distinctes = [...new Set(categories)];
    const repertoriees = identifiantsCategoriesMesures();
    const categorieInconnue = distinctes.find((c) => !repertoriees.includes(c));

    if (categorieInconnue)
      throw new ErreurCategorieInconnue(
        `La catégorie "${categorieInconnue}" n'est pas répertoriée`
      );
  };

  const recharge = (nouvellesDonnees: DonneesReferentiel) => {
    donnees = { ...donneesReferentielVide, ...nouvellesDonnees };
    valideDonnees();
  };

  const enrichis = (nouvellesDonnees: DonneesReferentiel) => {
    donnees = { ...donnees, ...nouvellesDonnees };
    valideDonnees();
  };

  const etapeVisiteGuidee = (idEtape: IdEtapeVisiteGuidee) =>
    donnees.etapesVisiteGuidee[idEtape];
  const etapeSuivanteVisiteGuidee = (idEtapeCourante: IdEtapeVisiteGuidee) => {
    const etape = donnees.etapesVisiteGuidee[idEtapeCourante];
    if (etape && 'idEtapeSuivante' in etape) return etape.idEtapeSuivante;
    return null;
  };
  const etapePrecedenteVisiteGuidee = (
    idEtapeCourante: IdEtapeVisiteGuidee
  ) => {
    const etape = donnees.etapesVisiteGuidee[idEtapeCourante];
    if (etape && 'idEtapePrecedente' in etape) return etape.idEtapePrecedente;
    return null;
  };
  const nbEtapesVisiteGuidee = () =>
    Object.keys(donnees.etapesVisiteGuidee || {}).length;
  const natureTachesService = (nature: IdNatureTacheService) =>
    (donnees.naturesTachesService || {})[nature];
  const natureSuggestionAction = (nature: IdNatureSuggestionAction) => {
    const natures = donnees.naturesSuggestionsActions;

    if (!Object.keys(natures).includes(nature)) {
      throw new ErreurDonneesReferentielIncorrectes(
        `La nature ${nature} n'est pas une nature de suggestion d'action connue.`
      );
    }

    return natures[nature];
  };

  const matriceNiveauxRisques = () => {
    const resultat: Array<Array<IdNiveauRisque>> = [];
    const idNiveauxRisque = Object.keys(
      donnees.niveauxRisques
    ) as Array<IdNiveauRisque>;

    function enTableau(item: unknown) {
      return Array.isArray(item) ? item : [item];
    }

    function ajouteCorrespondance(
      vraisemblances: Array<number>,
      gravites: Array<number>,
      niveauRisque: IdNiveauRisque
    ) {
      vraisemblances.forEach((valeurVraisemblance) => {
        while (resultat.length <= valeurVraisemblance) {
          resultat.push([]);
        }
        gravites.forEach((valeurGravite) => {
          resultat[valeurVraisemblance][valeurGravite] = niveauRisque;
        });
      });
    }

    idNiveauxRisque.forEach((niveauRisque) => {
      const { correspondances } = donnees.niveauxRisques[niveauRisque];
      correspondances.forEach(({ gravite, vraisemblance }) => {
        const vraisemblances: Array<number> = enTableau(vraisemblance);
        const gravites: Array<number> = enTableau(gravite);

        ajouteCorrespondance(vraisemblances, gravites, niveauRisque);
      });
    });
    return resultat;
  };

  function estDansLaMatrice(
    positionVraisemblance: number | undefined,
    positionGravite: number | undefined,
    matrice: Array<Array<IdNiveauRisque>>
  ) {
    return (
      positionVraisemblance !== undefined &&
      positionGravite !== undefined &&
      positionVraisemblance < matrice.length
    );
  }

  const niveauRisque = (
    vraisemblance: IdVraisemblanceRisque,
    gravite: IdNiveauGravite
  ) => {
    const positionVraisemblance =
      donnees.vraisemblancesRisques[vraisemblance]?.position;
    const positionGravite = donnees.niveauxGravite[gravite]?.position;
    const matrice = matriceNiveauxRisques();

    if (!estDansLaMatrice(positionVraisemblance, positionGravite, matrice))
      return 'indeterminable';

    return matrice[positionVraisemblance][positionGravite];
  };

  const recupereDescriptions = (
    proprietes: Record<string, { description: string }>
  ) => Object.values(proprietes).map((v) => v.description);

  const descriptionsTypeService = () =>
    recupereDescriptions(donnees.typesService);

  const descriptionsProvenanceService = () =>
    recupereDescriptions(donnees.provenancesService);

  const descriptionsStatutDeploiement = () =>
    recupereDescriptions(donnees.statutsDeploiement);

  const descriptionLocalisationDonnees = () =>
    recupereDescriptions(donnees.localisationsDonnees);

  const descriptionsDelaiAvantImpactCritique = () =>
    recupereDescriptions(donnees.delaisAvantImpactCritique);

  const descriptionsEcheanceRenouvellement = () =>
    recupereDescriptions(donnees.echeancesRenouvellement);

  const labelsNombreOrganisationsUtilisatrices = () =>
    Object.values(donnees.nombreOrganisationsUtilisatrices).map((v) => v.label);

  const proprieteParDescription = (
    proprietes: Record<string, { description: string }>,
    description: string
  ) =>
    Object.entries(proprietes).find(
      ([, valeur]) => valeur.description === description
    )?.[0];

  const typeServiceParDescription = (description: string) =>
    proprieteParDescription(donnees.typesService, description);

  const provenanceServiceParDescription = (description: string) =>
    proprieteParDescription(donnees.provenancesService, description);

  const statutDeploiementParDescription = (description: string) =>
    proprieteParDescription(donnees.statutsDeploiement, description);

  const localisationDonneesParDescription = (description: string) =>
    proprieteParDescription(donnees.localisationsDonnees, description);

  const delaiAvantImpactCritiqueParDescription = (description: string) =>
    proprieteParDescription(donnees.delaisAvantImpactCritique, description);

  const echeanceRenouvellementParDescription = (description: string) =>
    proprieteParDescription(donnees.echeancesRenouvellement, description);

  const categorieMesureParLabel = (label: string) =>
    Object.entries(donnees.categoriesMesures).find(
      ([, leLabel]) => label === leLabel
    );

  const nombreOrganisationsUtilisatricesParLabel = (label: string) => {
    const nombreAvecLabel = donnees.nombreOrganisationsUtilisatrices.find(
      (description) => description.label === label
    );
    if (!nombreAvecLabel) return undefined;

    return {
      borneBasse: nombreAvecLabel.borneBasse,
      borneHaute: nombreAvecLabel.borneHaute,
    };
  };

  const estStatutMesureConnu = (statut: IdStatutMesure) =>
    Object.keys(statutsMesures()).includes(statut);

  const nombreMaximumDeModelesMesureSpecifiqueParUtilisateur = () =>
    donnees.modelesMesureSpecifique.nombreMaximumParUtilisateur;

  const versionServiceParDefaut = () => donnees.versionServiceParDefaut;

  const niveauxDeSecurite = () => donnees.niveauxDeSecurite;

  const niveauDeSecuriteDepasseRecommandation = (
    niveauCandidat: IdNiveauSecurite,
    niveauRecommandation: IdNiveauSecurite
  ) =>
    donnees.niveauxDeSecurite.indexOf(niveauCandidat) >
    donnees.niveauxDeSecurite.indexOf(niveauRecommandation);

  // Seulement supporté par le référentiel v2.
  const porteursSinguliersDeMesure = () => undefined;
  const thematiqueDeMesure = () => undefined;

  valideDonnees();

  return {
    categorieMesureParLabel,
    categoriesRisque,
    categoriesMesures,
    codeDepartements,
    coefficientIndiceCyberMesuresIndispensables,
    coefficientIndiceCyberMesuresRecommandees,
    coefficientIndiceCyberStatutPartiel,
    indiceCyberNoteMax,
    definitionRisque,
    delaiAvantImpactCritiqueParDescription,
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
    detailCategoriesRisque,
    donneesCaracterePersonnel,
    echeanceRenouvellementParDescription,
    echeancesRenouvellement,
    enrichis,
    estCodeDepartement,
    estIdentifiantEcheanceRenouvellementConnu,
    estIdentifiantMesureConnu,
    estIdentifiantStatutAvisDossierHomologationConnu,
    estimationNombreServices,
    estStatutMesureConnu,
    etapeDossierAutorisee,
    etapeExiste,
    etapesParcoursHomologation,
    etapeSuffisantePourDossierDecision,
    fonctionnalites,
    formatteListeDeReferentiels,
    identifiantsCategoriesMesures,
    identifiantsCategoriesRisque,
    identifiantsEcheancesRenouvellement,
    identifiantsLocalisationsDonnees,
    identifiantsNiveauxGravite,
    identifiantsNiveauxVraisemblance,
    identifiantNumeriqueRisque,
    identifiantsRisques,
    idEtapeSuivante,
    infosNiveauxGravite,
    infosNiveauxGraviteConcernes,
    libelleEtape,
    labelsNombreOrganisationsUtilisatrices,
    localisationDonnees,
    localisationDonneesParDescription,
    localisationsDonnees,
    matriceNiveauxRisques,
    mesure,
    mesureIndispensable,
    mesures,
    nbMoisDecalage,
    nbMoisBientotExpire,
    nbMoisRappelsExpiration,
    niveauDeSecuriteDepasseRecommandation,
    niveauxDeSecurite,
    niveauGravite,
    niveauxGravite,
    niveauRisque,
    niveauxRisque,
    niveauVraisemblance,
    niveauxVraisemblance,
    nombreMaximumDeModelesMesureSpecifiqueParUtilisateur,
    nombreOrganisationsUtilisatrices,
    nombreOrganisationsUtilisatricesParLabel,
    nouvellesFonctionnalites,
    numeroEtape,
    optionsFiltrageDate,
    premiereEtapeParcours,
    prioritesMesures,
    provenancesService,
    provenanceServiceParDescription,
    recharge,
    reglesPersonnalisation,
    retoursUtilisateurMesure,
    risques,
    descriptionStatutDeploiement,
    statutsAvisDossierHomologation,
    statutsDeploiement,
    statutDeploiementParDescription,
    statutDeploiementValide,
    statutHomologation,
    statutsMesures,
    tacheCompletudeProfil,
    trancheIndiceCyber,
    typeService,
    porteursSinguliersDeMesure,
    typeServiceParDescription,
    typesService,
    verifieCategoriesMesuresSontRepertoriees,
    versionServiceParDefaut,
    etapePrecedenteVisiteGuidee,
    etapeSuivanteVisiteGuidee,
    etapeVisiteGuidee,
    nbEtapesVisiteGuidee,
    natureTachesService,
    natureSuggestionAction,
    versionActuelleCgu,
    descriptionsTypeService,
    descriptionsProvenanceService,
    descriptionsStatutDeploiement,
    descriptionLocalisationDonnees,
    descriptionsDelaiAvantImpactCritique,
    descriptionsEcheanceRenouvellement,
    thematiqueDeMesure,
    version: () => 'v1',
  };
};
const creeReferentielVide = () =>
  creeReferentiel(donneesReferentielVide as unknown as DonneesReferentiel);

export { creeReferentiel, creeReferentielVide };
