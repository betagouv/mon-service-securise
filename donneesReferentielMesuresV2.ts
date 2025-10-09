export const mesuresV2 = {
  'RECENSEMENT.1': {
    description:
      "Etablir la liste de l'ensemble des activités, services et/ou données à protéger",
    categorie: 'gouvernance',
    referentiel: 'ANSSI',
  },
  'RECENSEMENT.2': {
    description:
      'Etablir et tenir à jour la liste des équipements et des applicatifs contribuant au fonctionnement du système',
    categorie: 'gouvernance',
    referentiel: 'ANSSI',
  },
  'RECENSEMENT.3': {},
  'CONFORMITE.1': {},
  'CONFORMITE.3': {},
  'PSSI.5': {},
  'CONTRAT.1': {},
  'CONTRAT.2': {},
  'DEV.1': {},
  'ECOSYSTEME.1': {},
  'ECOSYSTEME.2': {},
  'ECOSYSTEME.3': {},
  'ECOSYSTEME.4': {},
  'ECOSYSTEME.5': {},
  'ECOSYSTEME.6': {},
  'RH.2': {},
  'RH.4': {},
  'CARTO.2': {},
  'DONNEES.1': {},
  'DONNEES.2': {},
  'MCO_MCS.1': {},
  'MCO_MCS.10': {},
  'MCO_MCS.11': {},
  'MCO_MCS.12': {},
  'MCO_MCS.13': {},
  'MCO_MCS.14': {},
  'MCO_MCS.15': {},
  'MCO_MCS.16': {},
  'MCO_MCS.17': {},
  'MCO_MCS.2': {},
  'MCO_MCS.3': {},
  'MCO_MCS.4': {},
  'MCO_MCS.5': {},
  'MCO_MCS.6': {},
  'MCO_MCS.7': {},
  'MCO_MCS.8': {},
  'MCO_MCS.9': {},
  'RGPD.1': {},
  'RGPD.2': {},
  'RGPD.3': {},
  'RGPD.4': {},
  'RGPD.5': {},
  'RGPD.6': {},
  'PHYS.1': {},
  'PHYS.2': {},
  'CLOISON.1': {},
  'CLOISON.2': {},
  'CLOISON.3': {},
  'CLOISON.4': {},
  'CLOISON.5': {},
  'CLOISON.6': {},
  'FILTRE.1': {},
  'FILTRE.2': {},
  'FILTRE.3': {},
  'FILTRE.4': {},
  'FILTRE.5': {},
  'FILTRE.6': {},
  'FILTRE.7': {},
  'MAIL.1': {},
  'DISTANCE.1': {},
  'DISTANCE.2': {},
  'DISTANCE.3': {},
  'DISTANCE.4': {},
  'MALWARE.2': {},
  'MALWARE.3': {},
  'AUTH.1': {},
  'AUTH.10': {},
  'AUTH.11': {},
  'AUTH.2': {},
  'AUTH.3': {},
  'AUTH.4': {},
  'AUTH.5': {},
  'AUTH.6': {},
  'AUTH.7': {},
  'AUTH.8': {},
  'AUTH.9': {},
  'DROITS.1': {},
  'DROITS.2': {},
  'DROITS.3': {},
  'ID.1': {},
  'ID.2': {},
  'ID.3': {},
  'ANNUAIRE.1': {},
  'ANNUAIRE.2': {},
  'ANNUAIRE.3': {},
  'ANNUAIRE.5': {},
  'COMPADMIN.1': {},
  'COMPADMIN.2': {},
  'COMPADMIN.3': {},
  'COMPADMIN.4': {},
  'COMPADMIN.5': {},
  'COMPADMIN.6': {},
  'COMPADMIN.7': {},
  'COMPADMIN.8': {},
  'COMPADMIN.9': {},
  'INCIDENT.1': {},
  'INCIDENT.2': {},
  'INCIDENT.3': {},
  'INCIDENT.4': {},
  'INCIDENT.6': {},
  'INCIDENT.7': {},
  'INCIDENT.8': {},
  'CONTINU.1': {},
  'CONTINU.2': {},
  'CONTINU.3': {},
  'CONTINU.5': {},
  'CONTINU.6': {},
  'RISQUE.1': {},
  'RISQUE.2': {},
  'AUDIT.1': {},
  'AUDIT.2': {},
  'AUDIT.3': {},
  'AUDIT.4': {},
  'AUDIT.5': {},
  'AUDIT.6': {},
  'CONFIG.1': {},
  'CONFIG.2': {},
  'CONFIG.3': {},
  'CONFIG.4': {},
  'CONFIG.5': {},
  'CONFIG.6': {},
  'CONFIG.7': {},
  'CONFIG.8': {},
  'ADMIN.1': {},
  'ADMIN.2': {},
  'ADMIN.3': {},
  'ADMIN.4': {},
  'ADMIN.5': {},
  'ADMIN.6': {},
  'ADMIN.7': {},
  'SUPERVISION.4': {},
  'SUPERVISION.5': {},
  'SUPERVISION.6': {},
  'SUPERVISION.7': {},
};

