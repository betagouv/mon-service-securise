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
};

export const questionsV2 = {
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
    },
    documentsRHSensibles: {
      nom: 'Documents RH sensibles',
      exemple: 'ex. évaluations, sanctions, fiches de paye, RIB, IBAN, etc.',
    },
    secretsDEntreprise: {
      nom: "Données liées au secret d'entreprise",
      exemple:
        'ex. Processus de fabrication spécifique, données de recherche & développement',
    },
    donneesCaracterePersonnelPersonneARisque: {
      nom: 'Données à caractère personnel de personnes à risque',
      exemple: 'ex. mineurs',
    },
    donneesSituationFamilialeEconomiqueFinanciere: {
      nom: 'Données relatives à la situation familiale, économique et financière',
      exemple: 'ex. revenus, état civil.',
    },
    documentsIdentifiants: {
      nom: 'Documents identifiants',
      exemple: 'ex. CNI, Passeport, etc.',
    },
    donneesTechniques: {
      nom: 'Données techniques',
      exemple: 'ex. DAT, logs, etc.',
    },
    donneesDIdentite: {
      nom: "Données d'identité",
      exemple: 'ex. noms, prénoms, adresse mail, etc.',
    },
    donneesAdministrativesEtFinancieres: {
      nom: 'Données administratives et financières',
      exemple: 'ex. organigramme, budgets, bilans, dépenses etc.',
    },
  },
  volumetrieDonneesTraitees: {
    faible: {
      nom: 'Faible',
      description:
        "Le système stocke une quantité limitée et stable d'informations, facile à gérer et rapidement consultable.",
    },
    moyen: {
      nom: 'Moyen',
      description:
        "Le système stocke un volume conséquent et stable d'informations, qui commence à nécessiter une organisation ou des outils spécifiques.",
    },
    eleve: {
      nom: 'Elevé',
      description:
        "Le système stocke un grand et stable nombre d'informations, avec un impact notable sur la gestion, la sauvegarde ou l'accessibilité.",
    },
    tresEleve: {
      nom: 'Très élevé',
      description:
        'Le système stocke une très grande quantité d’informations, en croissance constante, nécessitant des capacités de stockage importantes.',
    },
  },
  ouvertureSysteme: {
    interneRestreint: {
      nom: "Accessible à très peu de personnes en interne de l'organisation",
      exemple:
        'ex. baie de stockage accessible uniquement depuis des postes physiques dédiés',
    },
    interne: {
      nom: "Interne à l'organisation",
      exemple: "ex. outil RH accessible depuis le réseau de l'organisation",
    },
    internePlusTiers: {
      nom: 'Interne et ouvert à certains tiers',
      exemple:
        "ex. plateforme de suivi accessible depuis le réseau de l'organisation  et pour certains tiers via un VPN",
    },
    accessibleSurInternet: {
      nom: 'Accessible depuis internet',
      exemple:
        "ex. service public dont un portail avec une mire d'authentification accessible à tous sur internet",
    },
  },
  audienceCible: {
    limitee: {
      nom: 'Limitée',
      description:
        'Utilisé par un petit nombre de personnes, souvent en interne.',
    },
    moyenne: {
      nom: 'Moyenne',
      description:
        'Utilisé par un périmètre restreint à l’échelle locale ou régionale.',
    },
    large: {
      nom: 'Large',
      description:
        'Utilisé à l’échelle nationale par plusieurs entités d’un même domaine.',
    },
    tresLarge: {
      nom: 'Très large',
      description:
        'Ouvert ou accessible à un public national voire international.',
    },
  },
  dureeDysfonctionnementAcceptable: {
    moinsDe4h: { nom: 'Moins de 4h' },
    moinsDe12h: { nom: 'Moins de 12h' },
    moinsDe24h: { nom: 'Moins de 24h' },
    plusDe24h: { nom: 'Plus de 24h' },
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
