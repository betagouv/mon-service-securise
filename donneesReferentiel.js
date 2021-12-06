const echeance = (duree) => `Dans ${duree}`;
const expiration = (duree) => `${duree.charAt(0).toUpperCase()}${duree.slice(1)} après signature de la présente homologation`;

module.exports = {
  seuilsCriticites: ['critique', 'eleve', 'moyen', 'faible'],

  naturesService: {
    siteInternet: { description: 'Site Internet' },
    applicationMobile: { description: 'Application Mobile' },
    api: { description: 'API' },
  },

  provenancesService: {
    developpement: {
      description: 'Il a été développé pour votre organisation, en interne ou par un prestataire',
      exemple: 'site internet de la commune',
    },
    achat: {
      description: "Le service a été acheté sur étagère auprès d'un fournisseur",
      exemple: 'service de visioconférence',
    },
  },

  fonctionnalites: {
    newsletter: {
      description: 'Inscription à une newsletter',
      seuilCriticite: 'faible',
    },
    questionnaire: {
      description: 'Questionnaires, sondages',
      seuilCriticite: 'faible',
    },
    reseauSocial: {
      description: 'Réseau social, forum, commentaires',
      seuilCriticite: 'moyen',
    },
    visionconference: {
      description: 'Audio, visioconférence',
      seuilCriticite: 'moyen',
    },
    paiement: {
      description: 'Paiement en ligne',
      seuilCriticite: 'eleve',
    },
    compte: {
      description: 'Création de compte (utilisateurs avec comptes)',
      seuilCriticite: 'faible',
    },
    messagerie: {
      description: 'Messagerie instantanée',
      seuilCriticite: 'moyen',
    },
    emails: {
      description: "Envoi et réception d'emails",
      seuilCriticite: 'moyen',
    },
    documents: {
      description: 'Stockage de documents',
      seuilCriticite: 'moyen',
    },
    formulaire: {
      description: 'Formulaire administratif ou démarche en ligne',
      seuilCriticite: 'faible',
    },
    edition: {
      description: 'Édition collaborative (documents, murs collaboratifs, etc.)',
      seuilCriticite: 'moyen',
    },
    reservation: {
      description: 'Outils de réservation (livres, places, salles, etc.)',
      seuilCriticite: 'faible',
    },
    autre: {
      description: 'Autres fonctionnalités permettant des échanges de données',
      seuilCriticite: 'faible',
    },
  },

  donneesCaracterePersonnel: {
    contact: {
      description: 'Données de contact',
      exemple: 'mail, numéro de téléphone, adresse postale',
      seuilCriticite: 'faible',
    },
    identite: {
      description: "Données d'identité",
      exemple: "nom/prénom, pseudonyme, date de maissance, numéros de pièce d'identité, de sécurité sociale, etc.",
      seuilCriticite: 'faible',
    },
    situation: {
      description: 'Données relatives à la situation familiale, économique et financière',
      exemple: 'enfants',
      seuilCriticite: 'moyen',
    },
    localisation: {
      description: 'Données de localisation',
      exemple: 'adresse IP, identifiant de connexion, cookies',
      seuilCriticite: 'faible',
    },
    banque: {
      description: 'Données bancaires',
      exemple: 'nº de carte bancaire, établissement bancaire, etc.',
      seuilCriticite: 'eleve',
    },
    mineurs: {
      description: 'Données concernant des personnes mineures',
      seuilCriticite: 'eleve',
    },
    sensibiliteParticuliere: {
      description: 'Données particulièrement sensibles (santé, opinions, etc.)',
      exemple: 'données de santé, orientation sexuelle, origine raciale ou ethnique, opinions politiques ou religieuses',
      seuilCriticite: 'critique',
    },
  },

  delaisAvantImpactCritique: {
    immediat: {
      description: 'Immédiatement',
      seuilCriticite: 'critique',
    },
    uneHeure: {
      description: 'Une heure',
      seuilCriticite: 'eleve',
    },
    uneJournee: {
      description: 'Une journée',
      seuilCriticite: 'moyen',
    },
    uneSemaine: {
      description: 'Une semaine',
      seuilCriticite: 'faible',
    },
    unMois: {
      description: 'Un mois ou plus',
      seuilCriticite: 'faible',
    },
  },

  risques: {
    indisponibiliteService: {
      description: "L'indisponibilité du service",
      descriptionLongue: "Ce risque peut notamment découler d'une attaque par déni de service. Elle peut consister à exploiter, par exemple, une vulnérabilité logicielle ou matérielle ou à saturer la bande passante du réseau. Une telle attaque peut rendre inaccessible tout ou partie du service, empêchant son utilisation  pendant une durée de quelques heures à plusieurs jours. L'indisponibilité peut être aussi consécutive d'un problème technique chez l'hébergeur n'ayant pas pris des dispositions nécessaires pour assurer sa résilience.",
    },
    divulgationDonnees: {
      description: "La divulgation de données d'utilisateurs",
      descriptionLongue: "Le vol de données peut être recherché à des fins d'usurpation d'identité. La diffusion de données afin de discréditer des personnes, organisations ou bien l'entité propriétaire du service elle-même. Cette menace peut être permise par un contrôle d'accès insuffisant ou le piratage de comptes d'utilisateurs (vol d'identifiant / mot de passe) ou plus grave d'administrateurs permettant la prise de contrôle du service, ou encore par la surveillance d'un trafic non chiffré. Les impacts pour le propriétaire du service peuvent être graves en termes de responsabilité juridique et d'image.",
    },
    surveillance: {
      description: 'La surveillance',
      descriptionLongue: "La menace d'accès illégitime à un échange, à des données à des fins d'information, de renseignement peut viser les services permettant les échanges entre personnes, des données sensibles stockées susceptibles d'intéresser des concurrents ou entités malveillantes souhaitant exploiter ses données à des fins de renseignement. Cette menace peut être permise par un contrôle d'accès insuffisant ou le piratage de comptes d'utilisateurs (vol d'identifiant / mot de passe) ou plus grave d'administrateurs permettant la prise de contrôle du service et l'accès à de nombreuses données, ou encore par la surveillance d'un trafic non chiffré.",
    },
    defigurationSiteWeb: {
      description: 'La défiguration',
      descriptionLongue: "Une défiguration est une attaque par laquelle une personne malveillante modifie le site pour remplacer le contenu légitime par un contenu qu'il choisit, par exemple pour relayer un message revendicatif, pour dénigrer le propriétaire du site ou simplement. L'attaque peut avoir des conséquences négatives en termes d'image pour le propriétaire du service.",
    },
    logicielsMalveillants: {
      description: 'Logiciels malveillants',
      descriptionLongue: "Votre service peut être attaqué en vue de devenir un véhicule pour la diffusion de logiciels malveillants aux utilisateurs de votre service. Cela est rendu possible par l'exploitation de vulnérabilités techniques de votre service, par exemple, si votre service n'a pas été développé avec précaution, si votre service repose sur des logiciels ou équipements n'ayant pas fait l'objet de correctifs de sécurité de vulnérabilités connues. Une telle attaque peut n'avoir aucun impact visible pour le propriétaire du site mais susciter des impacts forts pour les utilisateurs. L'usurpation d'accès d'administrateurs peut également permettre l'envoi de messages malveillants paraissant légitimes aux utilisateurs du service.",
    },
    arnaques: {
      description: 'Arnaques',
      descriptionLongue: "Votre service peut être utilisé à des fins d'arnaques, par exemple, par la création d'un service imitant le vôtre ou envoyant des mails ou SMS ayant l'apparence de messages légitimes, en vue de subtiliser des données, extorquer de l'argent. L'inclusion de code malveillant dans un service numérique peut permettre d'afficher du contenu illicite comme des arnaques au faux support technique.",
    },
  },

  categoriesMesures: {
    gouvernance: 'Gouvernance',
    protection: 'Protection',
    defense: 'Défense',
    resilience: 'Résilience',
  },

  statutsMesures: {
    fait: 'Fait',
    planifie: 'Planifié',
    nonFait: 'Non fait',
    nonRetenu: 'Non concerné',
  },

  mesures: {
    limitationInterconnexions: {
      description: "Identifier et limiter les interconnexions du service avec d'autres systèmes",
      categorie: 'gouvernance',
    },
    listeEquipements: {
      description: "Disposer d'une liste à jour des équipements et logiciels contribuant au fonctionnement du service",
      categorie: 'gouvernance',
    },
    identificationDonneesSensibles: {
      description: 'Identifier les données les plus sensibles à protéger',
      categorie: 'gouvernance',
      indispensable: true,
    },
    contactSecurite: {
      description: 'Rendre public un contact pour signaler un problème de sécurité',
      categorie: 'gouvernance',
    },
    exigencesSecurite: {
      description: 'Connaître les exigences de sécurité incombant aux sous-traitants du service',
      categorie: 'gouvernance',
    },
    modalitesSuivi: {
      description: 'Fixer les modalités du suivi de la sécurité du service entre les parties prenantes',
      categorie: 'gouvernance',
    },
    hebergementUE: {
      description: "Héberger le service au sein de l'Union européenne",
      categorie: 'gouvernance',
      indispensable: true,
    },
    secNumCloud: {
      description: "Héberger le service au sein d'un Cloud qualifié SecNumCloud",
      categorie: 'gouvernance',
    },
    interdictionParageVente: {
      description: 'Proscrire le partage ou la vente de données des utilisateurs du service à des tierces parties à des fins commerciales',
      categorie: 'gouvernance',
      indispensable: true,
    },
    sensibilisationRisques: {
      description: 'Réaliser des actions régulières de sensibilisation des agents aux risques numériques',
      categorie: 'gouvernance',
    },
    consignesSecurite: {
      description: "Fixer et sensibiliser les agents aux consignes de sécurité liées à l'utilisation du service",
      categorie: 'gouvernance',
      indispensable: true,
    },

    deconnexionAutomatique: {
      description: 'Mettre en place la déconnexion automatique des sessions utilisateurs après une certaine durée',
      categorie: 'protection',
      indispensable: true,
    },
    accesSecurise: {
      description: 'Prévoir un accès sécurisé des utilisateurs à leur compte',
      categorie: 'protection',
      indispensable: true,
    },
    franceConnect: {
      description: 'Permettre la connexion des utilisateurs via FranceConnect',
      categorie: 'protection',
    },
    listeComptesPrivilegies: {
      description: "Disposer d'une liste à jour des comptes disposant d'un d'accès privilégié au service",
      categorie: 'protection',
      indispensable: true,
    },
    gestionComptesAcces: {
      description: "Mettre en oeuvre une procédure de gestion des comptes d'accès",
      categorie: 'protection',
    },
    dissocierComptesAdmin: {
      description: 'Dissocier les accès, les comptes et les privilèges des agents à la fois utilisateurs et administrateurs',
      categorie: 'protection',
      indispensable: true,
    },
    limitationCreationComptes: {
      description: "Limiter la création de compte d'accès aux seuls comptes nominatifs",
      categorie: 'protection',
      indispensable: true,
    },
    doubleAuthentAdmins: {
      description: 'Prévoir la double authentification des administrateurs au service',
      categorie: 'protection',
      indispensable: true,
    },
    limitationAccesAdmin: {
      description: 'Limiter au strict nécessaire les accès administrateurs et tenir la liste à jour',
      categorie: 'protection',
      indispensable: true,
    },
    certificatChiffrement: {
      description: "Chiffrer le trafic avec l'utilisation d'un certificat conforme au référentiel général de sécurité",
      categorie: 'protection',
      indispensable: true,
    },
    differentiationFiltrage: {
      description: 'Différencier le filtrage des accès utilisateurs, agents et administrateurs',
      categorie: 'protection',
    },
    nomsDomaineSimilaires: {
      description: 'Acheter plusieurs noms de domaine proches du nom de domaine du service',
      categorie: 'protection',
    },
    securisationCode: {
      description: "Mettre en oeuvre des bonnes pratiques de sécurisation du code, comme celles de l'OWASP",
      categorie: 'protection',
      indispensable: true,
    },
    auditsSecurite: {
      description: "Prévoir l'organisation de contrôles et d'audits de sécurité réguliers",
      categorie: 'protection',
    },
    parefeu: {
      description: 'Installer un parefeu',
      categorie: 'protection',
      indispensable: true,
    },
    chiffrementFlux: {
      description: 'Désactiver tout flux non chiffré.',
      categorie: 'protection',
      indispensable: true,
    },
    protectionDeniService: {
      description: 'Souscrire à un service de protection contre les attaques de déni de service',
      categorie: 'protection',
    },
    hebergementMachineVirtuelle: {
      description: 'Héberger le service dans une machine virtuelle',
      categorie: 'protection',
      indispensable: true,
    },
    chiffrementMachineVirtuelle: {
      description: 'Chiffrer la machine virtuelle',
      categorie: 'protection',
    },
    misesAJour: {
      description: "Disposer d'une politique d'application des mises à jour fonctionnelles et de sécurité du service",
      categorie: 'protection',
      indispensable: true,
    },
    versionRecente: {
      description: "Utiliser une version récente des éléments applicatifs composant le service toujours maintenus par l'éditeur",
      categorie: 'protection',
      indispensable: true,
    },
    moindrePrivilege: {
      description: 'Configurer les applicatifs selon la règle du moindre privilège',
      categorie: 'protection',
      indispensable: true,
    },
    configurationMinimaliste: {
      description: 'Configurer le service selon la règle de la configuration minimaliste',
      categorie: 'protection',
      indispensable: true,
    },
    telechargementsOfficiels: {
      description: "Permettre exclusivement le téléchargement d'une application mobile depuis les magasins officiels",
      categorie: 'protection',
      indispensable: true,
    },

    gestionIncidents: {
      description: 'Définir une procédure de gestion des incidents de sécurité',
      categorie: 'defense',
      indispensable: true,
    },
    journalAcces: {
      description: "Disposer d'un journal de tous les accès",
      categorie: 'defense',
      indispensable: true,
    },
    notificationConnexionsSuspectes: {
      description: 'Envoyer aux administrateurs et utilisateurs une notification en cas de connexion suspecte',
      categorie: 'defense',
    },
    supervision: {
      description: 'Recourir à un service de supervision de la sécurité',
      categorie: 'defense',
    },
    testsProcedures: {
      description: "Tester régulièrement les procédures de gestion d'incident",
      categorie: 'defense',
    },
    affichageDerniereConnexion: {
      description: "Afficher aux utilisateurs l'heure et la date de leur dernière connexion",
      categorie: 'defense',
    },

    exerciceGestionCrise: {
      description: 'Planifier un exercice de gestion de crise, notamment face au risque de rançongiciel',
      categorie: 'resilience',
    },
    politiqueInformation: {
      description: "Disposer d'une politique d'information des utilisateurs en cas d'incident",
      categorie: 'resilience',
    },
    sauvegardeDonnees: {
      description: 'Mettre en place une sauvegarde régulière des données dans un environnement non connecté au service',
      categorie: 'resilience',
      indispensable: true,
    },
    sauvegardeMachineVirtuelle: {
      description: 'Mettre en place une sauvegarde en continu de la machine virtuelle sur lequel est déployé le service.',
      categorie: 'resilience',
    },
    testsSauvegardes: {
      description: 'Tester régulièrement les sauvegardes',
      categorie: 'resilience',
      indispensable: true,
    },
  },

  localisationsDonnees: {
    france: { description: 'France' },
    unionEuropeenne: { description: 'Union Européenne' },
    autre: { description: 'Autre' },
  },

  echeancesRenouvellement: {
    sixMois: { description: echeance('six mois'), expiration: expiration('six mois') },
    unAn: { description: echeance('un an'), expiration: expiration('un an') },
    deuxAns: { description: echeance('deux ans'), expiration: expiration('deux ans') },
  },
};