export const questionsV2 = {
  niveauSecurite: {
    niveau1: {
      position: 1,
    },
    niveau2: {
      position: 2,
    },
    niveau3: {
      position: 3,
    },
  },
  statutDeploiement: {
    enProjet: {
      description: 'En conception',
    },
    enCours: {
      description: 'En cours de développement ou de déploiement',
    },
    enLigne: {
      description: 'En ligne et accessible aux usagers et/ou agents',
    },
  },
  typeDeService: {
    portailInformation: {
      nom: "Portail d'information",
      exemple: 'ex. site web vitrine sans création de compte',
    },
    serviceEnLigne: {
      nom: 'Service en ligne',
      exemple: 'ex. démarche en ligne, téléservice avec création de compte',
    },
    api: {
      nom: 'API',
      exemple: 'ex. mise à disposition de données sur Internet',
    },
    applicationMobile: {
      nom: 'Application mobile',
      exemple:
        'ex. une application permettant de visualiser des vidéos en ligne',
    },
    autreSystemeInformation: {
      nom: "Autre Système d'information",
      exemple: '',
    },
  },
  specificiteProjet: {
    postesDeTravail: { nom: 'Des postes de travail', exemple: '' },
    accesPhysiqueAuxBureaux: {
      nom: "L'accès physique des bureaux",
      exemple: '',
    },
    accesPhysiqueAuxSallesTechniques: {
      nom: "L'accès physique des salles techniques",
      exemple: '',
    },
    annuaire: { nom: 'Un annuaire', exemple: '' },
    dispositifDeSignatureElectronique: {
      nom: 'Un dispositif de signature électronique',
      exemple: '',
    },
    echangeOuReceptionEmails: {
      nom: "L'échange et/ou la réception d'emails",
      exemple: '',
    },
  },
  typeHebergement: {
    onPremise: { nom: 'Hébergement interne (On-premise)' },
    cloud: {
      nom: 'Le système d’information repose sur une infrastructure ou une plateforme Cloud (IaaS/PaaS)',
    },
    saas: {
      nom: "Le système est entièrement fourni et vous l'utilisez directement via une interface (SaaS)",
    },
    autre: { nom: 'Autre' },
  },
  activiteExternalisee: {
    administrationTechnique: {
      nom: "L'administration technique",
      exemple: 'Administration logique des serveurs',
    },
    developpementLogiciel: {
      nom: 'Le développement',
      exemple: '',
    },
  },
  categorieDonneesTraitees: {
    donneesSensibles: {
      nom: 'Données sensibles',
      exemple: 'ex. santé, appartenance syndicale, etc.',
      criticite: 4,
    },
    documentsRHSensibles: {
      nom: 'Documents RH sensibles',
      exemple: 'ex. évaluations, sanctions, fiches de paye, RIB, IBAN, etc.',
      criticite: 4,
    },
    secretsDEntreprise: {
      nom: "Données liées au secret d'entreprise",
      exemple:
        'ex. Processus de fabrication spécifique, données de recherche & développement',
      criticite: 4,
    },
    donneesCaracterePersonnelPersonneARisque: {
      nom: 'Données à caractère personnel de personnes à risque',
      exemple: 'ex. mineurs',
      criticite: 3,
    },
    donneesSituationFamilialeEconomiqueFinanciere: {
      nom: 'Données relatives à la situation familiale, économique et financière',
      exemple: 'ex. revenus, état civil.',
      criticite: 3,
    },
    documentsIdentifiants: {
      nom: 'Documents identifiants',
      exemple: 'ex. CNI, Passeport, etc.',
      criticite: 3,
    },
    donneesTechniques: {
      nom: 'Données techniques',
      exemple: 'ex. DAT, logs, etc.',
      criticite: 3,
    },
    donneesDIdentite: {
      nom: "Données d'identité",
      exemple: 'ex. noms, prénoms, adresse mail, etc.',
      criticite: 2,
    },
    donneesAdministrativesEtFinancieres: {
      nom: 'Données administratives et financières',
      exemple: 'ex. organigramme, budgets, bilans, dépenses etc.',
      criticite: 2,
    },
  },
  volumetrieDonneesTraitees: {
    faible: {
      nom: 'Faible',
      description:
        "Le système stocke une quantité limitée et stable d'informations, facile à gérer et rapidement consultable.",
      criticite: 1,
    },
    moyen: {
      nom: 'Moyen',
      description:
        "Le système stocke un volume conséquent et stable d'informations, qui commence à nécessiter une organisation ou des outils spécifiques.",
      criticite: 2,
    },
    eleve: {
      nom: 'Elevé',
      description:
        "Le système stocke un grand et stable nombre d'informations, avec un impact notable sur la gestion, la sauvegarde ou l'accessibilité.",
      criticite: 3,
    },
    tresEleve: {
      nom: 'Très élevé',
      description:
        'Le système stocke une très grande quantité d’informations, en croissance constante, nécessitant des capacités de stockage importantes.',
      criticite: 4,
    },
  },
  ouvertureSysteme: {
    interneRestreint: {
      nom: "Accessible à très peu de personnes en interne de l'organisation",
      exemple:
        'ex. baie de stockage accessible uniquement depuis des postes physiques dédiés',
      criticite: 1,
    },
    interne: {
      nom: "Interne à l'organisation",
      exemple: "ex. outil RH accessible depuis le réseau de l'organisation",
      criticite: 2,
    },
    internePlusTiers: {
      nom: 'Interne et ouvert à certains tiers',
      exemple:
        "ex. plateforme de suivi accessible depuis le réseau de l'organisation  et pour certains tiers via un VPN",
      criticite: 3,
    },
    accessibleSurInternet: {
      nom: 'Accessible depuis internet',
      exemple:
        "ex. service public dont un portail avec une mire d'authentification accessible à tous sur internet",
      criticite: 4,
    },
  },
  audienceCible: {
    limitee: {
      nom: 'Limitée',
      description:
        'Utilisé par un petit nombre de personnes, souvent en interne.',
      criticite: 1,
    },
    moyenne: {
      nom: 'Moyenne',
      description:
        'Utilisé par un périmètre restreint à l’échelle locale ou régionale.',
      criticite: 2,
    },
    large: {
      nom: 'Large',
      description:
        'Utilisé à l’échelle nationale par plusieurs entités d’un même domaine.',
      criticite: 3,
    },
    tresLarge: {
      nom: 'Très large',
      description:
        'Ouvert ou accessible à un public national voire international.',
      criticite: 4,
    },
  },
  dureeDysfonctionnementAcceptable: {
    moinsDe4h: { nom: 'Moins de 4h', criticite: 4 },
    moinsDe12h: { nom: 'Moins de 12h', criticite: 3 },
    moinsDe24h: { nom: 'Moins de 24h', criticite: 2 },
    plusDe24h: { nom: 'Plus de 24h', criticite: 1 },
  },
  localisationDonneesTraitees: {
    UE: {
      nom: "Au sein de l'Union européenne",
    },
    horsUE: {
      nom: 'Hors Union européenne',
    },
  },
};

export type CategorieDonneesTraitees =
  keyof typeof questionsV2.categorieDonneesTraitees;
export type VolumetrieDonneesTraitees =
  keyof typeof questionsV2.volumetrieDonneesTraitees;
export type LocalisationDonneesTraitees =
  keyof typeof questionsV2.localisationDonneesTraitees;
export type AudienceCible = keyof typeof questionsV2.audienceCible;
export type DureeDysfonctionnementAcceptable =
  keyof typeof questionsV2.dureeDysfonctionnementAcceptable;
export type OuvertureSysteme = keyof typeof questionsV2.ouvertureSysteme;
export type TypeHebergement = keyof typeof questionsV2.typeHebergement;
export type TypeDeService = keyof typeof questionsV2.typeDeService;
export type SpecificiteProjet = keyof typeof questionsV2.specificiteProjet;
export type ActiviteExternalisee =
  keyof typeof questionsV2.activiteExternalisee;
export type StatutDeploiement = keyof typeof questionsV2.statutDeploiement;
export type NiveauSecurite = keyof typeof questionsV2.niveauSecurite;
